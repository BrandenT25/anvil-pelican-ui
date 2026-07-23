from fastapi import APIRouter, HTTPException
from pelicanfs import OSDFFileSystem
import fsspec, os, json, shutil, logging
from pathlib import Path
from collections import defaultdict
osdf = OSDFFileSystem(direct_reads=False)

logger = logging.getLogger("pelican-ui.pelican")

pelicanRouter = APIRouter()
ROOTPATH = Path.cwd()
DATASET_PATH = os.path.join(ROOTPATH, "data", "datasets.json")
USER = os.environ.get("USER")
SCRATCH_PATH = os.path.join("/anvil", "scratch", USER)


class DownloadError(Exception):
    """Raised by download_one_file instead of HTTPException. This is called
    from background job threads (api/routes/downloads.py), not just request
    handlers, and HTTPException only makes sense when there's an active
    request to attach a status code to."""


def download_one_file(filepath: str, storage_location: str) -> None:
    # The actual transfer mechanism (fsspec/pelicanfs streaming 5MB chunks
    # straight to disk) is unchanged and correct. What used to be wrong was
    # invoking this synchronously inside a request handler: this app runs
    # under Passenger via a2wsgi (see passenger_wsgi.py), which pins one
    # worker for the full duration of whatever request it's handling — so a
    # large/slow transfer here held a worker (and, for the browser, a
    # connection) open for as long as the transfer took, long enough to hit
    # reverse-proxy timeouts. This function is now only ever called from a
    # background thread (api/routes/downloads.py's job worker), never from
    # directly inside a request handler.
    path = filepath.rstrip("/")
    try:
        osdf.get(path, storage_location, recursive=True)
    except FileNotFoundError:
        raise DownloadError(f'"{filepath}" was not found on the federation.') from None
    except PermissionError:
        raise DownloadError(f"You don't have permission to write to {storage_location}.") from None
    except Exception as e:
        logger.exception("download_one_file failed for %s -> %s", filepath, storage_location)
        raise DownloadError("Download failed. Check server logs.") from e


@pelicanRouter.get("/datasets/category/list-path")
def pelicanlistPath(path: str):
    try:
        return osdf.ls(path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f'Path "{path}" was not found on the federation.')
    except Exception:
        logger.exception("pelicanlistPath failed for %s", path)
        raise HTTPException(status_code=502, detail="Couldn't reach the Pelican/OSDF federation. Try again.")


@pelicanRouter.get("datasets/")
def giveSize():
    return
