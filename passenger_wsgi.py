import sys
import site

venv_site = '/home/x-yourusername/ondemand/dev/pelican-ui/.venv/lib/python3.9/site-packages'
site.addsitedir(venv_site)

sys.path.insert(0, venv_site)

from main import app
from a2wsgi import ASGIMiddleware
application = ASGIMiddleware(app)