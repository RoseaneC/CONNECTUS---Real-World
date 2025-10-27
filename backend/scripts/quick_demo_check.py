#!/usr/bin/env python3
"""
Quick check for Web3 Demo Mode
Tests login, mint, and status endpoints
"""
import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def request(method, path, body=None, headers=None):
    """Make HTTP request"""
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
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8')) if e.read() else None
    except Exception as e:
        return -1, str(e)

def main():
    print("=" * 60)
    print(" Web3 Demo Mode - Quick Check")
    print("=" * 60)
    print()
    
    # 1. Login
    print("1️⃣  Fazendo login...")
    status, data = request("POST", "/auth/login", {"nickname": "roseane", "password": "123456"})
    
    if status != 200 or "access_token" not in data:
        print(f"[FAIL] Login falhou: {status}")
        sys.exit(1)
    
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK]  Login OK")
    print()
    
    # 2. Status inicial
    print("2️⃣  Buscando status inicial...")
    status, data = request("GET", "/wallet/demo/status", headers=headers)
    
    if status == 404:
        print("[FAIL] /wallet/demo/status retornou 404!")
        print("       Router demo não está registrado")
        sys.exit(1)
    
    balance_before = data.get("balance", 0) if data else 0
    print(f"[OK]  Saldo inicial: {balance_before}")
    print()
    
    # 3. Mint
    print("3️⃣  Mintando 10 tokens...")
    status, data = request("POST", "/wallet/demo/mint", {"amount": 10}, headers=headers)
    
    if status != 200:
        print(f"[FAIL] Mint falhou: {status}")
        sys.exit(1)
    
    print(f"[OK]  Mint OK: {data.get('minted', 'N/A')} tokens")
    print()
    
    # 4. Status final
    print("4️⃣  Verificando saldo final...")
    status, data = request("GET", "/wallet/demo/status", headers=headers)
    
    if status != 200:
        print(f"[FAIL] Status final falhou: {status}")
        sys.exit(1)
    
    balance_after = data.get("balance", 0)
    print(f"[OK]  Saldo final: {balance_after}")
    
    if balance_after < balance_before + 10:
        print("[FAIL] Saldo não aumentou corretamente!")
        sys.exit(1)
    
    print()
    print("=" * 60)
    print(" ✅ Todos os testes passaram!")
    print("=" * 60)

if __name__ == "__main__":
    main()

