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

package main

import(
	"github.com/nadams128/oatnet/server/inventory"
	"github.com/nadams128/oatnet/server/auth"
	"github.com/nadams128/oatnet/server/containersets"
	"github.com/nadams128/oatnet/server/logger"
	"net/http"
	"fmt"
	//"bufio"
	//"strings"
	//"os"
	"context"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
	"crypto/rand"
)

func main() {
	//reader := bufio.NewReader(os.Stdin)
	logger.Clear()
	fmt.Println("+-----------------------------------------------------------+")
	fmt.Println("|                                                           |")
	fmt.Println("|    ██████╗  █████╗ ████████╗███╗   ██╗███████╗████████╗   |")
	fmt.Println("|   ██╔═══██╗██╔══██╗╚══██╔══╝████╗  ██║██╔════╝╚══██╔══╝   |")
	fmt.Println("|   ██║   ██║███████║   ██║   ██╔██╗ ██║█████╗     ██║      |")
	fmt.Println("|   ██║   ██║██╔══██║   ██║   ██║╚██╗██║██╔══╝     ██║      |")
	fmt.Println("|   ╚██████╔╝██║  ██║   ██║   ██║ ╚████║███████╗   ██║      |")
	fmt.Println("|    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝╚══════╝   ╚═╝      |")
	fmt.Println("|                                                           |")
	fmt.Println("+-----------------------------------------------------------+")
	fmt.Println("")
	fmt.Println("+-- Oatnet Start Options --+")
	fmt.Println("start : Start the server for this oatnet instance")
	fmt.Println("reformat-oatnet-instance : Delete and recreate the database of this oatnet instance")
	fmt.Println("")
	fmt.Println("+-----------------------------------------------------------+")
	fmt.Println("")
	fmt.Print("Type command: ")
	//userInput, _ := reader.ReadString('\n')
	//userInput = strings.Replace(userInput, "\n", "", -1)
	if true {
		logger.Info("Starting Oatnet Server")
		http.HandleFunc("/inv", inventory.RequestHandler)
		http.HandleFunc("/auth", auth.RequestHandler)
		http.HandleFunc("/containersets", containersets.RequestHandler)
		http.ListenAndServe(":8080", nil)
	} else if false {
		conn, connectionErr := pgx.Connect(context.Background(), "postgres://oatnet:password@127.0.0.1/oatnet")
		if connectionErr != nil {
			logger.Err(connectionErr)
		}
		defer conn.Close(context.Background())
		_, execErr := conn.Exec(context.Background(), "DROP TABLE IF EXISTS inventory;")
		_, execErr = conn.Exec(context.Background(), "DROP TABLE IF EXISTS users;")
		_, execErr = conn.Exec(context.Background(), "DROP TABLE IF EXISTS sessions;")
		_, execErr = conn.Exec(context.Background(), `CREATE TABLE inventory(
			name TEXT UNIQUE NOT NULL PRIMARY KEY,
			have REAL NOT NULL CHECK(have >= 0),
			need REAL NOT NULL CHECK(need >= 0),
			unit TEXT NOT NULL,
			checkweekly BOOLEAN NOT NULL,
			amountneededweekly REAL CHECK (amountneededweekly >= 0)
		);`)
		_, execErr = conn.Exec(context.Background(), `CREATE TABLE users(
			username TEXT UNIQUE NOT NULL PRIMARY KEY,
			password TEXT UNIQUE NOT NULL,
			read BOOLEAN NOT NULL,
			write BOOLEAN NOT NULL
		);`)
		_, execErr = conn.Exec(context.Background(), `CREATE TABLE sessions(
			sessionid TEXT UNIQUE NOT NULL PRIMARY KEY,
			username TEXT NOT NULL
		);`)
		_, execErr = conn.Exec(context.Background(), `CREATE TABLE containersets(
			name TEXT UNIQUE NOT NULL PRIMARY KEY,
			containers JSONB NOT NULL
		)`)
		adminPassword := rand.Text()
		// use the CSPRNG generated password to generate a hash for storage
		hash, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
		_, execErr = conn.Exec(context.Background(), "INSERT INTO users VALUES ('administrator', $1, true, true);", string(hash))
		if execErr != nil {
			logger.Err(execErr)
		}
		fmt.Println("Oatnet Admin Password (COPY THIS! You will not see its like again otherwise):")
		fmt.Println(adminPassword)
	}
}
