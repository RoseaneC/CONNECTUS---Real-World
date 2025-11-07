"""
Aplicação principal do Connectus
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
import uvicorn
import os
from dotenv import load_dotenv

# [WEB3 DEMO] Load env vars early
load_dotenv()

from app.core.config import settings
from app.core.database import create_tables, SessionLocal, Base, engine, resolve_db_path_from_env, ensure_core_schema
from app.models.user import User
from app.core.auth import get_password_hash
from app.routers import auth, posts, missions, chat, ranking, users, ai, profile, wallet, staking, system_flags, public_flags, avatars, impact
from app.routers import missions_realtime, missions_ws
# [WEB3 DEMO] Import router demo
try:
    from app.routers import wallet_demo as _wallet_demo_module
    wallet_demo = _wallet_demo_module
except ImportError as e:
    print(f"⚠️  wallet_demo router não encontrado: {e}")
    wallet_demo = None

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Plataforma social gamificada para incentivar estudos e impacto social",
    debug=settings.DEBUG
)

# [CONNECTUS HOTFIX] Configurar CORS antes de importar rotas
origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "https://readyplayer.me",
]

print(f"🌐 CORS configurado para origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

print(f"🚀 Servidor iniciando em: http://127.0.0.1:8000")
print(f"🗄️  DB Path (resolved): {resolve_db_path_from_env()}")

# Incluir rotas
app.include_router(auth.router)
app.include_router(posts.router)

# [CONNECTUS PATCH] Rotas de missões em tempo real (devem vir antes das rotas gerais)
app.include_router(missions_realtime.router)
app.include_router(missions_ws.router)

# Rotas gerais de missões (devem vir depois das específicas)
app.include_router(missions.router)
app.include_router(chat.router)
app.include_router(ranking.router)
app.include_router(users.router)
app.include_router(ai.router)
app.include_router(profile.router)
app.include_router(wallet.router)
app.include_router(staking.router)
app.include_router(system_flags.router)
app.include_router(public_flags.router)
app.include_router(avatars.router)
app.include_router(impact.router)

# [WEB3 DEMO] import e registro robustos
try:
    from app.routers import wallet_demo as _wallet_demo
except Exception as e:
    _wallet_demo = None
    print(f"⚠️ wallet_demo indisponível: {e}")

demo_enabled = os.getenv("ENABLE_WEB3_DEMO_MODE") == "1"
print(f"🔧 ENABLE_WEB3_DEMO_MODE={os.getenv('ENABLE_WEB3_DEMO_MODE')} (demo_enabled={demo_enabled})")

if _wallet_demo and demo_enabled:
    app.include_router(_wallet_demo.router)  # router já tem prefix="/wallet/demo"
    print("✅ Web3 Demo habilitado: /wallet/demo/*")
    try:
        from fastapi.routing import APIRoute
        demo_routes = [r for r in app.routes if isinstance(r, APIRoute) and r.path.startswith("/wallet/demo")]
        print("📋 Rotas demo:", [f"{list(r.methods)[0]} {r.path}" for r in demo_routes])
    except Exception as e:
        print(f"⚠️ Falha ao listar rotas demo: {e}")
else:
    print("ℹ️ Web3 Demo Mode DESABILITADO")

# Criar tabelas do banco de dados automaticamente
print(f"🗄️  DB Path (resolved): {resolve_db_path_from_env()}")
try:
    create_tables()
    # Garantir schema essencial
    ensure_core_schema()
    print("✅ Schema essencial garantido!")
    print("✅ Banco de dados inicializado com sucesso!")
except Exception as e:
    print(f"⚠️  Erro ao inicializar banco: {e}")
    print("💡 O banco será criado na primeira requisição")

def _ensure_user_avatar_columns():
    """Garante colunas de avatar na tabela users (idempotente)."""
    try:
        with SessionLocal() as db:
            cols = {row[1] for row in db.execute(text("PRAGMA table_info(users)")).fetchall()}
            to_add = []
            if "avatar_url" not in cols:
                to_add.append(("avatar_url", "TEXT"))
            if "avatar_glb_url" not in cols:
                to_add.append(("avatar_glb_url", "TEXT"))
            if "avatar_png_url" not in cols:
                to_add.append(("avatar_png_url", "TEXT"))
            for name, typ in to_add:
                db.execute(text(f"ALTER TABLE users ADD COLUMN {name} {typ}"))
            if to_add:
                db.commit()
                print(f"✅ Colunas de avatar adicionadas: {[name for name, _ in to_add]}")
    except Exception as e:
        print(f"⚠️  Erro ao garantir colunas de avatar: {e}")

def _ensure_demo_wallet_tables():
    """Garante tabelas demo de wallet (idempotente)."""
    try:
        with SessionLocal() as db:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS demo_wallets(
                    user_id INTEGER PRIMARY KEY,
                    balance REAL DEFAULT 0.0,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """))
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS demo_stakes(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    apr REAL NOT NULL DEFAULT 10.0,
                    days INTEGER NOT NULL,
                    status TEXT NOT NULL DEFAULT 'locked',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    unlock_at TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """))
            db.commit()
    except Exception as e:
        print(f"⚠️  ensure_demo_wallet_tables: {e}")

def _ensure_impact_tables():
    """Garante tabelas de Impact Score (idempotente)."""
    try:
        with SessionLocal() as db:
            # Tabela impact_events
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS impact_events(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    weight REAL NOT NULL DEFAULT 0,
                    metadata TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    CHECK(weight >= 0)
                )
            """))
            
            # Índices
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_impact_events_user_id ON impact_events(user_id)"))
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_impact_events_type ON impact_events(type)"))
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_impact_events_user_timestamp ON impact_events(user_id, timestamp)"))
            
            # Tabela impact_scores
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS impact_scores(
                    user_id INTEGER PRIMARY KEY,
                    score REAL NOT NULL DEFAULT 0,
                    breakdown TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """))
            
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_impact_scores_user_id ON impact_scores(user_id)"))
            
            db.commit()
            print("✅ Tabelas de Impact Score criadas/verificadas")
    except Exception as e:
        print(f"⚠️  ensure_impact_tables: {e}")

def _ensure_min_schema_on_startup():
    """Garante colunas/ tabelas essenciais sem quebrar caso já existam."""
    try:
        with SessionLocal() as db:
            # Colunas em users
            cols = db.execute(text("PRAGMA table_info(users)")).fetchall()
            names = {c[1] for c in cols}
            stmts = []
            if "avatar_url" not in names:
                stmts.append("ALTER TABLE users ADD COLUMN avatar_url TEXT")
            if "avatar_glb_url" not in names:
                stmts.append("ALTER TABLE users ADD COLUMN avatar_glb_url TEXT")
            if "avatar_png_url" not in names:
                stmts.append("ALTER TABLE users ADD COLUMN avatar_png_url TEXT")
            for s in stmts:
                db.execute(text(s))

            # Tabelas de wallet
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS wallet_addresses(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    address TEXT UNIQUE,
                    verified_at TEXT
                )
            """))
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS token_transfers(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    tx_hash TEXT,
                    amount REAL DEFAULT 0,
                    created_at TEXT
                )
            """))
            db.commit()
    except Exception as e:
        # nunca aborta startup
        print(f"⚠️  ensure_min_schema: {e}")

@app.on_event("startup")
def _startup_min_schema():
    _ensure_min_schema_on_startup()
    _ensure_user_avatar_columns()
    _ensure_impact_tables()
    # [WEB3 DEMO] Create demo wallet tables if flag enabled
    if os.getenv("ENABLE_WEB3_DEMO_MODE") == "1":
        _ensure_demo_wallet_tables()

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

# [DEV DEBUG] List routes (only if DEBUG=1)
DEV_DEBUG = os.getenv("DEBUG", "1") == "1"
if DEV_DEBUG:
    @app.get("/__routes")
    def __routes():
        from fastapi.routing import APIRoute
        routes = []
        for r in app.routes:
            if isinstance(r, APIRoute):
                routes.append({"path": r.path, "methods": list(r.methods)})
        return {"routes": routes, "total": len(routes)}

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

# [CONNECTUS TESTING] Endpoint opcional de health check (somente se flag ativada)
@app.on_event("startup")
def _mount_dev_health():
    if os.getenv("ENABLE_DEV_HEALTH") != "1":
        return
    
    # Registrar endpoint de health
    @app.get("/__health")
    def __health():
        from app.core.database import SessionLocal
        try:
            with SessionLocal() as db:
                cols = db.execute(text("PRAGMA table_info(users)")).fetchall()
                colnames = [c[1] for c in cols]
            
            return {
                "ok": True,
                "version": settings.VERSION,
                "has_avatar_cols": all(c in colnames for c in ["avatar_glb_url", "avatar_png_url"]),
                "colnames": colnames,
            }
        except Exception as e:
            return {"ok": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

