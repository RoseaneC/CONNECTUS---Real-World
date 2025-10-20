"""
Aplicação principal do Connectus
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.database import create_tables
from app.routers import auth, posts, missions, chat, ranking, users, ai, profile

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Plataforma social gamificada para incentivar estudos e impacto social",
    debug=settings.DEBUG
)

# Evitar redirect automático 307 por barra final
# (Starlette/FastAPI: desliga o redirect e nós oferecemos as duas rotas)
try:
    app.router.redirect_slashes = False
except Exception:
    pass

# Configurar CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

print(f"🌐 CORS configurado para origins: {origins}")
print(f"🚀 Servidor iniciando em: http://127.0.0.1:8000")

# Log do status da VEXA
if settings.OPENAI_API_KEY:
    print(f"🤖 VEXA: Configurada com modelo {settings.OPENAI_MODEL}")
else:
    print("🤖 VEXA: Rodando em modo limitado (sem IA) - configure OPENAI_API_KEY para ativar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(missions.router)
app.include_router(chat.router)
app.include_router(ranking.router)
app.include_router(users.router)
app.include_router(ai.router)
app.include_router(profile.router)

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
    return {"status": "ok"}

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

