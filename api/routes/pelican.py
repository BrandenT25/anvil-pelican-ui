from fastapi import APIRouter
from pelicanfs import OSDFFileSystem
import fsspec, os, json
from pathlib import Path
from collections import defaultdict
osdf = OSDFFileSystem()

pelicanRouter = APIRouter()
ROOTPATH = Path.cwd()
DATASET_PATH = os.path.join(ROOTPATH, "data", "datasets.json")
USER = os.environ.get("USER")
SCRATCH_PATH = os.path.join("/anvil", "scratch", USER)


@pelicanRouter.get("/datasets/category/list-path")
def pelicanlistPath(path: str):
    paths = osdf.ls(path)
    return paths
   
@pelicanRouter.get("/datasets/download/{storageLocation}")
def pelicanDownloadObject(storageLocation:str, filepath):
    print(repr(filepath))
    if storageLocation == "scratch":
        osdf.get(filepath, SCRATCH_PATH, recursive=True )
    return "File Downloaded"

