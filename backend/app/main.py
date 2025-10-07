"""
Aplicação principal do Connectus
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.database import create_tables
from app.routers import auth, posts, missions, chat, ranking, users

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Plataforma social gamificada para incentivar estudos e impacto social",
    debug=settings.DEBUG
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(missions.router)
app.include_router(chat.router)
app.include_router(ranking.router)
app.include_router(users.router)

# Criar tabelas do banco de dados automaticamente
try:
    create_tables()
    print("✅ Banco de dados inicializado com sucesso!")
except Exception as e:
    print(f"⚠️  Erro ao inicializar banco: {e}")
    print("💡 O banco será criado na primeira requisição")

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "Connectus API",
        "version": settings.VERSION,
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION
    }

@app.post("/init-db")
async def init_database():
    """Inicializar banco de dados"""
    try:
        create_tables()
        return {
            "message": "Banco de dados inicializado com sucesso",
            "status": "success"
        }
    except Exception as e:
        return {
            "message": f"Erro ao inicializar banco: {str(e)}",
            "status": "error"
        }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handler para exceções HTTP"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler para exceções gerais"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

