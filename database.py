import sqlite3
import click
import secrets
import bcrypt
from flask import current_app, g

# connect to the db, run the schema to reformat it, generate the administrator and print its password to the CLI
def init_db():
    db = connect_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))
    cursor = db.cursor()
    password = secrets.token_hex(16)
    hashSalt = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute("INSERT INTO users(username, password) VALUES ('administrator','" + hashSalt + "')")
    cursor.execute("INSERT INTO permissions(username, read, write) VALUES ('administrator',TRUE,TRUE)")
    db.commit()
    click.echo("The initial administrator password is: " + password)

# get the db info from the app and connect to it
def connect_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

# disconnect from the db if it exists
def disconnect_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# CLI command to clear existing data, create new tables based off of the schema, generate the administrator and display its password
@click.command('init-db')
def init_db_command():
    init_db()
    click.echo("Database Initialized!")