from flask import (Blueprint, jsonify, request, make_response)
from . import database, auth

# create blueprint for this module
bp = Blueprint('inventory', __name__)

# replace * with the URL of your Oatnet client
domain = "*"

# handle incoming options requests
@bp.route("/inv", methods=["OPTIONS"])
def optionsInventory():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", domain)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, sessionID")
    response.headers.add("Access-Control-Allow-Methods", "OPTIONS, POST, DELETE")
    return response

# handle incoming requests that modify the inventory
@bp.route("/inv", methods=["POST", "DELETE"])
def modifyInventory():
    permissions = auth.checkPermissions(request.headers["sessionID"])
    write = None
    if permissions:
        write = permissions[1]
        if write:
            db = database.connect_db()
            cursor = db.cursor()
            if request.method == "POST":
                id = None
                have = None
                need = None
                checkWeekly = None
                try:
                    id = request.json[0].replace(" ","").lower()
                    name = request.json[0].title()
                    have = (request.json[1][0].upper()+request.json[1][1:])
                    need = (request.json[2][0].upper()+request.json[2][1:])
                    checkWeekly = request.json[3]
                    if (cursor.execute("SELECT * FROM inventory WHERE id=?",(id,)).fetchone()):
                        cursor.execute("UPDATE inventory SET have=?, need=?, checkweekly=? WHERE id=?",(have, need, checkWeekly, id))
                    else:
                        cursor.execute("INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES (?,?,?,?,?,'0.00','none','none')",(id, name, have, need, checkWeekly))
                    response = jsonify("Data entry successful!")
                except Exception as e:
                    print(e)
                    response = jsonify("Data entry failed!")
                db.commit()
                response.headers.add("Access-Control-Allow-Origin", domain)
                return response
            if request.method == "DELETE":
                if (request.args and request.args["item"]):
                    item = request.args["item"]
                    db = database.connect_db()
                    cursor = db.cursor()
                    if (item):
                        cursor.execute("DELETE from inventory WHERE id=?",(item.lower(),))
                    db.commit()
                    response = make_response()
                    response.headers.add("Access-Control-Allow-Origin", domain)
                    return response
    response = jsonify(["You don't have permissions for that!"])
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response

# handle incoming get requests
@bp.route("/inv", methods=["GET"])
def getInventory():
    permissions = auth.checkPermissions(request.headers["sessionID"])
    read = None
    if permissions:
        read = permissions[0]
        if read:
            db = database.connect_db()
            cursor = db.cursor()
            responseList = []
            if (request.args and request.args["item"]):
                item = request.args["item"]
                if item:
                    if (item == "weekly"):
                        serverData = cursor.execute("SELECT * from inventory WHERE checkweekly=?",(True,)).fetchall()
                        for row in serverData:
                            responseList.append([row[0],row[1],row[2],row[3],row[4]])
                    elif (item == "needed"):
                        serverData = cursor.execute("SELECT * from inventory WHERE NOT (need LIKE '0%' OR need LIKE 'N%')").fetchall()
                        for row in serverData:
                            responseList.append([row[0],row[1],row[2],row[3],row[4]])
                    else:
                        serverData = cursor.execute("SELECT * from inventory WHERE id LIKE ?",("%"+item.lower()+"%",)).fetchall()
                        for row in serverData:
                            responseList.append([row[0],row[1],row[2],row[3],row[4]])
            else:
                serverData = cursor.execute("SELECT * from inventory").fetchall()
                for row in serverData:
                    responseList.append([row[0],row[1],row[2],row[3],row[4]])
            responseList.sort(key=lambda x: x[1])
            response = jsonify(responseList)
            response.headers.add("Access-Control-Allow-Origin", domain)
            return response
    response = jsonify(["You don't have permissions for that!"])
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response