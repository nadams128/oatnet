from flask import (Blueprint, jsonify, request, make_response)
from . import database
import bcrypt
import secrets

# create blueprint for this module
bp = Blueprint('auth', __name__)

# replace * with the URL of your Oatnet client
domain = "*"

# check the permissions for a given user's sessionID
def checkPermissions(sessionID):
    db = database.connect_db()
    cursor = db.cursor()
    if sessionID:
        requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID=?", (sessionID,)).fetchone()
        if requestingUser and requestingUser[0]:
            requestingUserPermissions = cursor.execute("SELECT read, write FROM permissions WHERE username=?", (requestingUser[0],)).fetchone()
            if requestingUserPermissions and requestingUserPermissions[0]:
                read = requestingUserPermissions[0] == True
                write = requestingUserPermissions[1] == True
                return [read, write]
    return None
            

# handle incoming options requests
@bp.route("/auth", methods=["OPTIONS"])
def optionsAuth():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", domain)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, sessionID, action")
    response.headers.add("Access-Control-Allow-Methods", "OPTIONS, POST, DELETE, GET")
    return response

# handle incoming post requests
@bp.route("/auth", methods=["POST"])
def modifyUsers():
    db = database.connect_db()
    cursor = db.cursor()
    response = make_response()
    if request.headers and request.headers["action"]:
        if request.headers["action"] == "login":
            # if the request has a username and password, assign the readable values accordingly
            if request.json and request.json[0] and request.json[1]:
                username = request.json[0].lower()
                password = request.json[1]
                # search the username table for a user with the same username that's being sent in
                user = cursor.execute("SELECT username FROM users WHERE username=?",(username,)).fetchone()
                # if there isn't an existing user that matches the incoming one, then register a new user
                if not user:
                    # salt and hash the incoming password
                    hashSalt = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    # generate a sessionID with a CSPRNG
                    sessionID = secrets.token_hex(8)
                    # generate the initial data in the database relations
                    cursor.execute("INSERT INTO users(username, password) VALUES (?,?)",(username, hashSalt))
                    cursor.execute("INSERT INTO permissions(username, read, write) VALUES (?,?,?)",(username, False, False))
                    cursor.execute("INSERT INTO sessions(sessionid, username) VALUES (?,?)",(sessionID, username))
                    response = jsonify(sessionID)
                # if there is a matching user, log them in
                if user:
                    userPassword = cursor.execute("SELECT password FROM users WHERE username=?",(username,)).fetchone()[0]
                    if bcrypt.checkpw(password.encode('utf-8'), userPassword.encode('utf-8')):
                        sessionID = secrets.token_hex(8)
                        cursor.execute("INSERT INTO sessions(sessionid, username) VALUES (?,?)",(sessionID, username))
                        response = jsonify(sessionID)
                    else:
                        response = jsonify("Incorrect Password!")
        elif request.headers["action"] == "logout":
            if request.json:
                cursor.execute("DELETE FROM sessions WHERE sessionid=?",(request.json,))
        elif request.headers["action"] == "change_permissions" and request.headers["sessionID"]:
            requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID=?",(request.headers["sessionID"],)).fetchone()
            if requestingUser and requestingUser[0] == "administrator":
                if request.json:
                    username = None
                    read = False
                    write = False
                    if request.json[0]:
                        username = request.json[0].lower()
                    if request.json[1] and request.json[1] == 1:
                        read = True
                    if request.json[2] and request.json[2] == 1:
                        write = True
                    cursor.execute("UPDATE permissions SET read=?, write=? WHERE username=?",(read, write, username))
                    response = jsonify("User permissions for "+username+" have been updated")
            else:
                response = jsonify(["You aren't an administrator"])
    db.commit()
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response

@bp.route("/auth", methods=["DELETE"])
def deleteUser():
    response = make_response()
    db = database.connect_db()
    cursor = db.cursor()
    if request.headers["sessionID"]:
        requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID=?",(request.headers["sessionID"],)).fetchone()
        if requestingUser and requestingUser[0] == "administrator" and request.json:
            username = (request.json).lower()
            cursor.execute("DELETE FROM users WHERE username=?",(username,))
            cursor.execute("DELETE FROM sessions WHERE username=?",(username,))
            cursor.execute("DELETE FROM permissions WHERE username=?",(username,))
            response = jsonify(["User "+username+" deleted successfully!"])
        else:
            response = jsonify(["You aren't an administrator"])
    db.commit()
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response

@bp.route("/auth", methods=["GET"])
def getUsers():
    response = make_response()
    db = database.connect_db()
    cursor = db.cursor()
    if request.headers["sessionID"]:
        requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID=?",(request.headers["sessionID"],)).fetchone()
        if requestingUser and requestingUser[0] == "administrator":
            allUsersRows = cursor.execute("SELECT username, read, write FROM permissions").fetchall()
            allUsers = []
            for user in allUsersRows:
                if user[0] != "administrator":
                    read = False
                    write = False
                    if user[1] == 1:
                        read = True
                    if user[2] == 1:
                        write = True
                    allUsers.append([user[0], read, write])
            response = jsonify(allUsers)
        else:
            response = jsonify(["You aren't an administrator"])
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response