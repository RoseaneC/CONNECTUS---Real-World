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

# Incluir routers de auth já existentes SEM alterar nada
# Tente ambas variantes se existirem; se não existirem, ignore silenciosamente
for path_mod, prefix, tag in [
    ("backend.routers.auth", "/auth", "auth"),
    ("backend.app.api.routers.auth", "/auth", "auth"),
    ("backend.app.api.routers.auth_routes", "/api/auth", "auth"),
]:
    try:
        mod = __import__(path_mod, fromlist=["router"])
        app.include_router(mod.router, prefix=prefix, tags=[tag])
        print(f"[VEXA] Router {prefix} carregado com sucesso")
    except Exception as e:
        print(f"[VEXA] Aviso: router {prefix} não carregado -> {e}")
        pass  # não quebrar; apenas seguir