import sqlite3
from api.core.config import DB_PATH

def is_authorized(user: str) -> bool:
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT 1 FROM authorizedUsers WHERE name = ?", (user,))
    result = cur.fetchone()
    con.close()
    return result is not None