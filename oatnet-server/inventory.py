from flask import (Blueprint, jsonify, request, make_response)
from . import db

# create blueprint for this module
bp = Blueprint('inventory', __name__)

domain = "http://localhost:3000"

# handle incoming get requests
@bp.route("/inventory/<string:item>", methods=["GET"])
def getInventory(item):
    inv = db.connect_db()
    cursor = inv.cursor()
    responseList = []
    if (item != ""):
        serverData = cursor.execute("SELECT * from inventory WHERE id LIKE '%"+item+"%'").fetchall()
        print("SELECT * from inventory WHERE id LIKE '"+item+"'")
        
        print(serverData)
        for row in serverData:
            responseList.append([row[0],row[1],row[2],row[3],row[4],row[5]])
            print([row[0],row[1],row[2],row[3],row[4],row[5]])
    response = jsonify(responseList)
    response.headers.add("Access-Control-Allow-Origin", domain)
    return response

# handle incoming post requests
@bp.route("/inventory", methods=["OPTIONS", "POST"])
def postInventory():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", domain)
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "OPTIONS")
        return response
    elif request.method == "POST":
        inv = db.connect_db()
        cursor = inv.cursor()
        print(request.json)
        try:
            print(cursor.execute("SELECT * from inventory WHERE id = '"+(request.json[0].replace(" ","-")).lower()+"'").fetchone())
            if(cursor.execute("SELECT * from inventory WHERE id = '"+(request.json[0].replace(" ","-")).lower()+"'").fetchone()):
                cursor.execute("UPDATE inventory SET have ='"+request.json[1]+"', need ='"+ request.json[2] +"' WHERE id='"+(request.json[0].replace(" ","-")).lower()+"'")
            else:
                cursor.execute("INSERT INTO inventory(id, name, have, need, type, avgprice) VALUES ('"+((request.json[0].replace(" ","-")).lower())+"','"+request.json[0]+"','"+request.json[1]+"','"+request.json[2]+"','none','0.00')")
            response = jsonify("Data entry successful!")
        except:
            response = jsonify("Data entry failed!")
        inv.commit()
        response.headers.add("Access-Control-Allow-Origin", domain)
        print(request.json)
        return response