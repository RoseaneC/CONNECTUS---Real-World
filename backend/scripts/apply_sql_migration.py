# backend/scripts/apply_sql_migration.py
import sys, sqlite3, pathlib
from _db_path import get_db_path

if len(sys.argv) < 2:
    print("Usage: python backend/scripts/apply_sql_migration.py <path/to.sql>")
    sys.exit(1)

sql_file = pathlib.Path(sys.argv[1])
if not sql_file.exists():
    print("SQL file not found:", sql_file)
    sys.exit(2)

db = get_db_path()
sql = sql_file.read_text(encoding="utf-8")

con = sqlite3.connect(db)
con.executescript(sql)
con.commit()
con.close()
print(f"[OK] Applied {sql_file} to {db}")

