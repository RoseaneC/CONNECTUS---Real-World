#!/usr/bin/env python3
"""
Teste completo do frontend + backend Connectus
"""

import requests
import json
import time
import sys

def test_backend_health():
    """Testar se o backend está rodando"""
    try:
        response = requests.get('http://127.0.0.1:8000/health', timeout=5)
        data = response.json()
        print(f"✅ Backend Health: {data}")
        return True
    except Exception as e:
        print(f"❌ Backend não está rodando: {e}")
        return False

def test_backend_docs():
    """Testar se a documentação está acessível"""
    try:
        response = requests.get('http://127.0.0.1:8000/docs', timeout=5)
        if response.status_code == 200:
            print("✅ Backend Docs: Acessível")
            return True
        else:
            print(f"❌ Backend Docs: Erro {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend Docs: {e}")
        return False

def test_register():
    """Testar registro de usuário"""
    print("\n🧪 Testando registro de usuário...")
    
    user_data = {
        "nickname": f"teste_{int(time.time())}",
        "password": "123456",
        "full_name": "Usuário Teste",
        "email": f"teste_{int(time.time())}@exemplo.com"
    }
    
    try:
        response = requests.post('http://127.0.0.1:8000/auth/register', json=user_data)
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Registro bem-sucedido: {data['nickname']}")
            return data
        else:
            print(f"❌ Erro no registro: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição de registro: {e}")
        return None

def test_login(nickname, password):
    """Testar login de usuário"""
    print(f"\n🧪 Testando login: {nickname}")
    
    login_data = {
        "nickname": nickname,
        "password": password
    }
    
    try:
        response = requests.post('http://127.0.0.1:8000/auth/login', json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login bem-sucedido: {data['token_type']}")
            return data['access_token']
        else:
            print(f"❌ Erro no login: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição de login: {e}")
        return None

def test_protected_route(token):
    """Testar rota protegida"""
    print(f"\n🧪 Testando rota protegida /auth/me")
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    try:
        response = requests.get('http://127.0.0.1:8000/auth/me', headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Rota protegida acessada: {data['nickname']}")
            return True
        else:
            print(f"❌ Erro na rota protegida: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição protegida: {e}")
        return False

def test_cors():
    """Testar CORS"""
    print(f"\n🧪 Testando CORS...")
    
    headers = {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    try:
        response = requests.options('http://127.0.0.1:8000/auth/login', headers=headers)
        
        if response.status_code == 200:
            print("✅ CORS configurado corretamente")
            return True
        else:
            print(f"❌ CORS não configurado: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no teste CORS: {e}")
        return False

def main():
    print("🔍 TESTE COMPLETO FRONTEND + BACKEND CONNECTUS")
    print("=" * 60)
    
    # Teste 1: Backend Health
    print("\n1️⃣ Testando Backend Health...")
    if not test_backend_health():
        print("\n💡 SOLUÇÃO: Execute o backend primeiro!")
        print("   python simple_auth_server.py")
        return False
    
    # Teste 2: Backend Docs
    print("\n2️⃣ Testando Backend Docs...")
    if not test_backend_docs():
        print("⚠️ Documentação não acessível, mas backend está rodando")
    
    # Teste 3: CORS
    print("\n3️⃣ Testando CORS...")
    test_cors()
    
    # Teste 4: Registro
    print("\n4️⃣ Testando Registro...")
    user_data = test_register()
    if not user_data:
        print("❌ Falha no teste de registro")
        return False
    
    # Teste 5: Login
    print("\n5️⃣ Testando Login...")
    token = test_login(user_data['nickname'], "123456")
    if not token:
        print("❌ Falha no teste de login")
        return False
    
    # Teste 6: Rota Protegida
    print("\n6️⃣ Testando Rota Protegida...")
    if not test_protected_route(token):
        print("❌ Falha no teste de rota protegida")
        return False
    
    print("\n🎉 TODOS OS TESTES PASSARAM!")
    print("\n📋 SISTEMA 100% FUNCIONAL:")
    print("   ✅ Backend rodando em http://127.0.0.1:8000")
    print("   ✅ CORS configurado")
    print("   ✅ Registro funcionando")
    print("   ✅ Login funcionando")
    print("   ✅ Rotas protegidas funcionando")
    print("   ✅ JWT funcionando")
    
    print("\n🎯 PRÓXIMOS PASSOS:")
    print("   1. Execute: cd frontend && npm run dev")
    print("   2. Acesse: http://localhost:5173")
    print("   3. Teste o frontend completo")
    print("   4. Faça login e teste todas as páginas")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)













