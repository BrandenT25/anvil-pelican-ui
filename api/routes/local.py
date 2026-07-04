from fastapi import APIRouter
import os

USER = os.environ.get("USER")
PROJECT_ALLOCATIONS_RAW = os.environ.get("PROJECT")
PROJECT_ALLOCATIONS = PROJECT_ALLOCATIONS_RAW.split(",")
PROJECT_PATHS = []

for allocations in PROJECT_ALLOCATIONS:
    PROJECT_PATHS.append(allocations)

SCRATCH_PATH = f"/anvil/scratch/{USER}/"
HOME_PATH =  f"/home/{USER}/"


MEDIUMS = {
    "scratch": SCRATCH_PATH ,
    "project": PROJECT_PATHS,
    "home": HOME_PATH,
}
NOISE_PREFIXES = ("interlink")

localRouter = APIRouter()


@localRouter.get("/datasets/local-browse/list")
def browseStorageMedium(medium: str):
    result = []
    print(MEDIUMS)
    if medium == "project":
        for dir in MEDIUMS["project"]:
            print(dir)
            list = [f for f in os.listdir(dir) if os.path.isdir(os.path.join(dir, f))]
            list = [f for f in list if not f.startswith('.')] 
            list = [f for f in list if not f.startswith(NOISE_PREFIXES)]
            result.extend(list)
        return result
    else:
        list = [f for f in os.listdir(MEDIUMS[medium]) if os.path.isdir(os.path.join(MEDIUMS[medium], f))]
        list = [f for f in list if not f.startswith('.')]
        return list




