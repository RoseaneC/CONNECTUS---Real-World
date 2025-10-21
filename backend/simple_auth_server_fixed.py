#!/usr/bin/env python3
"""
Servidor de autenticação simplificado para Connectus - VERSÃO FINAL CORRIGIDA
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import hashlib
import json
import time
from datetime import datetime, timedelta, timezone
import jwt

app = FastAPI(title="Connectus Auth API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações
SECRET_KEY = "connectus-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Banco de dados em memória
users_db = {}
tokens_db = {}

# Modelos Pydantic
class UserCreate(BaseModel):
    nickname: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    nickname: str
    password: str

class UserResponse(BaseModel):
    id: int
    nickname: str
    full_name: Optional[str]
    email: Optional[str]
    bio: Optional[str]
    xp: int
    level: int
    tokens_earned: float
    tokens_available: float
    tokens_in_yield: float
    is_active: bool
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# Funções auxiliares
def hash_password(password: str) -> str:
    """Hash da senha usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict) -> str:
    """Criar token JWT"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("❌ Token expirado")
        return None
    except jwt.JWTError as e:
        print(f"❌ Erro JWT: {e}")
        return None

def get_user_by_nickname(nickname: str) -> Optional[dict]:
    """Buscar usuário por nickname"""
    print(f"🔍 Buscando usuário com nickname: {nickname}")
    print(f"🔍 Usuários no banco: {list(users_db.keys())}")
    for user_id, user in users_db.items():
        print(f"🔍 Verificando usuário {user_id}: {user['nickname']}")
        if user["nickname"] == nickname:
            print(f"✅ Usuário encontrado: {user}")
            return user
    print(f"❌ Usuário {nickname} não encontrado")
    return None

def authenticate_user(nickname: str, password: str) -> Optional[dict]:
    """Autenticar usuário"""
    print(f"🔍 Tentando autenticar: {nickname}")
    user = get_user_by_nickname(nickname)
    if not user:
        print(f"❌ Usuário {nickname} não encontrado")
        return None
    if not verify_password(password, user["password_hash"]):
        print(f"❌ Senha incorreta para {nickname}")
        return None
    print(f"✅ Autenticação bem-sucedida para {nickname}")
    return user

# Rotas
@app.get("/")
async def root():
    return {"message": "Connectus Auth API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Connectus", "version": "1.0.0"}

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Registrar novo usuário"""
    print(f"🔍 Tentando registrar usuário: {user_data.nickname}")
    
    # Verificar se nickname já existe
    if get_user_by_nickname(user_data.nickname):
        print(f"❌ Nickname {user_data.nickname} já existe")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nickname já cadastrado"
        )
    
    # Verificar se email já existe (se fornecido)
    if user_data.email:
        for user in users_db.values():
            if user.get("email") == user_data.email:
                print(f"❌ Email {user_data.email} já existe")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email já cadastrado"
                )
    
    # Criar usuário
    user_id = len(users_db) + 1
    user = {
        "id": user_id,
        "nickname": user_data.nickname,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "email": user_data.email,
        "bio": user_data.bio,
        "xp": 0,
        "level": 1,
        "tokens_earned": 0.0,
        "tokens_available": 0.0,
        "tokens_in_yield": 0.0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    users_db[user_id] = user
    print(f"✅ Usuário {user_data.nickname} registrado com sucesso! ID: {user_id}")
    print(f"🔍 Banco de dados atual: {users_db}")
    
    return UserResponse(**user)

@app.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    """Fazer login do usuário"""
    print(f"🔍 Tentativa de login: {login_data.nickname}")
    print(f"🔍 Dados recebidos: nickname={login_data.nickname}, password={'*' * len(login_data.password)}")
    
    user = authenticate_user(login_data.nickname, login_data.password)
    if not user:
        print(f"❌ Falha na autenticação para {login_data.nickname}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    if not user["is_active"]:
        print(f"❌ Usuário {login_data.nickname} está inativo")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    # Criar token
    access_token = create_access_token(data={"sub": str(user["id"])})
    print(f"✅ Login bem-sucedido para {login_data.nickname}! Token criado.")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(request: Request):
    """Obter informações do usuário atual"""
    authorization = request.headers.get("Authorization")
    
    print(f"🔍 Authorization header: {authorization}")
    
    if not authorization or not authorization.startswith("Bearer "):
        print("❌ Token não fornecido ou formato inválido")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorização necessário"
        )
    
    token = authorization.split(" ")[1]
    print(f"🔍 Token extraído: {token[:20]}...")
    
    payload = verify_token(token)
    
    if not payload:
        print("❌ Token inválido ou expirado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    user_id = int(payload.get("sub"))
    print(f"🔍 User ID do token: {user_id}")
    
    user = users_db.get(user_id)
    
    if not user:
        print(f"❌ Usuário {user_id} não encontrado no banco")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )
    
    print(f"✅ Usuário encontrado: {user['nickname']}")
    return UserResponse(**user)

@app.post("/auth/logout")
async def logout():
    """Fazer logout"""
    return {"message": "Logout realizado com sucesso"}

@app.get("/auth/verify-token")
async def verify_token_endpoint(request: Request):
    """Verificar se token é válido"""
    authorization = request.headers.get("Authorization")
    
    if not authorization or not authorization.startswith("Bearer "):
        return {"valid": False, "error": "Token não fornecido"}
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if payload:
        return {"valid": True, "user_id": payload.get("sub")}
    else:
        return {"valid": False, "error": "Token inválido ou expirado"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor de autenticação Connectus CORRIGIDO...")
    print("🌐 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)




