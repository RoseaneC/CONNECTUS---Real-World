# backend/scripts/seed_wallet_onchain.py
import sqlite3
from _db_path import get_db_path

DB = get_db_path()
con = sqlite3.connect(DB); cur = con.cursor()

def upsert_flag(k, v):
    cur.execute("CREATE TABLE IF NOT EXISTS feature_flags (key TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("INSERT OR IGNORE INTO feature_flags(key,enabled) VALUES(?,?)", (k,int(v)))
    cur.execute("UPDATE feature_flags SET enabled=? WHERE key=?", (int(v),k))

upsert_flag("ONCHAIN_TESTNET", 0)
upsert_flag("WITHDRAWALS_ENABLED", 0)
upsert_flag("STAKING_ENABLED", 1)

con.commit(); con.close()
print(f"[OK] Wallet on-chain flags seeded at {DB}")
