from fastapi import APIRouter
import os

USER = os.environ.get("USER")
PROJECT_ALLOCATIONS_RAW = os.environ.get("PROJECT", "")
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


@localRouter.get("/datasets/local-browse/list-root")
def browseStorageMedium(medium: str):
    result = []
    pathParts = medium.split("/")
    if pathParts[0] == "project":
        allocation = None
        if len(pathParts) >= 2:
            allocation = pathParts[1]
            path = f"/anvil/projects/{allocation}/"
            for part in pathParts[2:]:
                path += f"{part}/"
            list = [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f)) and not f.startswith(NOISE_PREFIXES)]
            list = [f for f in list if not f.startswith('.')]
            print(list) 
            return list
        else:
            for dir in MEDIUMS["project"]:
                result.append(os.path.basename(dir))
            return result
    else:
        root = MEDIUMS[pathParts[0]]
        path = f"{root}/"
        if len(pathParts) > 1:
            pathParts = medium.split("/")
            for part in pathParts[1:]:
                path += f"{part}/"
        list = [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))]
        list = [f for f in list if not f.startswith('.')]
        print(list)
        return list




