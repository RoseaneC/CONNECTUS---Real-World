#!/usr/bin/env python3
"""
Script de teste para diagnóstico do login no ConnectUS

Uso:
    python scripts/test_login.py

Ou com credenciais customizadas:
    python scripts/test_login.py --nickname roseane --password 123456
"""

import requests
import sys
import argparse
import os
from pathlib import Path

# Adicionar o diretório raiz ao path para importar módulos
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def test_login(nickname: str, password: str, base_url: str = "http://127.0.0.1:8000"):
    """
    Testa o endpoint de login e verifica se o cookie é retornado corretamente.
    
    Args:
        nickname: Nickname do usuário
    password: Senha do usuário
    base_url: URL base do backend (padrão: http://127.0.0.1:8000)
    """
    print("=" * 60)
    print("🧪 TESTE DE LOGIN - ConnectUS")
    print("=" * 60)
    print(f"Backend URL: {base_url}")
    print(f"Nickname: {nickname}")
    print(f"Password: {'*' * len(password)}")
    print()
    
    # 1. Fazer POST para /auth/login
    print("📤 Fazendo POST para /auth/login...")
    login_url = f"{base_url}/auth/login"
    
    try:
        response = requests.post(
            login_url,
            json={"nickname": nickname, "password": password},
            headers={"Content-Type": "application/json"}
        )
        
        # Status code
        print(f"\n✅ Status Code: {response.status_code}")
        
        # Corpo da resposta
        try:
            response_json = response.json()
            print(f"📄 Response Body:")
            import json
            print(json.dumps(response_json, indent=2, ensure_ascii=False))
        except:
            print(f"📄 Response Body (text): {response.text[:200]}")
        
        # Header Set-Cookie
        set_cookie_header = response.headers.get("Set-Cookie", None)
        if set_cookie_header:
            print(f"\n🍪 Set-Cookie Header:")
            # Truncar token para não expor completamente
            if "connectus_access_token=" in set_cookie_header:
                parts = set_cookie_header.split("connectus_access_token=")
                if len(parts) > 1:
                    token_part = parts[1].split(";")[0]
                    truncated_token = token_part[:20] + "..." if len(token_part) > 20 else token_part
                    set_cookie_header_truncated = set_cookie_header.replace(token_part, truncated_token)
                    print(set_cookie_header_truncated)
                else:
                    print(set_cookie_header)
            else:
                print(set_cookie_header)
        else:
            print(f"\n❌ Set-Cookie Header: None")
        
        # 2. Se login foi bem-sucedido, testar /auth/debug-cookie
        if response.status_code == 200 and set_cookie_header:
            print("\n" + "=" * 60)
            print("🍪 Testando /auth/debug-cookie com cookie recebido...")
            print("=" * 60)
            
            # Extrair cookie da resposta
            cookies = response.cookies
            cookie_value = cookies.get("connectus_access_token")
            
            if cookie_value:
                print(f"✅ Cookie extraído: {cookie_value[:20]}...")
                
                # Fazer GET para /auth/debug-cookie
                debug_url = f"{base_url}/auth/debug-cookie"
                debug_response = requests.get(
                    debug_url,
                    cookies={"connectus_access_token": cookie_value}
                )
                
                print(f"\n✅ Status Code: {debug_response.status_code}")
                try:
                    debug_json = debug_response.json()
                    print(f"📄 Response Body:")
                    print(json.dumps(debug_json, indent=2, ensure_ascii=False))
                    
                    if debug_json.get("cookie_present"):
                        print("\n✅ SUCESSO: Cookie foi recebido corretamente pelo backend!")
                    else:
                        print("\n❌ ERRO: Cookie não foi recebido pelo backend!")
                except:
                    print(f"📄 Response Body (text): {debug_response.text[:200]}")
            else:
                print("❌ ERRO: Não foi possível extrair cookie da resposta")
        elif response.status_code == 401:
            print("\n❌ ERRO: Login falhou - credenciais inválidas")
        else:
            print(f"\n⚠️  Status inesperado: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ ERRO: Não foi possível conectar ao backend em {base_url}")
        print("💡 Certifique-se de que o servidor está rodando:")
        print("   uvicorn app.main:app --host 127.0.0.1 --port 8000")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERRO: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Teste concluído")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Testa o endpoint de login do ConnectUS")
    parser.add_argument(
        "--nickname",
        type=str,
        default="roseane",
        help="Nickname do usuário (padrão: roseane)"
    )
    parser.add_argument(
        "--password",
        type=str,
        default="123456",
        help="Senha do usuário (padrão: 123456)"
    )
    parser.add_argument(
        "--url",
        type=str,
        default="http://127.0.0.1:8000",
        help="URL base do backend (padrão: http://127.0.0.1:8000)"
    )
    
    args = parser.parse_args()
    
    test_login(args.nickname, args.password, args.url)

