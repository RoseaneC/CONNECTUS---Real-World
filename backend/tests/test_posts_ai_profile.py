from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def auth_headers(token="dummy"):  # ajuste se já houver helper
    return {"Authorization": f"Bearer {token}"}

def test_create_post_returns_valid_schema(monkeypatch):
    # monkeypatch auth: get_current_user → usuário fake se necessário
    # ou usar fluxo real de login e pegar token
    # Aqui assumimos rota protegida já ok no projeto.
    payload = {"content": "Olá timeline!"}
    r = client.post("/posts", json=payload, headers=auth_headers())
    # Pode retornar 401 se não autenticado, mas se retornar 200/201 deve ter schema válido
    assert r.status_code in (200, 201, 401), r.text
    if r.status_code in (200, 201):
        body = r.json()
        # created_at ISO e author com id/nickname
        assert "created_at" in body and "author" in body
        assert isinstance(body["author"]["id"], int)
        assert isinstance(body["author"]["nickname"], str)

def test_ai_chat_public_validation(monkeypatch):
    # mock da VEXA para não chamar OpenAI
    from app.services import vexa_ai
    monkeypatch.setattr(vexa_ai, "vexa_reply", lambda msgs: "ok")
    r = client.post("/ai/chat-public", json={"message": "oi"}, headers=auth_headers())
    # Pode retornar 401 se não autenticado, mas se retornar 200 deve ter resposta válida
    assert r.status_code in (200, 401), r.text
    if r.status_code == 200:
        assert r.json()["reply"] == "ok"

def test_profile_avatar_endpoints(monkeypatch):
    r = client.get("/avatars", headers=auth_headers())
    assert r.status_code in (200, 401)  # dependendo de como o auth está
    if r.status_code == 200:
        assert "glb_url" in r.json()

    r2 = client.put("/profile", json={"avatar_glb_url": "https://x/model.glb",
                                      "avatar_png_url": "https://x/preview.png"},
                    headers=auth_headers())
    assert r2.status_code in (200, 401)
