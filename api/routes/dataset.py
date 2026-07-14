from fastapi import APIRouter
import json, os
from pathlib import Path
import sqlite3 


DB_PATH = "/anvil/scratch/x-bturner/pelican.db"
ROOTPATH = Path.cwd()
DATASET_PATH = os.path.join(ROOTPATH, "data", "datasets.json")
CATEGORY_PATH = os.path.join(ROOTPATH, "data", "categories.json")
datasetRouter = APIRouter()

@datasetRouter.get("/retrieve-datasets")
async def serveDatasets():
    result = []
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute('SELECT * FROM datasets')
    rows = cur.fetchall()
    con.close()
    for row in rows:
        current_row = {
            "id": row["id"],
            "name": row["name"],
            "description": row["description"],
            "path": row["path"],
            "format": row["format"],
            "streamable": bool(row["streamable"]),
            "access": row["access"],
            "tags" : json.loads(row["tags"])
        }
        result.append(current_row)
    return result

@datasetRouter.get("/retrieve-categories")
async def serveCategories():
    result = []
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute('SELECT * FROM categories')
    rows = cur.fetchall()
    con.close()
    for row in rows:
        current_row = {
            "name": row["name"],
            "url": row["url"],
            "icon": row["icon"],
            "description": row["description"],
        }
        result.append(row)
    return result
    





