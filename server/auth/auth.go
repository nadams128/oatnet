//Oatnet - A utility application for mutual aid organizations
//Copyright (C) 2025 Oatnet

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU Affero General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU Affero General Public License for more details.

//You should have received a copy of the GNU Affero General Public License
//along with this program.  If not, see <https://www.gnu.org/licenses/>.

package auth

import(
	"context"
	"fmt"
	"net/http"
	"encoding/json"
	"github.com/jackc/pgx/v5"
	"io/ioutil"
	"golang.org/x/crypto/bcrypt"
	"crypto/rand"
)

// Takes a writer and a request, then routes to the proper function based on the HTTP method.
func RequestHandler(w http.ResponseWriter, r *http.Request) {
	conn, connectionError := pgx.Connect(context.Background(), "postgres://oatnet:password@127.0.0.1/oatnet")
	if connectionError != nil {
		fmt.Println("connectionError: ", connectionError)
	}
	defer conn.Close(context.Background())
	switch r.Method {
	case "GET":
		getUser(w, r, conn)
	case "POST":
		postUser(w, r, conn)
	case "DELETE":
		deleteUser(w, r, conn)
	case "OPTIONS":
		optionsUser(w)
	}
}

// Takes a sessionID and returns a pair of booleans (read, write) representing the permissions of
// the user that the sessionID belongs to
func CheckPermissions(sessionID string, conn *pgx.Conn) (bool, bool) {
	row := conn.QueryRow(context.Background(), "SELECT username FROM sessions WHERE sessionid=$1;", sessionID)
	var username string
	scanErr := row.Scan(&username)
	if scanErr != nil {
		fmt.Println("Error scanning in username in CheckPermissions: ", scanErr)
	}
	row = conn.QueryRow(context.Background(), "SELECT read, write FROM users WHERE UPPER(username) LIKE UPPER($1);", username)
	var read bool
	var write bool
	scanErr = row.Scan(&read, &write)
	if scanErr != nil {
		fmt.Println("Error scanning in permissions in CheckPermissions: ", scanErr)
	}
	return read, write
}

// Retrieves all users as long as the requesting user is an administrator
func getUser(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	var read, _ = CheckPermissions(sessionID, conn)
	if read {
		row := conn.QueryRow(context.Background(), "SELECT username FROM sessions WHERE sessionid=$1;", sessionID)
		var requestingUser string
		scanRequestingUserErr := row.Scan(&requestingUser)
		if scanRequestingUserErr != nil {
			fmt.Println("Error scanning the requested user: ", scanRequestingUserErr)
		}
		if requestingUser == "administrator" {
			rows, selectAllUsersErr := conn.Query(context.Background(), "SELECT username, read, write FROM users;")
			if selectAllUsersErr != nil {
				fmt.Println("Error when selecting all users: ", selectAllUsersErr)
			}
			type getUser struct {
				Username string `json:"username"`
				Read bool `json:"read"`
				Write bool `json:"write"`
			}
			var username string
			var read bool
			var write bool
			// iterate through the rows requested from the database and format each entry into an getUser object
			allUsers, rowsCollectErr := pgx.CollectRows(rows, func(row pgx.CollectableRow) (getUser, error) {
				err := row.Scan(&username, &read, &write)
				return getUser{username, read, write}, err
			})
			if rowsCollectErr != nil {
				fmt.Println("Error collecting rows: ", rowsCollectErr)
			}
			jsonResponse, marshalErr := json.Marshal(allUsers)
			if marshalErr != nil {
				fmt.Println("marshal error: ", marshalErr)
			}
			w.Write(jsonResponse)
		}
	}
}

// Adds a user to the server
func postUser(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	actionHeader := r.Header["Action"]
	var action string
	if actionHeader != nil {
		action = actionHeader[0]
	}
	var sessionID string
	var username string
	// read the body in as bytes so it can be converted into a usable object
	receivedBytes, readErr := ioutil.ReadAll(r.Body)
	if readErr != nil {
		fmt.Println("read error: ", readErr)
	}
	if action == "login" {
		type loginUser struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		var user loginUser
		unmarshalErr := json.Unmarshal(receivedBytes, &user)
		if unmarshalErr != nil {
			fmt.Println("unmarshal error: ", unmarshalErr)
		}
		row := conn.QueryRow(context.Background(), "SELECT username FROM users WHERE UPPER(username) LIKE UPPER($1);", user.Username) 
		scanErr := row.Scan(&username)
		if scanErr != nil {
			fmt.Println("Error scanning user when checking if they exist: ", scanErr)
		}
		// if the user already exists
		if username != "" {
			var storedPassword string
			var row = conn.QueryRow(context.Background(), "SELECT password FROM users WHERE UPPER(username) LIKE UPPER($1);", username)
			scanErr = row.Scan(&storedPassword)
			if scanErr != nil {
				fmt.Println("Error scanning in stored password: ", scanErr)
			}
			wrongPasswordErr := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password))
			if wrongPasswordErr == nil {
				sessionID = rand.Text()
				_, insertErr := conn.Exec(context.Background(), "INSERT INTO sessions(sessionid, username) VALUES ($1, $2);", sessionID, username)
				if insertErr != nil {
					fmt.Println("Error adding new session for existing user: ", insertErr)
				}
			} else if wrongPasswordErr != nil {
				fmt.Println("Wrong password error: ", wrongPasswordErr)
			}
		// if the user doesn't already exist
		} else if username == "" {
			hash, hashErr := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
			if hashErr != nil {
				fmt.Println("Error when hashing password: ", hashErr)
			}
			sessionID = rand.Text()
			var insertErr error
			_, insertErr = conn.Exec(context.Background(), "INSERT INTO users(username, password, read, write) VALUES ($1, $2, $3, $4);", user.Username, string(hash), false, false)
			_, insertErr = conn.Exec(context.Background(), "INSERT INTO sessions(sessionid, username) VALUES($1, $2);", sessionID, user.Username)
			if insertErr != nil {
				fmt.Println("Error when inserting new user data into db: ", insertErr)
			}
		}
	} else if action == "logout" {
		sessionIDHeader := r.Header["Sessionid"]
		var sessionID string
		if sessionIDHeader != nil {
			sessionID = sessionIDHeader[0]
		}
		if sessionID != "" {
			_, deleteErr := conn.Exec(context.Background(), "DELETE FROM sessions WHERE sessionid=$1;", sessionID)
			if deleteErr != nil {
				fmt.Println("Error deleting user from db: ", deleteErr)
			}
		}
	} else if action == "changepermissions" {
		sessionIDHeader := r.Header["Sessionid"]
		var sessionID string
		if sessionIDHeader != nil {
			sessionID = sessionIDHeader[0]
		}
		type permsUser struct {
			Username string `json:"username"`
			Read bool `json:"read"`
			Write bool `json:"write"`
		}
		var user permsUser
		unmarshalErr := json.Unmarshal(receivedBytes, &user)
		if unmarshalErr != nil {
			fmt.Println("unmarshal error: ", unmarshalErr)
		}
		row := conn.QueryRow(context.Background(), "SELECT username from sessions WHERE sessionID=$1;", sessionID)
		scanErr := row.Scan(&username)
		if scanErr != nil {
			fmt.Println("Error scanning user when checking if they're an administrator: ", scanErr)
		}
		if username == "administrator" {
			_, updateErr := conn.Exec(context.Background(), "UPDATE users SET read=$1, write=$2 WHERE username=$3;", user.Read, user.Write, user.Username)
			if updateErr != nil {
				fmt.Println("Error updating user permissions: ", updateErr)
			}
		}
	}
	jsonResponse, marshalErr := json.Marshal(sessionID)
	if marshalErr != nil {
		fmt.Println("Error marshaling response into JSON: ", marshalErr)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

// Deletes an existing user
func deleteUser(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	var user string
	var response string
	// read the body in as bytes so it can be converted into a string
	receivedBytes, readErr := ioutil.ReadAll(r.Body)
	if readErr != nil {
		fmt.Println("read error: ", readErr)
	}
	unmarshalErr := json.Unmarshal(receivedBytes, &user)
	if unmarshalErr != nil {
		fmt.Println("unmarshal error: ", unmarshalErr)
	}
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	if sessionID != "" {
		row := conn.QueryRow(context.Background(), "SELECT username from sessions WHERE sessionID=$1;", sessionID)
		var username string
		scanErr := row.Scan(&username)
		if scanErr != nil {
			fmt.Println("Error scanning user when checking if they're an administrator: ", scanErr)
		}
		if username == "administrator" {
			var deleteErr error
			_, deleteErr = conn.Exec(context.Background(), "DELETE FROM users WHERE username=$1;", user)
			_, deleteErr = conn.Exec(context.Background(), "DELETE FROM sessions WHERE username=$1;", user)
			if deleteErr != nil {
				fmt.Println("Error deleting user: ", deleteErr)
			}
		}
	}
	jsonResponse, marshalErr := json.Marshal(response)
	if marshalErr != nil {
		fmt.Println("Error marshaling response into JSON: ", marshalErr)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

// Returns the options that the browser asks for in its preflight requests
func optionsUser(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, sessionID, action")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST, DELETE")
}
