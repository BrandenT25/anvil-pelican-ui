from fastapi import APIRouter
from pelicanfs import OSDFFileSystem
import fsspec, os, json, shutil
from pathlib import Path
from collections import defaultdict
osdf = OSDFFileSystem(direct_reads=False)

pelicanRouter = APIRouter()
ROOTPATH = Path.cwd()
DATASET_PATH = os.path.join(ROOTPATH, "data", "datasets.json")
USER = os.environ.get("USER")
SCRATCH_PATH = os.path.join("/anvil", "scratch", USER)


@pelicanRouter.get("/datasets/category/list-path")
def pelicanlistPath(path: str):
    paths = osdf.ls(path)
    return paths

@pelicanRouter.get("/datasets/download")
def pelicanDownloadObject(storageLocation:str, filepath):
    

    entries = osdf.ls(filepath, detail=True)
    for entry in entries:
        print(entry["name"], entry["type"], entry["size"])
    path = filepath.rstrip("/")

    osdf.get(path, storageLocation, recursive=True)



@pelicanRouter.get("datasets/")
def giveSize():
    return
