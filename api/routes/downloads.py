from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3, os, json
from datetime import datetime, timezone
from api.core.config import DOWNLOADS_DB_PATH

downloadsRouter = APIRouter()

VALID_FINISH_STATUSES = ("complete", "partial", "failed")


def _get_connection():
    os.makedirs(os.path.dirname(DOWNLOADS_DB_PATH), exist_ok=True)
    con = sqlite3.connect(DOWNLOADS_DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def _init_db():
    con = _get_connection()
    cur = con.cursor()
    cur.execute(
        """CREATE TABLE IF NOT EXISTS download_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            destination TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'in_progress',
            item_count INTEGER NOT NULL DEFAULT 0,
            started_at TEXT NOT NULL,
            finished_at TEXT,
            error_message TEXT
        )"""
    )
    # files wasn't in the original schema — add it for rows created before
    # this column existed rather than requiring a fresh DB
    existing_columns = {row["name"] for row in cur.execute("PRAGMA table_info(download_history)")}
    if "files" not in existing_columns:
        cur.execute("ALTER TABLE download_history ADD COLUMN files TEXT")
    con.commit()
    con.close()


_init_db()


class DownloadStart(BaseModel):
    name: str
    destination: str
    item_count: int


class DownloadFileEntry(BaseModel):
    path: str
    status: str


class DownloadFinish(BaseModel):
    status: str
    error_message: str | None = None
    files: list[DownloadFileEntry] | None = None


@downloadsRouter.post("/downloads/history/start")
async def startDownloadRecord(payload: DownloadStart):
    con = _get_connection()
    cur = con.cursor()
    started_at = datetime.now(timezone.utc).isoformat()
    cur.execute(
        "INSERT INTO download_history (name, destination, status, item_count, started_at) VALUES (?, ?, 'in_progress', ?, ?)",
        (payload.name, payload.destination, payload.item_count, started_at),
    )
    con.commit()
    new_id = cur.lastrowid
    con.close()
    return {"id": new_id}


@downloadsRouter.post("/downloads/history/{record_id}/finish")
async def finishDownloadRecord(record_id: int, payload: DownloadFinish):
    if payload.status not in VALID_FINISH_STATUSES:
        raise HTTPException(status_code=400, detail=f"status must be one of {VALID_FINISH_STATUSES}")
    con = _get_connection()
    cur = con.cursor()
    finished_at = datetime.now(timezone.utc).isoformat()
    files_json = json.dumps([f.model_dump() for f in payload.files]) if payload.files is not None else None
    cur.execute(
        "UPDATE download_history SET status = ?, finished_at = ?, error_message = ?, files = ? WHERE id = ?",
        (payload.status, finished_at, payload.error_message, files_json, record_id),
    )
    con.commit()
    updated = cur.rowcount
    con.close()
    if updated == 0:
        raise HTTPException(status_code=404, detail="Download record not found.")
    return {"status": "success"}


@downloadsRouter.get("/downloads/history")
async def listDownloadHistory():
    con = _get_connection()
    cur = con.cursor()
    cur.execute("SELECT * FROM download_history ORDER BY started_at DESC")
    rows = cur.fetchall()
    con.close()
    result = []
    for row in rows:
        entry = dict(row)
        entry["files"] = json.loads(entry["files"]) if entry.get("files") else []
        result.append(entry)
    return result
