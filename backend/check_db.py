#!/usr/bin/env python3
"""
Script para verificar o banco de dados SQLite
"""
import sys
import os

# Adicionar o diretório do projeto ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_db():
    """Verifica o banco de dados"""
    try:
        db = SessionLocal()
        
        # Contar usuários
        user_count = db.query(User).count()
        logger.info(f"Total de usuários no banco: {user_count}")
        
        # Listar usuários
        users = db.query(User).all()
        for user in users:
            logger.info(f"Usuário: {user.nickname} (ID: {user.id}, Stellar: {user.stellar_account_id})")
        
        db.close()
        return True
    except Exception as e:
        logger.error(f"Erro ao verificar banco de dados: {e}")
        return False

if __name__ == "__main__":
    success = check_db()
    if success:
        print("✅ Banco de dados verificado com sucesso!")
    else:
        print("❌ Erro ao verificar banco de dados!")
        sys.exit(1)





