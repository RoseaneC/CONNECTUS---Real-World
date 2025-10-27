-- 003_wallet_onchain.sql

-- flags
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO feature_flags(key, enabled) VALUES ('ONCHAIN_TESTNET', 0);
INSERT OR IGNORE INTO feature_flags(key, enabled) VALUES ('WITHDRAWALS_ENABLED', 0);

-- vínculo de carteira
CREATE TABLE IF NOT EXISTS wallet_addresses (
  user_id INTEGER PRIMARY KEY,
  address TEXT NOT NULL,
  verified_at DATETIME,
  nonce TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- registro de transferências (stub)
CREATE TABLE IF NOT EXISTS token_transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','sent','failed','canceled')),
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_token_transfers_user_time ON token_transfers(user_id, created_at DESC);

