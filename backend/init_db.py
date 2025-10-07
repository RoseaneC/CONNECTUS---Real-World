#!/usr/bin/env python3
"""
Script para inicializar o banco de dados do Connectus
"""

import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import create_tables
from app.core.config import settings

def main():
    print("🚀 Inicializando banco de dados do Connectus...")
    print(f"📁 Database URL: {settings.DATABASE_URL}")
    
    try:
        # Criar tabelas
        create_tables()
        print("✅ Banco de dados inicializado com sucesso!")
        print("📋 Tabelas criadas:")
        print("   - users")
        print("   - (outras tabelas serão criadas conforme necessário)")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()