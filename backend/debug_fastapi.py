#!/usr/bin/env python3
"""
Debug específico do FastAPI
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_with_verbose_debug(method, endpoint, data=None, headers=None):
    """Testa uma rota com debug verboso"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers)
        
        print(f"🔍 {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.text:
            try:
                json_data = response.json()
                print(f"   JSON Response: {json.dumps(json_data, indent=2, ensure_ascii=False)}")
            except Exception as e:
                print(f"   Text Response: {response.text}")
                print(f"   JSON Parse Error: {e}")
        
        return response
    except Exception as e:
        print(f"❌ {method} {endpoint} - Erro: {e}")
        return None

def main():
    print("🐛 Debug específico do FastAPI")
    print("=" * 50)
    
    # Login para obter token
    print("\n🔑 Obtendo token...")
    login_response = test_with_verbose_debug("POST", "/auth/login?stellar_account_id=G123ABC456DEF789&public_key=GABC123456DEF789")
    
    access_token = None
    if login_response and login_response.status_code == 200:
        try:
            token_data = login_response.json()
            access_token = token_data.get("access_token")
            print(f"✅ Token obtido: {access_token[:50]}...")
        except:
            print("❌ Erro ao extrair token")
    
    auth_headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    # Testar rotas com erro
    print("\n🔍 Testando rotas com erro...")
    test_with_verbose_debug("GET", "/users/profile", headers=auth_headers)
    test_with_verbose_debug("GET", "/missions/my-missions", headers=auth_headers)
    test_with_verbose_debug("GET", "/posts/my-posts", headers=auth_headers)
    test_with_verbose_debug("GET", "/chat/my-messages", headers=auth_headers)

if __name__ == "__main__":
    main()















