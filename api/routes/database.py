from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3, os, json
from api.auth import is_authorized
from api.core.config import DB_PATH

USER = os.environ.get("USER", "")

dbRouter = APIRouter()

class DatasetCreate(BaseModel):
    name : str
    description: str
    path: str
    format: str
    streamable: bool
    access: str
    tags: list[str]

class CategoryCreate(BaseModel):
    name: str
    url: str
    icon: str
    description: str

@dbRouter.post("/admin/add-dataset")
async def addDataset(dataset: DatasetCreate):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized") 
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        'INSERT INTO datasets (name, description, path, format, streamable, access, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (
            dataset.name,
            dataset.description,
            dataset.path,
            dataset.format,
            int(dataset.streamable),
            dataset.access,
            json.dumps(dataset.tags)
        )
    )
    con.commit()
    con.close()

@dbRouter.post("/admin/remove-dataset")
async def removeDataset(dataset_id: int):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized")
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DELETE FROM datasets WHERE id = ?", (
            dataset_id,
        )
    )
    con.commit()
    con.close()

@dbRouter.post("/admin/modify-dataset")
async def modifyDataset(dataset_id: int, dataset: DatasetCreate):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized") 
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("UPDATE datasets SET name = ?, description = ?, path = ?, format = ?, streamable = ?, access = ?, tags = ? WHERE id = ?",
        (
            dataset.name,
            dataset.description,
            dataset.path,
            dataset.format,
            int(dataset.streamable),
            dataset.access,
            json.dumps(dataset.tags),
            dataset_id,
        )
    )
    con.commit()
    con.close()

@dbRouter.post("/admin/add-category")
async def addCategory(category: CategoryCreate):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized") 
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        'INSERT INTO categories (name, url, icon, description) VALUES (?, ?, ?, ?)',
        (
            category.name,
            category.url,
            category.icon,
            category.description,
        )
    )
    con.commit()
    con.close()

@dbRouter.post("/admin/remove-category")
async def removeCategory(category_url: str):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized")
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DELETE FROM categories WHERE url = ?", (
            category_url,
        )
    )
    con.commit()
    con.close()
    return {"status": "success"}


@dbRouter.post("/admin/modify-category")
async def modifyCategory(category_url: str, category: CategoryCreate):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized") 
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("UPDATE categories SET name = ?, description = ?, url = ?, icon = ? WHERE url = ?",
        (
            category.name,
            category.description,
            category.url,
            category.icon,
            category_url
        )
    )
    con.commit()
    con.close()
    return {"status": "success"}

@dbRouter.post("/admin/add-user")
async def addUser(user: str):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized") 
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("INSERT INTO authorizedUsers (name) VALUES (?)", (user,))
    con.commit()
    con.close()
    return {"status": "success"}

@dbRouter.post("/admin/remove-user")
async def removeUser(user:str):
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized") 
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DELETE FROM authorizedUsers WHERE name = ?", (user,))
    con.commit()
    con.close()
    return {"status": "success"}

@dbRouter.get("/admin/retrieve-users")
async def fetchUsers():
    if not is_authorized(USER):
        raise HTTPException(status_code=403, detail="Not Authorized")
    result = []
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("SELECT * FROM authorizedUsers")
    rows = cur.fetchall()
    for row in rows:
        current_row = {
            "name": row["name"]
        }
        result.append(current_row)
    con.close()
    return result