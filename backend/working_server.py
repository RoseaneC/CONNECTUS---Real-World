#!/usr/bin/env python3
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import uvicorn
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importar apenas o essencial
from app.core.config import settings
from app.core.database import get_db, engine, Base
from app.core.security import verify_token, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Criar app
app = FastAPI(
    title="Connectus API",
    version="1.0.0",
    description="Plataforma gamificada de impacto social"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Dependência de autenticação
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Obtém usuário atual baseado no token JWT"""
    try:
        token = credentials.credentials
        logger.info(f"Token recebido: {token[:20]}...")
        
        payload = verify_token(token)
        
        if payload is None:
            logger.error("Token inválido - payload é None")
            raise HTTPException(status_code=401, detail="Token inválido")
        
        stellar_account_id = payload.get("stellar_account_id")
        if stellar_account_id is None:
            logger.error("Token inválido - stellar_account_id não encontrado")
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user_service = UserService(db)
        user = user_service.get_user_by_stellar_account(stellar_account_id)
        
        if user is None:
            logger.error(f"Usuário não encontrado: {stellar_account_id}")
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        logger.info(f"Usuário autenticado: {user.nickname}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na autenticação: {e}")
        raise HTTPException(status_code=401, detail="Erro de autenticação")

# Rotas básicas
@app.get("/")
async def root():
    return {
        "message": "Bem-vindo à Connectus API",
        "version": "1.0.0",
        "status": "funcionando"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Autenticação
@app.post("/auth/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registra um novo usuário"""
    try:
        user_service = UserService(db)
        
        # Verificar se usuário já existe
        existing_user = user_service.get_user_by_stellar_account(user_data.stellar_account_id)
        if existing_user:
            raise HTTPException(status_code=400, detail="Usuário já registrado")
        
        # Criar usuário
        user = await user_service.create_user(user_data)
        if not user:
            raise HTTPException(status_code=500, detail="Erro ao criar usuário")
        
        # Criar token
        access_token = create_access_token({"stellar_account_id": user.stellar_account_id})
        
        return {
            "user": {
                "id": user.id,
                "nickname": user.nickname,
                "stellar_account_id": user.stellar_account_id
            },
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no registro: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/auth/login")
async def login(stellar_account_id: str, public_key: str, db: Session = Depends(get_db)):
    """Login com carteira Stellar"""
    try:
        user_service = UserService(db)
        
        # Buscar usuário
        user = user_service.get_user_by_stellar_account(stellar_account_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Criar token
        access_token = create_access_token({"stellar_account_id": user.stellar_account_id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Obtém informações do usuário atual"""
    return {
        "id": current_user.id,
        "nickname": current_user.nickname,
        "stellar_account_id": current_user.stellar_account_id,
        "xp": current_user.xp,
        "level": current_user.level
    }

# Rotas protegidas
@app.get("/users/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Obtém perfil do usuário"""
    return {
        "id": current_user.id,
        "nickname": current_user.nickname,
        "xp": current_user.xp,
        "level": current_user.level,
        "tokens_earned": str(current_user.tokens_earned)
    }

if __name__ == "__main__":
    print("🚀 Iniciando servidor Connectus...")
    uvicorn.run(app, host="127.0.0.1", port=8000)




