#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.core.security import verify_token, create_access_token
from app.core.config import settings
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_token():
    # Dados de teste
    test_data = {"stellar_account_id": "GZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ"}
    
    print(f"Chave secreta: {settings.jwt_secret_key}")
    print(f"Algoritmo: {settings.jwt_algorithm}")
    
    # Criar token
    token = create_access_token(test_data)
    print(f"Token criado: {token}")
    
    # Verificar token
    payload = verify_token(token)
    print(f"Payload decodificado: {payload}")
    
    if payload:
        print("✅ Token válido!")
    else:
        print("❌ Token inválido!")

if __name__ == "__main__":
    test_token()




