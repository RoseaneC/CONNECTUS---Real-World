import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "app" / "connectus.db"

def column_exists(cur, table, column):
    cur.execute(f"PRAGMA table_info({table})")
    return any(r[1] == column for r in cur.fetchall())

def main():
    print(f"[INFO] Using DB: {DB_PATH}")
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    for col in ("avatar_url", "avatar_glb_url", "avatar_png_url"):
        if not column_exists(cur, "users", col):
            print(f"[MIGRATE] Add users.{col}")
            cur.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS wallet_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address TEXT UNIQUE,
        verified_at TEXT
    )""")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS token_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tx_hash TEXT,
        amount REAL DEFAULT 0,
        created_at TEXT
    )""")

    conn.commit()
    conn.close()
    print("[DONE] DB patched successfully.")

if __name__ == "__main__":
    main()