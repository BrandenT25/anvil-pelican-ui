from fastapi import APIRouter
import json, os
from pathlib import Path


ROOTPATH = Path.cwd()
DATASET_PATH = os.path.join(ROOTPATH, "data", "datasets.json")
CATEGORY_PATH = os.path.join(ROOTPATH, "data", "categories.json")
datasetRouter = APIRouter()

@datasetRouter.get("/retrieve-datasets")
async def serveDatasets():
    with open(DATASET_PATH, "r") as f:
        data = f.read()
        datasetJSON = json.loads(data)["datasets"]

    return datasetJSON

@datasetRouter.get("/retrieve-categories")
async def serveCategories():
    with open(CATEGORY_PATH, "r") as f:
        data = f.read()
        categoryJSON = json.loads(data)["categories"]
    return categoryJSON



