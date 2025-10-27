# backend/scripts/show_flags.py
import sqlite3
from _db_path import get_db_path

DB = get_db_path()
con = sqlite3.connect(DB); cur = con.cursor()
cur.execute("PRAGMA table_info(feature_flags)")
cols = [r[1] for r in cur.fetchall()]
print("feature_flags columns:", cols)
for row in cur.execute("SELECT key, enabled FROM feature_flags ORDER BY key"):
    print(f"{row[0]}: {row[1]}")
con.close()

