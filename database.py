import sqlite3
import click
import secrets
import bcrypt
from flask import current_app, g

# initialization function for oatnet-server setup
def init_db():
	# connect to the database
	db = connect_db()
	# run the schema to reformat the database
	with current_app.open_resource('schema.sql') as f:
		db.executescript(f.read().decode('utf8'))
	# generate the administrator account
	cursor = db.cursor()
	password = secrets.token_hex(16)
	hashSalt = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
	cursor.execute("INSERT INTO users(username, password) VALUES ('administrator','" + hashSalt + "')")
	cursor.execute("INSERT INTO permissions(username, read, write) VALUES ('administrator',1,1)")
	db.commit()
	# print the administrator password to the CLI
	click.echo("The initial administrator password is: " + password)

# get the database info from the app and connect to it
def connect_db():
	if 'db' not in g:
		g.db = sqlite3.connect(
			current_app.config['DATABASE'],
			detect_types=sqlite3.PARSE_DECLTYPES
		)
		g.db.row_factory = sqlite3.Row
	return g.db

# disconnect from the database if it exists
def disconnect_db(e=None):
	db = g.pop('db', None)
	if db is not None:
		db.close()

# CLI command to clear existing data, create new tables based off of the schema, generate the administrator and display its password
@click.command('init-db')
def init_db_command():
	init_db()
	click.echo("Database Initialized!")
