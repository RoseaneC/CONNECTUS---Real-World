#!/usr/bin/env python3
"""
Script para limpar o banco de dados SQLite
"""
import sys
import os

# Adicionar o diretório do projeto ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models import user, mission, post, chat, ranking
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clear_db():
    """Limpa o banco de dados"""
    try:
        # Deletar todas as tabelas
        Base.metadata.drop_all(bind=engine)
        logger.info("Banco de dados limpo com sucesso!")
        
        # Recriar todas as tabelas
        Base.metadata.create_all(bind=engine)
        logger.info("Banco de dados recriado com sucesso!")
        return True
    except Exception as e:
        logger.error(f"Erro ao limpar banco de dados: {e}")
        return False

if __name__ == "__main__":
    success = clear_db()
    if success:
        print("✅ Banco de dados limpo e recriado com sucesso!")
    else:
        print("❌ Erro ao limpar banco de dados!")
        sys.exit(1)






