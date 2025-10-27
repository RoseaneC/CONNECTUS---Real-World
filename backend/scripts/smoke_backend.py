#!/usr/bin/env python3
"""
ConnectUS Backend Smoke Tests
Testa endpoints críticos sem dependências externas
"""
import urllib.request
import json
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

def request(method, path, body=None, headers=None):
    """Faz uma requisição HTTP simples"""
    url = f"{BASE_URL}{path}"
    
    if headers is None:
        headers = {}
    
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)
    
    try:
        start = time.time()
        with urllib.request.urlopen(req, timeout=5) as response:
            elapsed = int((time.time() - start) * 1000)
            data = response.read().decode('utf-8')
            try:
                parsed = json.loads(data) if data else None
            except:
                parsed = data
            return response.status, parsed, elapsed
    except urllib.error.HTTPError as e:
        elapsed = int((time.time() - start) * 1000)
        return e.code, None, elapsed
    except Exception as e:
        return -1, str(e), 0

def test_public_flags():
    """Teste 1: Feature flags públicos"""
    status, data, elapsed = request("GET", "/public/feature-flags")
    if status == 200 and data and isinstance(data, dict):
        print(f"[OK]  /public/feature-flags ({elapsed}ms) - rpm={data.get('rpm', 'N/A')}")
        return True
    else:
        print(f"[FAIL] /public/feature-flags -> Status: {status}")
        return False

def test_login():
    """Teste 2: Login e captura de token"""
    body = {"nickname": "roseane", "password": "123456"}
    status, data, elapsed = request("POST", "/auth/login", body)
    
    if status == 200 and data and "access_token" in data:
        token = data["access_token"]
        print(f"[OK]  /auth/login ({elapsed}ms) - token obtido")
        return token
    else:
        print(f"[FAIL] /auth/login -> Status: {status}, Body: {data}")
        return None

def test_auth_me(token):
    """Teste 3: Endpoint /auth/me autenticado"""
    if not token:
        print("[SKIP] /auth/me -> sem token")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    status, data, elapsed = request("GET", "/auth/me", headers=headers)
    
    if status == 200 and data and "nickname" in data:
        print(f"[OK]  /auth/me ({elapsed}ms) - user: {data.get('nickname', 'N/A')}")
        return True
    else:
        print(f"[FAIL] /auth/me -> Status: {status}")
        return False

def test_avatars(token):
    """Teste 4: Endpoint /avatars"""
    if not token:
        print("[SKIP] /avatars -> sem token")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    status, data, elapsed = request("GET", "/avatars", headers=headers)
    
    if status == 200 and isinstance(data, dict):
        print(f"[OK]  /avatars ({elapsed}ms) - current: {list(data.get('current', {}).keys())}")
        return True
    else:
        print(f"[FAIL] /avatars -> Status: {status}")
        return False

def test_missions():
    """Teste 5: Endpoint /missions"""
    status, data, elapsed = request("GET", "/missions")
    
    if status == 200 and isinstance(data, list):
        print(f"[OK]  /missions ({elapsed}ms) - items: {len(data)}")
        return True
    else:
        print(f"[FAIL] /missions -> Status: {status}")
        return False

def test_timeline(token):
    """Teste 6: Endpoint /posts/timeline"""
    if not token:
        print("[SKIP] /posts/timeline -> sem token")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    status, data, elapsed = request("GET", "/posts/timeline?limit=5", headers=headers)
    
    if status == 200 and isinstance(data, dict) and "items" in data:
        print(f"[OK]  /posts/timeline ({elapsed}ms) - posts: {len(data['items'])}")
        return True
    else:
        print(f"[FAIL] /posts/timeline -> Status: {status}")
        return False

def main():
    print("=" * 60)
    print(" ConnectUS Backend Smoke Tests")
    print("=" * 60)
    print()
    
    results = []
    
    # Teste 1: Public flags
    results.append(("feature-flags", test_public_flags()))
    print()
    
    # Teste 2: Login
    token = test_login()
    results.append(("login", token is not None))
    print()
    
    # Teste 3: Auth me
    results.append(("auth-me", test_auth_me(token)))
    print()
    
    # Teste 4: Avatars
    results.append(("avatars", test_avatars(token)))
    print()
    
    # Teste 5: Missions
    results.append(("missions", test_missions()))
    print()
    
    # Teste 6: Timeline
    results.append(("timeline", test_timeline(token)))
    print()
    
    # Resumo
    print("=" * 60)
    passed = sum(1 for _, r in results if r)
    total = len(results)
    print(f" Resultado: {passed}/{total} testes passaram")
    print("=" * 60)
    
    if passed == total:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

