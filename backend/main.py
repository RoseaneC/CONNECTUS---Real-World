# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import settings (absoluto, sem relative)
from backend.core.settings import settings  # NÃO reescrever settings aqui

app = FastAPI(title="VEXA Backend", version="1.0.0")

# CORS (não remover localhost/127.0.0.1:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health
@app.get("/health")
def health():
    return {"ok": True, "provider": settings.AI_PROVIDER, "openai_ok": getattr(settings, "OPENAI_OK", None)}

@app.get("/")
def root():
    return {"ok": True, "msg": "VEXA backend up"}

# Incluir router de IA (se existir)
try:
    from backend.routers.ai_working import router as ai_router
    app.include_router(ai_router, prefix="/ai", tags=["ai"])
    print("[VEXA] Router /ai carregado com sucesso")
except Exception as e:
    # Não falhar o servidor por falta do router; apenas log
    print("[VEXA] Aviso: router /ai não carregado ->", e)

# Incluir router de auth com prefixo /auth (para compatibilidade com frontend)
try:
    from backend.routers.auth import router as auth_router
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    print("[VEXA] Router /auth carregado com sucesso")
except Exception as e:
    print(f"[VEXA] Aviso: router /auth não carregado -> {e}")

# Incluir router de auth com prefixo /api/auth (para compatibilidade adicional)
try:
    from backend.app.api.routers.auth_routes import router as api_auth_router
    app.include_router(api_auth_router, prefix="/api/auth", tags=["auth"])
    print("[VEXA] Router /api/auth carregado com sucesso")
except Exception as e:
    print(f"[VEXA] Aviso: router /api/auth não carregado -> {e}")