from fastapi import APIRouter
from pelicanfs import OSDFFileSystem
import fsspec, os, json, shutil
from pathlib import Path
from collections import defaultdict
osdf = OSDFFileSystem(direct_reads=True)

pelicanRouter = APIRouter()
ROOTPATH = Path.cwd()
DATASET_PATH = os.path.join(ROOTPATH, "data", "datasets.json")
USER = os.environ.get("USER")
SCRATCH_PATH = os.path.join("/anvil", "scratch", USER)


@pelicanRouter.get("/datasets/category/list-path")
def pelicanlistPath(path: str):
    paths = osdf.ls(path)
    return paths

@pelicanRouter.get("/datasets/download/")
def pelicanDownloadObject(storageLocation:str, filepath):
    if storageLocation == "scratch":
        print(osdf.info(filepath))
        osdf.get(filepath, SCRATCH_PATH, recursive=True)
        print(f"{filepath} downloaded at {storageLocation}")

@pelicanRouter.get("datasets/")
def giveSize():
    return
