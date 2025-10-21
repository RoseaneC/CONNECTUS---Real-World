"""
Aplicação principal do Connectus
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os

from app.core.config import settings
from app.core.database import create_tables, SessionLocal, Base, engine
from app.models.user import User
from app.core.auth import get_password_hash
from app.routers import auth, posts, missions, chat, ranking, users, ai, profile

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Plataforma social gamificada para incentivar estudos e impacto social",
    debug=settings.DEBUG
)

# [CONNECTUS PATCH] Diagnóstico seguro da OpenAI no startup
from app.core.config import settings, _mask_key, _key_source

@app.on_event("startup")
def _log_openai_diag():
    try:
        test_mask = _mask_key(settings.OPENAI_API_KEY_TEST)
        prod_mask = _mask_key(settings.OPENAI_API_KEY)
        src = _key_source()
        used = "none"
        if settings.OPENAI_API_KEY_TEST:
            used = "OPENAI_API_KEY_TEST"
        elif settings.OPENAI_API_KEY:
            used = "OPENAI_API_KEY"

        print(f"🤖 VEXA: Modelo={settings.OPENAI_MODEL}, TestKey={test_mask}, VEXAKey={prod_mask}, Fonte={src}, Preferência={used}")

        if (settings.OPENAI_API_KEY or "").startswith("sk-your") or (settings.OPENAI_API_KEY_TEST or "").startswith("sk-your"):
            print("⚠️  OPENAI_API_KEY/OPENAI_API_KEY_TEST parecem placeholders. Edite backend/.env com suas chaves reais e reinicie.")
    except Exception as e:
        print(f"⚠️ VEXA: erro ao exibir diagnóstico seguro: {e}")

# [CONNECTUS PATCH] Seed opcional no startup
@app.on_event("startup")
def maybe_seed_dev_user():
    try:
        if os.getenv("SEED_DEV_USER", "false").lower() != "true":
            return  # desativado por padrão em produção
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            if not db.query(User).filter_by(nickname="roseane").first():
                u = User(
                    nickname="roseane",
                    email="roseane@example.com",
                    password_hash=get_password_hash("123456"),
                    is_active=True,
                )
                db.add(u)
                db.commit()
                print("✅ [SEED] Usuário 'roseane' criado no startup.")
            else:
                print("ℹ️ [SEED] Usuário 'roseane' já existe. Pulando.")
        finally:
            db.close()
    except Exception as e:
        # não derrubar a app por seed; apenas logar
        print(f"⚠️ [SEED] falhou: {e}")

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

