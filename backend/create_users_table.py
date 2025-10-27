import sqlite3
import os

DB = os.getenv("DATABASE_URL", "sqlite:///app/connectus.db")
if DB.startswith("sqlite:///"):
    DB = DB.replace("sqlite:///", "", 1)

print(f"[INFO] Criando tabela users com campos de avatar: {DB}")

con = sqlite3.connect(DB)
cur = con.cursor()

# Criar tabela users completa
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    avatar_glb_url VARCHAR(500),
    avatar_png_url VARCHAR(500),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    tokens_earned NUMERIC(10, 2) DEFAULT 0.00,
    tokens_available NUMERIC(10, 2) DEFAULT 0.00,
    tokens_in_yield NUMERIC(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    missions_completed INTEGER DEFAULT 0,
    posts_created INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0
)
""")

# Criar usuário demo se não existir
cur.execute("SELECT COUNT(*) FROM users WHERE nickname = 'demo'")
if cur.fetchone()[0] == 0:
    cur.execute("""
    INSERT INTO users (nickname, password_hash, full_name, email, avatar_glb_url, avatar_png_url)
    VALUES ('demo', 'demo_hash', 'Usuário Demo', 'demo@connectus.com', 
            'https://models.readyplayer.me/demo.glb', 
            'https://models.readyplayer.me/demo.png')
    """)
    print("[OK] Usuário demo criado com avatar")

con.commit()
con.close()
print("[DONE] Tabela users criada com campos de avatar!")

