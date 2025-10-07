from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import (
    auth_router,
    users_router,
    missions_router,
    posts_router,
    chat_router,
    ranking_router
)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciar ciclo de vida da aplicação"""
    # Startup
    logger.info("Iniciando aplicação Connectus...")
    
    # Criar tabelas do banco de dados
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas do banco de dados criadas com sucesso")
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {e}")
    
    # Inicializar dados padrão
    try:
        from app.services.chat_service import ChatService
        from app.core.database import SessionLocal
        
        db = SessionLocal()
        chat_service = ChatService(db)
        chat_service.create_default_rooms()
        db.close()
        logger.info("Dados padrão inicializados")
    except Exception as e:
        logger.error(f"Erro ao inicializar dados padrão: {e}")
    
    yield
    
    # Shutdown
    logger.info("Encerrando aplicação Connectus...")


# Criar aplicação FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Plataforma gamificada de impacto social para jovens em risco de abandono escolar",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Handlers de erro personalizados
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Erro não tratado: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erro interno do servidor",
            "status_code": 500
        }
    )


# Incluir routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(missions_router)
app.include_router(posts_router)
app.include_router(chat_router)
app.include_router(ranking_router)


# Rotas básicas
@app.get("/")
async def root():
    """Rota raiz da API"""
    return {
        "message": "Bem-vindo à Connectus API",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug
    }


# WebSocket para chat em tempo real
from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import json

class ConnectionManager:
    """Gerenciador de conexões WebSocket"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remover conexões inativas
                self.active_connections.remove(connection)

manager = ConnectionManager()


@app.websocket("/ws/chat/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: int):
    """WebSocket para chat em tempo real"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Processar mensagem
            message = {
                "type": "message",
                "room_id": room_id,
                "user_id": message_data.get("user_id"),
                "content": message_data.get("content"),
                "timestamp": message_data.get("timestamp")
            }
            
            # Broadcast para todos os clientes conectados na sala
            await manager.broadcast(json.dumps(message))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )


