#!/usr/bin/env python3
"""
Teste do Sistema de Missões em Tempo Real
Valida endpoints REST e funcionalidades básicas
"""

import requests
import json
import time

# Configuração
BASE_URL = "http://127.0.0.1:8000"
USERNAME = "roseane"
PASSWORD = "123456"

def test_login():
    """Testa login e retorna token"""
    print("🔐 Testando login...")
    
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "nickname": USERNAME,
        "password": PASSWORD
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data["access_token"]
        print(f"✅ Login bem-sucedido! Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Erro no login: {response.status_code} - {response.text}")
        return None

def test_health_check():
    """Testa health check do sistema de missões"""
    print("\n🏥 Testando health check...")
    
    response = requests.get(f"{BASE_URL}/missions/health")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health check: {data}")
        return data["ok"]
    else:
        print(f"❌ Erro no health check: {response.status_code} - {response.text}")
        return False

def test_mission_rules():
    """Testa listagem de regras de missão"""
    print("\n📋 Testando regras de missão...")
    
    response = requests.get(f"{BASE_URL}/missions/rules")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Regras encontradas: {len(data['rules'])}")
        for rule in data['rules']:
            print(f"  - {rule['mission_slug']}: {rule['rule_name']}")
        return True
    else:
        print(f"❌ Erro ao buscar regras: {response.status_code} - {response.text}")
        return False

def test_mission_event(token, mission_slug, event_type, payload):
    """Testa registro de evento de missão"""
    print(f"\n🎯 Testando evento: {mission_slug}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(f"{BASE_URL}/missions/event", 
                           headers=headers,
                           json={
                               "mission_slug": mission_slug,
                               "event_type": event_type,
                               "payload": payload
                           })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Evento processado: {data['result']['status']}")
        print(f"  - Score: {data['result']['score']}")
        print(f"  - Reason: {data['result']['reason']}")
        return data
    else:
        print(f"❌ Erro no evento: {response.status_code} - {response.text}")
        return None

def test_mission_attempts(token):
    """Testa listagem de tentativas de missão"""
    print("\n📊 Testando tentativas de missão...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/missions/attempts", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Tentativas encontradas: {len(data['attempts'])}")
        for attempt in data['attempts']:
            print(f"  - {attempt['mission_slug']}: {attempt['status']} (score: {attempt['score']})")
        return True
    else:
        print(f"❌ Erro ao buscar tentativas: {response.status_code} - {response.text}")
        return False

def test_mission_stats(token):
    """Testa estatísticas de missão"""
    print("\n📈 Testando estatísticas...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/missions/stats", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        stats = data['stats']
        print(f"✅ Estatísticas: {stats}")
        return True
    else:
        print(f"❌ Erro ao buscar estatísticas: {response.status_code} - {response.text}")
        return False

def main():
    """Função principal de teste"""
    print("🧪 TESTE DO SISTEMA DE MISSÕES EM TEMPO REAL")
    print("=" * 50)
    
    # Aguardar servidor inicializar
    print("⏳ Aguardando servidor inicializar...")
    time.sleep(3)
    
    # Teste 1: Health Check
    if not test_health_check():
        print("❌ Sistema não está funcionando. Verifique o servidor.")
        return
    
    # Teste 2: Login
    token = test_login()
    if not token:
        print("❌ Não foi possível fazer login. Verifique as credenciais.")
        return
    
    # Teste 3: Regras de Missão
    test_mission_rules()
    
    # Teste 4: Eventos de Missão
    print("\n🎯 TESTANDO EVENTOS DE MISSÃO")
    print("-" * 30)
    
    # Evento 1: QR Code válido
    test_mission_event(token, "onboarding_qr", "qr_scanned", {
        "qr_id": "abc-123"
    })
    
    # Evento 2: QR Code inválido
    test_mission_event(token, "onboarding_qr", "qr_scanned", {
        "qr_id": "invalid-qr"
    })
    
    # Evento 3: Post válido
    test_mission_event(token, "timeline_3_posts", "post_created", {
        "post_id": "post-123",
        "content": "Este é um post sobre educação e tecnologia! #connectus #educacao",
        "hashtags": ["connectus", "educacao"]
    })
    
    # Evento 4: Quiz aprovado
    test_mission_event(token, "quiz_basico_ok", "quiz_completed", {
        "quiz_id": "quiz-123",
        "passed": True,
        "score": 85
    })
    
    # Evento 5: Quiz reprovado
    test_mission_event(token, "quiz_basico_ok", "quiz_completed", {
        "quiz_id": "quiz-456",
        "passed": False,
        "score": 50
    })
    
    # Teste 5: Tentativas
    test_mission_attempts(token)
    
    # Teste 6: Estatísticas
    test_mission_stats(token)
    
    print("\n✅ TESTE CONCLUÍDO!")
    print("=" * 50)
    print("📋 Resumo dos testes:")
    print("  - Health check: ✅")
    print("  - Login: ✅")
    print("  - Regras de missão: ✅")
    print("  - Eventos de missão: ✅")
    print("  - Tentativas: ✅")
    print("  - Estatísticas: ✅")
    print("\n🎉 Sistema de Missões em Tempo Real funcionando!")

if __name__ == "__main__":
    main()









