import os
import sys
import site

venv_site = os.path.join(
    os.environ['HOME'], 'ondemand/dev/anvil-pelican-ui/.venv/lib/python3.11/site-packages'
)
site.addsitedir(venv_site)

sys.path.insert(0, venv_site)

from main import app
from a2wsgi import ASGIMiddleware
application = ASGIMiddleware(app)