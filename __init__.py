import os
from flask import Flask
from . import (database, inventory, auth)

def create_app():
	# create app and configure it to connect to the database
	app = Flask(__name__, instance_relative_config=True)
	app.config.from_mapping(
		SECRET_KEY='dev',
		DATABASE=os.path.join(app.instance_path,'oatnet-server.sqlite'),
	)
	app.config.from_pyfile('config.py', silent=True)
	# set the app to disconnect on close
	app.teardown_appcontext(database.disconnect_db)
	# create CLI command to initialize db
	app.cli.add_command(database.init_db_command)

	# creates the instance folder for the sqlite data, if it doesn't already exist
	try:
		os.makedirs(app.instance_path)
	except OSError:
		pass

	# registration for app blueprint(s)
	app.register_blueprint(inventory.bp)
	app.register_blueprint(auth.bp)

	return app
