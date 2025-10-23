# [CONNECTUS HOTFIX] seed dev user idempotente
import os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.database import SessionLocal, engine, Base
from app.core.auth import get_password_hash
from sqlalchemy import func, or_, text

def main():
    # Criar tabelas sem importar todos os modelos
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        nickname = os.getenv("SEED_NICKNAME", "roseane")
        email = os.getenv("SEED_EMAIL", "roseane@example.com")
        password = os.getenv("SEED_PASSWORD", "123456")

        # [CONNECTUS HOTFIX] case-insensitive: verifica se já existe por nickname ou email
        # Usar SQL direto para evitar problemas de importação de modelos
        result = db.execute(text("""
            SELECT id, nickname FROM users 
            WHERE LOWER(nickname) = LOWER(:nickname) 
            OR LOWER(email) = LOWER(:email)
        """), {"nickname": nickname, "email": email}).fetchone()

        if result:
            print(f"ℹ️ Seed: usuário '{result.nickname}' já existe.")
            return

        # Criar usuário usando SQL direto
        password_hash = get_password_hash(password)
        db.execute(text("""
            INSERT INTO users (nickname, email, password_hash, is_active, created_at)
            VALUES (:nickname, :email, :password_hash, :is_active, datetime('now'))
        """), {
            "nickname": nickname,
            "email": email,
            "password_hash": password_hash,
            "is_active": True
        })
        db.commit()
        print(f"✅ Seed: usuário '{nickname}' criado com senha '{password}'")
    finally:
        db.close()

if __name__ == "__main__":
    main()
