package logger

import (
	"os"
	"log"
	"time"
	"runtime"
	"strconv"
	"strings"
)

var logger *log.Logger

func init() {
	os.Mkdir("logs", os.ModePerm)
	var logFile *os.File
	logFile, _ = os.OpenFile("logs/oatnet.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, os.ModePerm)
	logger = log.New(logFile, time.Now().Format(time.UnixDate), 0)
}

func Info(message string) {
	_, fileName, lineNumber, _ := runtime.Caller(1)
	fileName = string(fileName[strings.LastIndex(fileName, "/")+1:])
	logger.Println(" ||  info  || " + fileName + ":" + strconv.Itoa(lineNumber) + " || " +  message)
}

func Err(err error) {
	_, fileName, lineNumber, _ := runtime.Caller(1)
	fileName = string(fileName[strings.LastIndex(fileName, "/")+1:])
	logger.Println(" || ERROR! || " +  fileName + ":" + strconv.Itoa(lineNumber) + " || " + err.Error())
}

func Clear() {
	os.Remove("logs/oatnet.log")
	var logFile *os.File
	logFile, _ = os.OpenFile("logs/oatnet.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, os.ModePerm)
	logger = log.New(logFile, time.Now().Format(time.UnixDate), 0)
}
