from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ai_history_stub():
    """Testa endpoint /ai/history (agora tolerante a anônimos)"""
    r = client.get("/ai/history?limit=50")
    assert r.status_code == 200  # Agora deve retornar 200 mesmo sem auth
    assert isinstance(r.json(), list)

def test_ai_favorites_stub():
    """Testa endpoint /ai/favorites (agora tolerante a anônimos)"""
    r = client.get("/ai/favorites")
    assert r.status_code == 200  # Agora deve retornar 200 mesmo sem auth

def test_ai_stats_stub():
    """Testa endpoint /ai/stats (agora tolerante a anônimos)"""
    r = client.get("/ai/stats")
    assert r.status_code == 200  # Agora deve retornar 200 mesmo sem auth

def test_ai_chat_public_stub():
    """Testa endpoint /ai/chat-public (ainda exige auth)"""
    r = client.post("/ai/chat-public", json={"message": "olá"})
    assert r.status_code in (200, 401, 403)  # Pode exigir auth

def test_ai_health_endpoint():
    """Testa endpoint /ai/health"""
    r = client.get("/ai/health")
    assert r.status_code == 200
    body = r.json()
    assert "ok" in body
    assert "model" in body
    assert isinstance(body["ok"], bool)

def test_ai_chat_public_behavior(monkeypatch):
    """Testa comportamento da VEXA real (mock)"""
    # Mock da vexa_reply para não chamar a OpenAI nos testes
    from app.services import vexa_ai
    monkeypatch.setattr(vexa_ai, "vexa_reply", lambda msgs: "olá, eu sou a VEXA")
    
    # Simular token de auth (simplificado para teste)
    headers = {"Authorization": "Bearer fake-token"}
    r = client.post("/ai/chat-public", headers=headers, json={"message": "Quem é Justin Bieber?"})
    
    # Pode retornar 401 se não tiver auth real, mas se retornar 200, deve ter resposta da VEXA
    if r.status_code == 200:
        body = r.json()
        assert "VEXA" in body["reply"]
        assert body["reply"] != "VEXA (stub): Quem é Justin Bieber?"
    else:
        # Se não autenticado, pelo menos não deve ser 500
        assert r.status_code in (401, 403)

def test_ranking_stub():
    """Testa endpoint /ranking (agora tolerante a anônimos)"""
    r = client.get("/ranking")
    assert r.status_code == 200  # Agora deve retornar 200 mesmo sem auth
    body = r.json()
    # Verificar estrutura real da resposta do ranking
    assert "rankings" in body and "page" in body

def test_ranking_with_period():
    """Testa endpoint /ranking com parâmetro period"""
    r = client.get("/ranking?period=weekly")
    assert r.status_code == 200  # Agora deve retornar 200 mesmo sem auth

def test_posts_create_fix():
    """Testa se o POST /posts/ não retorna mais erro 500"""
    # Este teste pode falhar com 401 se não tiver token, mas não deve ser 500
    r = client.post("/posts/", json={"content": "Teste de post"})
    assert r.status_code != 500  # Não deve mais ter erro interno
    assert r.status_code in (200, 201, 401, 403, 422)

def test_missions_slash_and_no_slash():
    """Testa anti-regressão: rotas com e sem barra devem funcionar"""
    r1 = client.get("/missions")
    r2 = client.get("/missions/")
    assert r1.status_code in (200, 401)  # conforme proteção atual
    assert r2.status_code == r1.status_code  # Mesmo comportamento

def test_posts_slash_and_no_slash():
    """Testa anti-regressão: POST com e sem barra devem funcionar"""
    r1 = client.post("/posts", json={"content": "Teste"})
    r2 = client.post("/posts/", json={"content": "Teste"})
    assert r1.status_code in (200, 201, 401, 403, 422)
    assert r2.status_code == r1.status_code  # Mesmo comportamento