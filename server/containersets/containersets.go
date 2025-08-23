package containersets

import(
	"context"
	"net/http"
	"encoding/json"
	"github.com/jackc/pgx/v5"
	"io/ioutil"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"github.com/nadams128/oatnet/server/auth"
	"github.com/nadams128/oatnet/server/logger"
)

type container struct {
	Name string `json:"name"`
	Percentage int `json:"percentage"`
}

type containerSet struct {
	Name string `json:"name"`
	Containers []container `json:"containers"`
}

func RequestHandler(w http.ResponseWriter, r *http.Request) {
	conn, connectionErr := pgx.Connect(context.Background(), "postgres://oatnet:password@127.0.0.1/oatnet")
	if connectionErr != nil {
		logger.Err(connectionErr)
	}
	defer conn.Close(context.Background())
	logger.Info("Handling " + r.Method + " request on /containersets")
	switch r.Method {
	case "GET":
		getContainerSet(w, r, conn)
	case "POST":
		postContainerSet(w, r, conn)
	case "DELETE":
		deleteContainerSet(w, r, conn)
	case "OPTIONS":
		optionsContainerSet(w, r, conn)
	}
}

func getContainerSet(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	formParseError := r.ParseForm()
	if formParseError != nil {
		logger.Err(formParseError)
	}
	var requestedRows pgx.Rows
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	read, _ := auth.CheckPermissions(sessionID, conn)
	if read {
		containerParam, containerParamExists := r.Form["container"]
		var selectErr error
		if containerParamExists {
			var requestedContainer string = containerParam[0]
			requestedRows, selectErr = conn.Query(context.Background(), "SELECT * FROM containersets WHERE name=$1", requestedContainer)
		} else {
			requestedRows, selectErr = conn.Query(context.Background(), "SELECT * FROM containersets ORDER BY name")
		}
		if selectErr != nil {
			logger.Err(selectErr)
		}
		var name string
		var jsonContainers string
		responseSlice, collectErr := pgx.CollectRows(requestedRows, func(row pgx.CollectableRow) (containerSet, error) {
			err := row.Scan(&name, &jsonContainers)
			var containers []container
			unmarshalErr := json.Unmarshal([]byte(jsonContainers), &containers)
			if unmarshalErr != nil {
				logger.Err(unmarshalErr)
			}
			return containerSet{name, containers}, err 
		})
		if collectErr != nil {
			logger.Err(collectErr)
		}
		var jsonResponse, marshalErr = json.Marshal(responseSlice)
		if marshalErr != nil {
			logger.Err(marshalErr)
		}
		w.Write(jsonResponse)
	}
}

func postContainerSet(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	var responseMessage string = "Container Set transaction failed! D:"
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	_, write := auth.CheckPermissions(sessionID, conn)
	if write {
		var incomingSet containerSet
		incomingBytes, readErr := ioutil.ReadAll(r.Body)
		if readErr != nil {
			logger.Err(readErr)
		}
		unmarshalErr := json.Unmarshal(incomingBytes, &incomingSet)
		if unmarshalErr != nil {
			logger.Err(unmarshalErr)
		}
		incomingSet.Name = cases.Title(language.AmericanEnglish).String(incomingSet.Name)
		for i, container := range incomingSet.Containers {
			incomingSet.Containers[i].Name = cases.Title(language.AmericanEnglish).String(container.Name)
		}
		jsonContainers, marshalErr := json.Marshal(incomingSet.Containers) 
		if marshalErr != nil {
			logger.Err(marshalErr)
		}
		_, insertErr := conn.Exec(context.Background(), "INSERT INTO containersets VALUES($1, $2);", incomingSet.Name, jsonContainers)
		if insertErr != nil {
			logger.Err(insertErr)
			_, updateErr := conn.Exec(context.Background(), "UPDATE containersets SET containers=$1 WHERE UPPER(name)=UPPER($2);", jsonContainers, incomingSet.Name)
			if updateErr != nil {
				logger.Err(updateErr)
			} else {
				responseMessage = "Container set updated! :D"
			}
		} else {
			responseMessage = "Container set added! :D"
		}
	}
	jsonResponseMessage, marshalErr := json.Marshal(responseMessage)
	if marshalErr != nil {
		logger.Err(marshalErr)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponseMessage)
}

func deleteContainerSet(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	formParseError := r.ParseForm()
	if formParseError != nil {
		logger.Err(formParseError)
	}
	var responseMessage string = "Delete failed! D:"
	sessionIDHeader := r.Header["Sessionid"]
	var sessionID string
	if sessionIDHeader != nil {
		sessionID = sessionIDHeader[0]
	}
	_, write := auth.CheckPermissions(sessionID, conn)
	if write {
		incomingContainer, containerParamExists := r.Form["container"]
		if containerParamExists {
			_, deleteErr := conn.Exec(context.Background(), "DELETE FROM containersets WHERE name=$1;", cases.Title(language.AmericanEnglish).String(incomingContainer[0]))
			if deleteErr != nil {
				logger.Err(deleteErr)
			} else {
				responseMessage = "Container set deleted! :D"
			}
		}
	}
	var jsonResponseMessage, marshalErr = json.Marshal(responseMessage)
	if marshalErr != nil {
		logger.Err(marshalErr)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponseMessage)
}

func optionsContainerSet(w http.ResponseWriter, r *http.Request, conn *pgx.Conn) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, sessionID")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST, DELETE")
}
