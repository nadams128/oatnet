import os
from flask import Flask
from . import (db, inventory)

def create_app():
    # create app and configure it to connect to db
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path,'oatnet-server.sqlite'),
    )
    app.config.from_pyfile('config.py', silent=True)
    # set the app to disconnect on close, create CLI command to initialize db
    app.teardown_appcontext(db.disconnect_db)
    app.cli.add_command(db.init_db_command)

    # creates the instance folder for the sqlite data, if it doesn't already exist
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # registration for app blueprint(s)
    app.register_blueprint(inventory.bp)

    return app