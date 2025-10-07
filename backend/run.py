#!/usr/bin/env python3
"""
Script para executar o servidor Connectus
"""

import sys
import os
import uvicorn

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def main():
    print("🚀 Iniciando servidor Connectus...")
    print(f"🌐 URL: http://localhost:8000")
    print(f"📚 Docs: http://localhost:8000/docs")
    print(f"🔧 Health: http://localhost:8000/health")
    print(f"🐛 Debug: {settings.DEBUG}")
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=settings.DEBUG,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()