# Script para adicionar colunas de avatar ao banco existente
import sqlite3
import os

DB = os.getenv("DATABASE_URL", "sqlite:///app/connectus.db")
if DB.startswith("sqlite:///"):
    DB = DB.replace("sqlite:///", "", 1)

print(f"[INFO] Adicionando colunas de avatar ao DB: {DB}")

con = sqlite3.connect(DB)
cur = con.cursor()

# Verificar se as colunas já existem
cur.execute("PRAGMA table_info(users)")
cols = {r[1] for r in cur.fetchall()}

if "avatar_glb_url" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN avatar_glb_url VARCHAR(500)")
    print("[OK] Coluna avatar_glb_url adicionada")
else:
    print("[SKIP] Coluna avatar_glb_url já existe")

if "avatar_png_url" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN avatar_png_url VARCHAR(500)")
    print("[OK] Coluna avatar_png_url adicionada")
else:
    print("[SKIP] Coluna avatar_png_url já existe")

con.commit()
con.close()
print("[DONE] Colunas de avatar adicionadas com sucesso!")

