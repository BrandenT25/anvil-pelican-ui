import os

DB_PATH = "/anvil/projects/x-cda090008/anvil_reu26_pj4/pelican-ui-shared/pelican.db"
#DB_PATH = "/anvil/scratch/x-bturner/pelican.db"

# Per-user local downloads history — deliberately separate from DB_PATH above.
# DB_PATH is a single shared, multi-user, admin-managed database; this one is
# single-user/local to whichever account is running this deployment, so it
# lives under that user's home directory instead of the shared project path.
DOWNLOADS_DB_PATH = os.path.join(os.path.expanduser("~"), ".pelican-ui", "downloads_history.db")
