from flask import (Blueprint, jsonify, request, make_response)
from . import database
import bcrypt
import secrets

# create blueprint for this module
bp = Blueprint('auth', __name__)

# replace * with the URL of your Oatnet client
domain = "*"

def checkPermissions(sessionID):
    db = database.connect_db()
    cursor = db.cursor()
    requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID='"+sessionID+"'").fetchone()[0]
    requestingUserPermissions = cursor.execute("SELECT read, write FROM permissions WHERE username='"+requestingUser+"'").fetchone()
    return [requestingUserPermissions[0], requestingUserPermissions[1]]

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
            if request.json and request.json[0] and request.json[1]:
                username = request.json[0]
                password = request.json[1]
                user = cursor.execute("SELECT username FROM users WHERE username='"+username+"'").fetchone()
                if not user:
                    hashSalt = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    sessionID = secrets.token_hex(8)
                    cursor.execute("INSERT INTO users(username, password) VALUES ('" + username + "','"+ hashSalt + "')")
                    cursor.execute("INSERT INTO permissions(username, read, write) VALUES ('" + username + "',FALSE,FALSE)")
                    cursor.execute("INSERT INTO sessions(sessionid, username) VALUES ('" + sessionID + "','" + username + "')")
                    response = jsonify(sessionID)
                if user:
                    userPassword = cursor.execute("SELECT password FROM users WHERE username='"+username+"'").fetchone()[0]
                    if bcrypt.checkpw(password.encode('utf-8'), userPassword.encode('utf-8')):
                        sessionID = secrets.token_hex(8)
                        cursor.execute("INSERT INTO sessions(sessionid, username) VALUES ('" + sessionID + "','" + username + "')")
                        response = jsonify(sessionID)
                    else:
                        response = jsonify("Incorrect Password!")
        elif request.headers["action"] == "logout":
            if request.json:
                cursor.execute("DELETE FROM sessions WHERE sessionid = '" + request.json + "'")
        elif request.headers["action"] == "change_permissions":
            requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID='"+request.headers["sessionID"]+"'").fetchone()
            username = request.json[0]
            read = None
            write = None
            if request.json[1]:
                read = "TRUE"
            else:
                read = "FALSE"
            if request.json[2]:
                write = "TRUE"
            else:
                write = "FALSE"
            # Same concern as the administrator check in getUsers()
            if requestingUser and requestingUser[0] == "administrator":
                cursor.execute("UPDATE permissions SET read="+read+", write="+write+" WHERE username='"+username+"'")
                response = jsonify("User permissions for "+username+" have been updated")
            else:
                response = jsonify(["You aren't an administrator"])
    db.commit()
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response

@bp.route("/auth", methods=["DELETE"])
def deleteUser():
    response = None
    db = database.connect_db()
    cursor = db.cursor()
    requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID='"+request.headers["sessionID"]+"'").fetchone()
    if requestingUser and requestingUser[0] == "administrator":
        print(request.json)
        cursor.execute("DELETE FROM permissions WHERE username ='"+request.json+"'")
        response = jsonify(["User "+request.json+" deleted successfully!"])
    else:
        response = jsonify(["You aren't an administrator"])
    db.commit()
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response

@bp.route("/auth", methods=["GET"])
def getUsers():
    response = None
    db = database.connect_db()
    cursor = db.cursor()
    requestingUser = cursor.execute("SELECT username FROM sessions WHERE sessionID='"+request.headers["sessionID"]+"'").fetchone()
    '''
        Possible weak point? I don't think it's possible atm, but could someone create a invalid sessionID that still has the username 
        "administrator" in order to bypass this check?
        
        I don't think so because atm, the only way to get a valid sessionID with the username "administrator would be to login as the
        administrator with the correct password, since creating a new account with "administrator" as the username and a different password 
        wouldn't work because of the "if not user"/"if user" check
    '''
    if requestingUser and requestingUser[0] == "administrator":
        allUsersRows = cursor.execute("SELECT username, read, write FROM permissions").fetchall()
        allUsers = []
        for user in allUsersRows:
            if user[0] != "administrator":
                allUsers.append([user[0], user[1], user[2]])
        response = jsonify(allUsers)
    else:
        response = jsonify(["You aren't an administrator"])
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response