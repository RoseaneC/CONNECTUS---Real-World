"""
Configuração do banco de dados para Connectus
"""

import os
from urllib.parse import urlparse
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from app.core.config import settings

def resolve_db_path_from_env():
    url = os.getenv("DATABASE_URL", "sqlite:///app/connectus.db")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "", 1)
    p = urlparse(url)
    if p.scheme == "sqlite":
        return (p.path or "").lstrip("/")
    return "app/connectus.db"

def ensure_core_schema():
    """Cria as tabelas mínimas se não existirem (SQLAlchemy 2.x, via Engine/Connection)."""
    with engine.begin() as conn:
        # feature_flags
        conn.exec_driver_sql("""
        CREATE TABLE IF NOT EXISTS feature_flags (
          key TEXT PRIMARY KEY,
          enabled INTEGER NOT NULL DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        # token_transfers
        conn.exec_driver_sql("""
        CREATE TABLE IF NOT EXISTS token_transfers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          amount REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'done',
          tx_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        # wallet_addresses
        conn.exec_driver_sql("""
        CREATE TABLE IF NOT EXISTS wallet_addresses (
          user_id INTEGER PRIMARY KEY,
          address TEXT UNIQUE,
          verified_at DATETIME
        );
        """)

    return True

def flag_value(db, key: str) -> bool:
    """Helper para obter valor de flag com fallback seguro"""
    try:
        row = db.execute(text("SELECT enabled FROM feature_flags WHERE key=:k"), {"k": key}).fetchone()
        return bool(row[0]) if row else False
    except OperationalError:
        return False

# Criar engine do banco de dados
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Criar sessão do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

def get_db():
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Criar todas as tabelas"""
    Base.metadata.create_all(bind=engine)