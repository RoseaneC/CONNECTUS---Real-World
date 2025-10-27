"""
Mission Bus - Gerenciamento de Conexões WebSocket
Sistema de notificações em tempo real para missões
"""

from __future__ import annotations
from typing import Dict, Set
from fastapi import WebSocket
import json

_connections: Dict[int, Set[WebSocket]] = {}

async def register(user_id: int, ws: WebSocket):
    await ws.accept()
    _connections.setdefault(user_id, set()).add(ws)

def unregister(user_id: int, ws: WebSocket):
    _connections.get(user_id, set()).discard(ws)

async def broadcast_user(user_id: int, message: dict):
    data = json.dumps(message)
    for ws in list(_connections.get(user_id, set())):
        try:
            await ws.send_text(data)
        except Exception:
            pass