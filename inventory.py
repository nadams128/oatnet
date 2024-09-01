from flask import (Blueprint, jsonify, request, make_response)
from . import db

# create blueprint for this module
bp = Blueprint('inventory', __name__)

domain = "*"


# handle incoming options requests
@bp.route("/inventory", methods=["OPTIONS"])
def optionsInventory():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", domain)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "OPTIONS, POST, DELETE")
    return response

# handle incoming post requests
@bp.route("/inventory", methods=["POST", "DELETE"])
def modifyInventory():
    inv = db.connect_db()
    cursor = inv.cursor()
    if request.method == "POST":
        try:
            if (cursor.execute("SELECT * from inventory WHERE id = '"+(request.json[0].replace(" ","-")).lower()+"'").fetchone()):
                cursor.execute("UPDATE inventory SET have ='"+(request.json[1][0].upper()+request.json[1][1:])+"', need ='"+(request.json[2][0].upper()+request.json[2][1:])+"', checkweekly ='"+request.json[3]+"' WHERE id='"+(request.json[0].replace(" ","-")).lower()+"'")
            else:
                cursor.execute("INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES ('"+((request.json[0].replace(" ","-")).lower())+"','"+request.json[0].title()+"','"+(request.json[1][0].upper()+request.json[1][1:])+"','"+(request.json[2][0].upper()+request.json[2][1:])+"','"+request.json[3]+"','0.00','none','none')")
            response = jsonify("Data entry successful!")
        except:
            response = jsonify("Data entry failed!")
        inv.commit()
        response.headers.add("Access-Control-Allow-Origin", domain)
        return response
    if request.method == "DELETE":
        if (request.args and request.args["item"]):
            item = request.args["item"]
            inv = db.connect_db()
            cursor = inv.cursor()
            if (item != ""):
                cursor.execute("DELETE from inventory WHERE id = '"+item.lower()+"'")
            inv.commit()
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

# handle incoming get requests
@bp.route("/inventory", methods=["GET"])
def getInventory():
    inv = db.connect_db()
    cursor = inv.cursor()
    responseList = []
    if (request.args and request.args["item"]):
        item = request.args["item"]
        if (item == "weekly"):
            serverData = cursor.execute("SELECT * from inventory WHERE checkweekly='true'").fetchall()
            for row in serverData:
                responseList.append([row[0],row[1],row[2],row[3],row[4]])
        elif (item == "needed"):
            serverData = cursor.execute("SELECT * from inventory").fetchall()
            for row in serverData:
                if (row[3][0]!="0" and row[3][0].lower()!="n"):
                    responseList.append([row[0],row[1],row[2],row[3],row[4]])
        else:
            serverData = cursor.execute("SELECT * from inventory WHERE id LIKE '%"+item.lower()+"%'").fetchall()
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