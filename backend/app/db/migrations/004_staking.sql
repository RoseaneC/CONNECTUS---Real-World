-- 004_staking.sql (idempotente)

-- tiers de staking (parametrização)
CREATE TABLE IF NOT EXISTS staking_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  apy_bps INTEGER NOT NULL,     -- ex.: 1000 = 10% APY
  lock_days INTEGER NOT NULL,   -- 0 = sem lock (não usaremos no MVP, apenas >=7)
  min_amount INTEGER NOT NULL DEFAULT 1, -- em VEXA unidades inteiras
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- posições de staking
CREATE TABLE IF NOT EXISTS staking_positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tier_id INTEGER NOT NULL,
  principal INTEGER NOT NULL,
  apy_bps INTEGER NOT NULL,
  lock_days INTEGER NOT NULL,
  started_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  last_accrued_at DATETIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open','closed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staking_positions_user ON staking_positions(user_id, status, created_at DESC);

-- tiers padrão (upsert simples por nome)
INSERT OR IGNORE INTO staking_tiers(name, apy_bps, lock_days, min_amount) VALUES
  ('Fast (7d)', 600, 7, 5),
  ('Classic (30d)', 1000, 30, 5),
  ('Pro (90d)', 1600, 90, 5);

