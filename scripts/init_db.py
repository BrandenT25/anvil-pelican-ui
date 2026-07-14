import sqlite3
DB_PATH = "/anvil/scratch/x-bturner/pelican.db"
con = sqlite3.connect(DB_PATH)

cur = con.cursor()
cur.execute('CREATE TABLE IF NOT EXISTS datasets (' \
'id INTEGER PRIMARY KEY,' \
' name TEXT,' \
' description TEXT,' \
' path TEXT UNIQUE,' \
' format TEXT,' \
' streamable INTEGER,' \
' access TEXT,' \
' tags TEXT' \
')')

cur.execute('CREATE TABLE IF NOT EXISTS categories (' \
'name TEXT UNIQUE,' \
'url TEXT PRIMARY KEY,' \
'icon TEXT,' \
'description TEXT' \
')')

cur.execute('CREATE TABLE IF NOT EXISTS authorizedUsers ('\
'name TEXT UNIQUE' 
')')

con.commit()