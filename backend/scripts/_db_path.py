# backend/scripts/_db_path.py
import os
from urllib.parse import urlparse

def get_db_path():
    url = os.getenv("DATABASE_URL", "sqlite:///app/connectus.db")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "", 1)
    p = urlparse(url)
    if p.scheme == "sqlite":
        return (p.path or "").lstrip("/")
    # fallback
    return "app/connectus.db"

