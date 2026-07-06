from fastapi import FastAPI, Request
import os
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from api.routes.dataset import datasetRouter
from api.routes.pelican import pelicanRouter
from api.routes.local import localRouter

USER = os.environ.get("USER")


app = FastAPI()
app.include_router(datasetRouter)
app.include_router(pelicanRouter)
app.include_router(localRouter)
app.mount("/api/static", StaticFiles(directory="api/static"), name="static")
templates = Jinja2Templates(directory="api/templates")




@app.get('/datasets', response_class=HTMLResponse)
async def dataset_page(request: Request):
    return templates.TemplateResponse(request,'categories.html', {"ROOT_URL": request.scope.get('root_path', '')})

@app.get('/', response_class=HTMLResponse)
async def main_page(request: Request):
    return templates.TemplateResponse(request, "index.html", {"ROOT_URL": request.scope.get('root_path', '')})

@app.get('/quick-access', response_class=HTMLResponse)
async def main_page(request: Request):
    return templates.TemplateResponse(request, "quick-access.html", {"ROOT_URL": request.scope.get('root_path', '')})

@app.get('/about', response_class=HTMLResponse)
async def main_page(request: Request):
    return templates.TemplateResponse(request, "about.html", {"ROOT_URL": request.scope.get('root_path', '')})

@app.get('/datasets/category/{category}')
async def category_page(category, request: Request):
    return templates.TemplateResponse(request, "datasets.html", {"ROOT_URL": request.scope.get('root_path', ''), "CATEGORY": category, "USER": USER})
