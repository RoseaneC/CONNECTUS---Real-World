from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.core.database import get_db, resolve_db_path_from_env
import sqlite3
import os

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/feature-flags")
def public_feature_flags(db=Depends(get_db)):
    """
    Endpoint público para o frontend ler flags.
    Retorna { key: boolean }.
    """
    try:
        # Usar conexão direta do SQLite como fallback
        db_path = "app/connectus.db"
        if not os.path.exists(db_path):
            db_path = "connectus.db"
        
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        cur.execute("SELECT key, enabled FROM feature_flags")
        rows = cur.fetchall()
        con.close()
        
        return { r[0]: bool(r[1]) for r in rows }
    except Exception as e:
        print(f"Erro ao buscar flags: {e}")
        return {}

@router.get("/health-db")
def health_db(db=Depends(get_db)):
    """
    Endpoint de diagnóstico do banco de dados.
    Retorna informações sobre o estado do DB.
    """
    try:
        # Usar conexão direta do SQLite para garantir consistência
        db_path = resolve_db_path_from_env()
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        
        # Verificar se tabelas de staking existem
        cur.execute("SELECT name FROM sqlite_master WHERE name='staking_tiers'")
        tiers_result = cur.fetchone()
        cur.execute("SELECT name FROM sqlite_master WHERE name='staking_positions'")
        positions_result = cur.fetchone()
        con.close()
        
        return {
            "db_path": db_path,
            "has_tiers": bool(tiers_result),
            "has_positions": bool(positions_result)
        }
    except Exception as e:
        return {
            "db_path": resolve_db_path_from_env(),
            "has_tiers": False,
            "has_positions": False,
            "error": str(e)
        }
