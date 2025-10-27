"""
WebSocket Router para Missões em Tempo Real
Endpoint /ws/missions para notificações em tempo real
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional

from app.core.database import get_db
from app.core.auth import verify_token
from app.core.config import settings
# from app.ws.missions_bus import mission_bus  # Temporariamente desabilitado

router = APIRouter()
security = HTTPBearer()

async def get_current_user_from_token(token: str, db: Session):
    """Obtém usuário atual a partir do token JWT"""
    try:
        payload = verify_token(token)
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        return user
        
    except Exception as e:
        print(f"❌ Erro ao verificar token WebSocket: {e}")
        return None

@router.websocket("/ws/missions")
async def websocket_missions(
    websocket: WebSocket,
    token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint para notificações de missões em tempo real.
    
    Parâmetros:
    - token: Token JWT para autenticação (opcional para demonstração)
    
    Mensagens enviadas:
    - mission.completed: Missão concluída com sucesso
    - mission.failed: Missão falhada
    - system.message: Mensagem do sistema
    - mission.broadcast: Broadcast de missões (para demonstração)
    """
    try:
        # Conectar WebSocket
        await websocket.accept()
        
        # Autenticação (opcional para demonstração)
        user_id = None
        if token:
            user = await get_current_user_from_token(token, db)
            if user:
                user_id = user.id
                print(f"🔐 WebSocket autenticado para usuário {user_id}")
            else:
                await websocket.close(code=1008, reason="Token inválido")
                return
        else:
            # Para demonstração, permitir conexão sem autenticação
            print("🔓 WebSocket conectado sem autenticação (modo demonstração)")
        
        # Adicionar conexão ao bus
        if user_id:
            await mission_bus.connect(websocket, user_id)
        else:
            # Para demonstração, usar user_id 0
            await mission_bus.connect(websocket, 0)
        
        # Enviar mensagem de boas-vindas
        welcome_message = {
            "type": "system.message",
            "data": {
                "message": "Conectado ao sistema de missões em tempo real",
                "message_type": "success",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }
        await websocket.send_text(json.dumps(welcome_message))
        
        # Loop principal para manter conexão
        try:
            while True:
                # Aguardar mensagem do cliente (ping/pong)
                data = await websocket.receive_text()
                
                # Processar mensagem do cliente
                try:
                    message = json.loads(data)
                    
                    if message.get("type") == "ping":
                        # Responder ping com pong
                        pong_message = {
                            "type": "pong",
                            "timestamp": "2024-01-01T00:00:00Z"
                        }
                        await websocket.send_text(json.dumps(pong_message))
                    
                    elif message.get("type") == "get_stats":
                        # Enviar estatísticas das conexões
                        stats = mission_bus.get_connection_stats()
                        stats_message = {
                            "type": "connection.stats",
                            "data": stats
                        }
                        await websocket.send_text(json.dumps(stats_message))
                    
                    else:
                        # Echo da mensagem recebida
                        echo_message = {
                            "type": "echo",
                            "data": message,
                            "timestamp": "2024-01-01T00:00:00Z"
                        }
                        await websocket.send_text(json.dumps(echo_message))
                
                except json.JSONDecodeError:
                    # Mensagem não é JSON válido, ignorar
                    pass
                
        except WebSocketDisconnect:
            print("🔌 WebSocket desconectado pelo cliente")
        except Exception as e:
            print(f"❌ Erro no WebSocket: {e}")
        
    except Exception as e:
        print(f"❌ Erro ao conectar WebSocket: {e}")
        try:
            await websocket.close(code=1011, reason="Erro interno do servidor")
        except:
            pass
    finally:
        # Remover conexão do bus
        try:
            await mission_bus.disconnect(websocket)
        except:
            pass

@router.get("/ws/missions/info")
async def websocket_info():
    """
    Retorna informações sobre o WebSocket de missões.
    """
    return {
        "endpoint": "/ws/missions",
        "description": "WebSocket para notificações de missões em tempo real",
        "authentication": "Opcional (token JWT)",
        "message_types": [
            "mission.completed",
            "mission.failed", 
            "system.message",
            "mission.broadcast",
            "connection.stats",
            "pong",
            "echo"
        ],
        "client_messages": [
            "ping",
            "get_stats"
        ],
        "example_connection": "ws://localhost:8000/ws/missions?token=YOUR_JWT_TOKEN"
    }

# Importar json no topo do arquivo
import json
