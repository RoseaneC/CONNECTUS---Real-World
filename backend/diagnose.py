#!/usr/bin/env python3
import sys
import os

print("=== DIAGNÓSTICO DO BACKEND CONNECTUS ===")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

# Testar importações básicas
try:
    import fastapi
    print(f"✅ FastAPI version: {fastapi.__version__}")
except ImportError as e:
    print(f"❌ FastAPI não encontrado: {e}")

try:
    import uvicorn
    print(f"✅ Uvicorn version: {uvicorn.__version__}")
except ImportError as e:
    print(f"❌ Uvicorn não encontrado: {e}")

try:
    import sqlalchemy
    print(f"✅ SQLAlchemy version: {sqlalchemy.__version__}")
except ImportError as e:
    print(f"❌ SQLAlchemy não encontrado: {e}")

try:
    import pydantic
    print(f"✅ Pydantic version: {pydantic.__version__}")
except ImportError as e:
    print(f"❌ Pydantic não encontrado: {e}")

try:
    from jose import jwt
    print("✅ python-jose encontrado")
except ImportError as e:
    print(f"❌ python-jose não encontrado: {e}")

# Testar importação do app
try:
    sys.path.insert(0, os.path.abspath('.'))
    from app.core.config import settings
    print(f"✅ Config carregado: {settings.app_name}")
except Exception as e:
    print(f"❌ Erro ao carregar config: {e}")

print("\n=== FIM DO DIAGNÓSTICO ===")















