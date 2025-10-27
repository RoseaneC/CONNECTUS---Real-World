# backend/scripts/db_reconcile_and_migrate.py
import sqlite3, os, pathlib

def resolve_db_path():
    url = os.getenv("DATABASE_URL", "sqlite:///app/connectus.db")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "", 1)
    return "app/connectus.db"

DB = resolve_db_path()
print(f"[INFO] Using DB: {DB}")
pathlib.Path(pathlib.Path(DB).parent).mkdir(parents=True, exist_ok=True)
con = sqlite3.connect(DB)
cur = con.cursor()

# feature_flags
cur.execute("""
CREATE TABLE IF NOT EXISTS feature_flags(
  key TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")
# garantir colunas
cur.execute("PRAGMA table_info(feature_flags)")
cols = {r[1] for r in cur.fetchall()}
if "enabled" not in cols:
    cur.execute("ALTER TABLE feature_flags ADD COLUMN enabled INTEGER NOT NULL DEFAULT 0")
if "updated_at" not in cols:
    cur.execute("ALTER TABLE feature_flags ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP")

# wallet_addresses
cur.execute("""
CREATE TABLE IF NOT EXISTS wallet_addresses(
  user_id INTEGER PRIMARY KEY,
  address TEXT UNIQUE,
  verified_at DATETIME
)
""")

# token_transfers
cur.execute("""
CREATE TABLE IF NOT EXISTS token_transfers(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'done',
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

# --- WALLET CORE (idempotent) ---
cur.execute("""
CREATE TABLE IF NOT EXISTS wallet_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  address TEXT NOT NULL,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
""")
cur.execute("CREATE INDEX IF NOT EXISTS idx_wallet_addresses_uid ON wallet_addresses(user_id);")

cur.execute("""
CREATE TABLE IF NOT EXISTS token_transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
""")
cur.execute("CREATE INDEX IF NOT EXISTS idx_token_transfers_uid ON token_transfers(user_id);")

# --- FEATURE FLAGS safety (enabled column) ---
cur.execute("PRAGMA table_info(feature_flags)")
cols = {r[1] for r in cur.fetchall()}
if "enabled" not in cols:
    cur.execute("ALTER TABLE feature_flags ADD COLUMN enabled INTEGER NOT NULL DEFAULT 0")

con.commit()
con.close()
print("[DONE] reconcile OK")
print("[OK] Wallet core tables ensured")