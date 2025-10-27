#!/usr/bin/env python3
"""
Quick check for Web3 Demo Mode routes
Tests /__routes and /wallet/demo/status
"""
import requests
import os
import sys

BASE = os.environ.get("BASE", "http://127.0.0.1:8000")

def check_route(path):
    try:
        r = requests.get(f"{BASE}{path}", timeout=3)
        print(f"{path} → {r.status_code}")
        if r.ok:
            try:
                json_data = r.json()
                if path == "/__routes":
                    # Show demo routes only
                    routes = json_data.get("routes", [])
                    demo_routes = [r for r in routes if r["path"].startswith("/wallet/demo")]
                    print(f"  📋 Rotas /wallet/demo encontradas: {len(demo_routes)}")
                    for route in demo_routes[:5]:
                        print(f"     {list(route['methods'])[0]} {route['path']}")
                else:
                    print(f"  ✅ {json_data}")
            except Exception as e:
                print(f"  (não-JSON: {r.text[:50]})")
    except Exception as e:
        print(f"{path} → ERR: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print(" Web3 Demo Mode - Route Check")
    print("=" * 60)
    print()
    
    # 1. List all routes
    print("1️⃣ Verificando /__routes...")
    check_route("/__routes")
    print()
    
    # 2. Check demo status (should return 401 if not authenticated)
    print("2️⃣ Verificando /wallet/demo/status (sem auth)...")
    check_route("/wallet/demo/status")
    print()
    
    # 3. Try with auth
    print("3️⃣ Verificando com autenticação...")
    try:
        # Login
        login_resp = requests.post(
            f"{BASE}/auth/login",
            json={"nickname": "roseane", "password": "123456"},
            timeout=3
        )
        if login_resp.status_code == 200:
            token = login_resp.json()["access_token"]
            
            # Status
            status_resp = requests.get(
                f"{BASE}/wallet/demo/status",
                headers={"Authorization": f"Bearer {token}"},
                timeout=3
            )
            print(f"/wallet/demo/status (autenticado) → {status_resp.status_code}")
            if status_resp.ok:
                print(f"  ✅ {status_resp.json()}")
        else:
            print(f"  ❌ Login falhou: {login_resp.status_code}")
    except Exception as e:
        print(f"  ❌ Erro: {e}")
    
    print()
    print("=" * 60)

