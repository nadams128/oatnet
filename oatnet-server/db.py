import sqlite3
import click
from flask import current_app, g

# connect to the db then run the schema to reformat it
def init_db():
    db = connect_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))

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

# CLI command to clear existing data and create new tables based off of the schema
@click.command('init-db')
def init_db_command():
    init_db()
    click.echo("Database Initialized!")