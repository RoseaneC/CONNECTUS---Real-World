"""
Testes de API para o módulo Impact Score
"""

from fastapi.testclient import TestClient


def test_create_event_and_score_flow(client: TestClient):
    """
    Teste completo: criar evento → verificar score → criar segundo evento → recalcular
    """
    # 1) Criar evento mission_completed sem weight (usa default = 3.0)
    payload = {
        "type": "mission_completed",
        "metadata": {"missionId": 42, "note": "ok"}
    }
    
    response = client.post("/impact/event", json=payload)
    assert response.status_code == 200, f"Erro: {response.text}"
    
    body = response.json()
    assert "event" in body, "Response deve ter 'event'"
    assert "score" in body, "Response deve ter 'score'"
    
    ev = body["event"]
    sc = body["score"]
    
    # Verificar evento criado
    assert ev["type"] == "mission_completed"
    assert ev["weight"] == 3.0  # Default weight
    assert "metadata" in ev, "API deve expor 'metadata' no JSON"
    assert ev["metadata"]["missionId"] == 42
    assert "id" in ev
    assert "user_id" in ev
    assert "timestamp" in ev
    
    # Verificar score calculado
    assert isinstance(sc["score"], (int, float))
    assert sc["score"] >= 0
    assert "breakdown" in sc
    assert "updated_at" in sc
    
    # Verificar breakdown inclui mission_completed
    if sc["breakdown"]:
        assert sc["breakdown"].get("mission_completed", 0) >= 1


def test_create_donation_and_recalculate_score(client: TestClient):
    """
    Teste: criar donation (peso 2.0) e verificar score total
    """
    # Primeiro criar um mission_completed
    response1 = client.post("/impact/event", json={"type": "mission_completed"})
    assert response1.status_code == 200
    score1 = response1.json()["score"]["score"]
    
    # Depois criar donation
    response2 = client.post("/impact/event", json={
        "type": "donation",
        "weight": 2.0,
        "metadata": {"amount": 10}
    })
    assert response2.status_code == 200
    
    score2 = response2.json()["score"]
    
    # Score total esperado = 3.0 (mission) + 2.0 (donation) = 5.0
    assert score2["score"] == 5.0
    assert score2["breakdown"]["mission_completed"] == 1
    assert score2["breakdown"]["donation"] == 1


def test_list_events_and_get_score(client: TestClient):
    """
    Teste: listar eventos e buscar score (com e sem eventos)
    """
    # Buscar score sem eventos (deve retornar 0)
    response = client.get("/impact/score/999")
    assert response.status_code == 200
    
    score = response.json()
    assert score["user_id"] == 999
    assert score["score"] == 0.0
    # breakdown pode ser {} ou None
    assert score["breakdown"] in ({}, None, {"mission_completed": 0, "community_vote": 0, "peer_review": 0, "donation": 0})
    
    # Criar 2 eventos
    client.post("/impact/event", json={"type": "community_vote"})
    client.post("/impact/event", json={"type": "community_vote", "metadata": {"poll": "question1"}})
    
    # Listar eventos
    response2 = client.get("/impact/events/999?page=1&page_size=10")
    assert response2.status_code == 200
    
    events = response2.json()
    assert len(events) >= 2
    
    # Verificar estrutura dos eventos
    for event in events:
        assert "id" in event
        assert "type" in event
        assert "weight" in event
        assert "metadata" in event, "API deve expor 'metadata' no JSON"
        assert "timestamp" in event
        assert event["type"] in ("community_vote", "mission_completed", "donation", "peer_review")


def test_attestation_mock(client: TestClient):
    """
    Teste: gerar attestation mock
    """
    # Criar um evento antes para ter score
    client.post("/impact/event", json={"type": "mission_completed"})
    
    # Gerar attestation
    response = client.post("/impact/attest", json={})
    assert response.status_code == 200
    
    data = response.json()
    assert data["stored"] is True
    assert "attestation_id" in data
    assert "hash" in data
    assert data["hash"].startswith("0x"), "Hash deve começar com 0x"


def test_create_event_with_custom_weight(client: TestClient):
    """
    Teste: criar evento com peso customizado
    """
    payload = {
        "type": "peer_review",
        "weight": 5.0,  # Custom weight
        "metadata": {"review_id": 123}
    }
    
    response = client.post("/impact/event", json=payload)
    assert response.status_code == 200
    
    event = response.json()["event"]
    assert event["weight"] == 5.0
    assert event["metadata"]["review_id"] == 123


def test_create_event_without_metadata(client: TestClient):
    """
    Teste: criar evento sem metadata (campo opcional)
    """
    payload = {"type": "community_vote"}
    
    response = client.post("/impact/event", json=payload)
    assert response.status_code == 200
    
    event = response.json()["event"]
    assert event["type"] == "community_vote"
    # metadata pode ser None ou {}
    assert event.get("metadata") in (None, {})


