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

package inventory

import(
	"context"
	"fmt"
	"net/http"
	"encoding/json"
	"github.com/jackc/pgx/v5"
	"io/ioutil"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"github.com/nadams128/oatnet/server/auth"
)

// Represents an item in the inventory.
type inventoryItem struct {
	Name string `json:"name"`
	Have float32 `json:"have"`
	Need float32 `json:"need"`
	Unit string `json:"unit"`
	CheckWeekly bool `json:"checkWeekly"`
	AmountNeededWeekly float32 `json:"amountNeededWeekly"`
}

// Takes a writer and a request, then routes to the proper function based on the HTTP method.
func RequestHandler(w http.ResponseWriter, r *http.Request) {
	conn, _ := pgx.Connect(context.Background(), "postgres://oatnet:password@127.0.0.1/oatnet")
	defer conn.Close(context.Background())
	switch r.Method {
		case "GET":
			getInventory(w, r, conn)
		case "POST":
			postInventory(w, r, conn)
		case "DELETE":
			deleteInventory(w, r, conn)
		case "OPTIONS":
			optionsInventory(w, r)
	}
}

// Retrieves an item or a set of items from the inventory. It returns anything that contains the query
// string, so that the response can be used to populate search results on the UI.
func getInventory(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	w.Header().Set("Access-Control-Allow-Origin","*")
	// run ParseForm to populate r.Form with the query parameters of the request
	formParseError := r.ParseForm()
	if formParseError != nil {
		fmt.Println(formParseError)
	}
	var requestedRows pgx.Rows
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	read, _ := auth.CheckPermissions(sessionID, conn)
	if read {
		// pull the item and/or filter from the query parameters of the request
		item, itemParamExists := r.Form["item"]
		filter, filterParamExists := r.Form["filter"]
		var selectErr error
		if itemParamExists {
			requestedRows, selectErr = conn.Query(context.Background(), "SELECT * FROM inventory WHERE name LIKE $1 ORDER BY name;", "%"+cases.Title(language.AmericanEnglish).String(item[0])+"%")
		} else if filterParamExists {
			switch filter[0] {
			case "all":
				requestedRows, selectErr = conn.Query(context.Background(), "SELECT * FROM inventory ORDER BY name;")
			case "weekly":
				requestedRows, selectErr = conn.Query(context.Background(), "SELECT * FROM inventory WHERE checkweekly=$1 ORDER BY name;", true)
			case "needed":
				requestedRows, selectErr = conn.Query(context.Background(), "SELECT * FROM inventory WHERE NOT need=0 ORDER BY name;")
			}
		} else {
			requestedRows, selectErr = conn.Query(context.Background(), "SELECT * FROM inventory ORDER BY name;")
		}
		if selectErr != nil {
			fmt.Println(selectErr)
		}
		var name string
		var have float32
		var need float32
		var unit string
		var checkWeekly bool
		var amountNeededWeekly float32
		// iterate through the rows requested from the database and format each entry into an inventoryItem object
		responseList, _ := pgx.CollectRows(requestedRows, func(row pgx.CollectableRow) (inventoryItem, error) {
			err := row.Scan(&name, &have, &need, &unit, &checkWeekly, &amountNeededWeekly, nil, nil)
			return inventoryItem{name, have, need, unit, checkWeekly, amountNeededWeekly}, err
		})
		var jsonResponseList, marshalErr = json.Marshal(responseList)
		if marshalErr != nil {
			fmt.Println(marshalErr)
		}
		w.Write(jsonResponseList)
	}
}
// Adds an item to the inventory, or updates an existing item
func postInventory(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	var responseMessage string = "Item transaction failed! D:"
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	_, write := auth.CheckPermissions(sessionID, conn)
	if write {
		var item inventoryItem
		// read the body in as bytes so it can be converted into an inventoryItem
		receivedBytes, readErr := ioutil.ReadAll(r.Body)
		if readErr != nil {
			fmt.Println(readErr)
		}
		unmarshalErr := json.Unmarshal(receivedBytes, &item)
		if unmarshalErr != nil {
			fmt.Println(unmarshalErr)
		}
		// check if the item exists to determine if it should be added or used to update an item
		requestedItem, _ := conn.Query(context.Background(), "SELECT * FROM inventory WHERE name=$1;", cases.Title(language.AmericanEnglish).String(item.Name))
		var requestedItemExists bool = requestedItem.Next()
		requestedItem.Close()
		if requestedItemExists {
			_,updateErr := conn.Exec(context.Background(), "UPDATE inventory SET have=$1, need=$2, unit=$3, checkweekly=$4, amountneededweekly=$5 WHERE name=$6;", item.Have, item.Need, item.Unit, item.CheckWeekly, item.AmountNeededWeekly, cases.Title(language.AmericanEnglish).String(item.Name))
			responseMessage = "Item updated! :D"
			if updateErr != nil {
				fmt.Println(updateErr)
			}
		} else {
			_,insertErr := conn.Exec(context.Background(), "INSERT INTO inventory VALUES($1,$2,$3,$4,$5,$6,false,0);", cases.Title(language.AmericanEnglish).String(item.Name), item.Have, item.Need, item.Unit, item.CheckWeekly, item.AmountNeededWeekly)
			responseMessage = "Item added! :D"
			if insertErr != nil {
				fmt.Println(insertErr)
			}
		}
	}
	var jsonResponseMessage, marshalErr = json.Marshal(responseMessage)
	if marshalErr != nil {
		fmt.Println(marshalErr)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponseMessage)
}

// Deletes an item from the inventory.
func deleteInventory(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	// run ParseForm to populate r.Form with the query parameters of the request
	formParseError := r.ParseForm()
	if formParseError != nil {
		fmt.Println("formParseError ", formParseError)
	}
	var responseMessage string = "Delete failed! D:"
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	_, write := auth.CheckPermissions(sessionID, conn)
	if write {
		item, itemParamExists := r.Form["item"]
		if itemParamExists {
			_, deleteErr := conn.Exec(context.Background(), "DELETE FROM inventory WHERE name=$1;", cases.Title(language.AmericanEnglish).String(item[0])) 
			if deleteErr != nil {
				fmt.Println("deleteErr ", deleteErr)
			} else {
				responseMessage = "Item deleted! :D"
			}
		}
	}
	var jsonResponseMessage, marshalErr = json.Marshal(responseMessage)
	if marshalErr != nil {
		fmt.Println("marshalErr ", marshalErr)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponseMessage)
}

// Returns the options that the browser asks for in its preflight requests
func optionsInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, sessionID")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST, DELETE")
}
