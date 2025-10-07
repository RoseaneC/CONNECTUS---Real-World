#!/usr/bin/env python3
"""
Servidor de autenticação Connectus com SQLite (SEM IA)
Versão simplificada para testar login
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import jwt
import hashlib
import sqlite3
import os
from typing import Optional, List, Dict, Any

# Configurações
SECRET_KEY = "connectus-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
DATABASE_PATH = "database/connectus.db"

# Criar diretório do banco se não existir
os.makedirs("database", exist_ok=True)

# Configurar CORS
app = FastAPI(title="Connectus API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:5175", 
        "http://127.0.0.1:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class UserCreate(BaseModel):
    nickname: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    age: Optional[int] = None

class UserLogin(BaseModel):
    nickname: str
    password: str

class UserResponse(BaseModel):
    id: int
    nickname: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    age: Optional[int] = None
    xp: int = 0
    level: int = 1
    tokens_earned: float = 0.0
    tokens_available: float = 0.0
    tokens_in_yield: float = 0.0
    is_active: bool = True
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

# Funções de banco de dados
def get_db_connection():
    """Obter conexão com banco de dados"""
    return sqlite3.connect(DATABASE_PATH)

def hash_password(password: str) -> str:
    """Hash da senha usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha"""
    return hash_password(plain_password) == hashed_password

def create_token(user_id: int) -> str:
    """Criar token JWT"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_nickname(nickname: str) -> Optional[Dict[str, Any]]:
    """Obter usuário por nickname"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE nickname = ?", (nickname,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        # Converter tupla para dicionário usando índices
        return {
            "id": user[0],
            "nickname": user[1],
            "password_hash": user[2],
            "full_name": user[3],
            "email": user[4],
            "bio": user[5],
            "age": user[6],
            "xp": user[7],
            "level": user[8],
            "tokens_earned": user[9],
            "tokens_available": user[10],
            "tokens_in_yield": user[11],
            "is_active": bool(user[12]),
            "created_at": user[13]
        }
    return None

def authenticate_user(nickname: str, password: str) -> Optional[Dict[str, Any]]:
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

def get_user_from_token(request: Request) -> Optional[Dict[str, Any]]:
    """Obter usuário a partir do token JWT"""
    authorization = request.headers.get("Authorization")
    
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            # Converter tupla para dicionário usando índices
            return {
                "id": user[0],
                "nickname": user[1],
                "password_hash": user[2],
                "full_name": user[3],
                "email": user[4],
                "bio": user[5],
                "age": user[6],
                "xp": user[7],
                "level": user[8],
                "tokens_earned": user[9],
                "tokens_available": user[10],
                "tokens_in_yield": user[11],
                "is_active": bool(user[12]),
                "created_at": user[13]
            }
        return None
        
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

# Rotas
@app.get("/health")
async def health_check():
    """Verificar saúde da API"""
    return {"status": "ok", "message": "Connectus API funcionando"}

@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Registrar novo usuário"""
    print(f"🔍 Registrando usuário: {user_data.nickname}")
    
    # Verificar se usuário já existe
    existing_user = get_user_by_nickname(user_data.nickname)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nickname já está em uso"
        )
    
    # Criar usuário
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        password_hash = hash_password(user_data.password)
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute("""
            INSERT INTO users (nickname, password_hash, full_name, email, bio, age, xp, level, tokens_earned, tokens_available, tokens_in_yield, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data.nickname,
            password_hash,
            user_data.full_name,
            user_data.email,
            user_data.bio,
            user_data.age,
            0,  # xp
            1,  # level
            0.0,  # tokens_earned
            0.0,  # tokens_available
            0.0,  # tokens_in_yield
            True,  # is_active
            now
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Buscar usuário criado
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        print(f"✅ Usuário {user_data.nickname} registrado com sucesso")
        
        return UserResponse(
            id=user[0],
            nickname=user[1],
            full_name=user[3],
            email=user[4],
            bio=user[5],
            age=user[6],
            xp=user[7],
            level=user[8],
            tokens_earned=user[9],
            tokens_available=user[10],
            tokens_in_yield=user[11],
            is_active=bool(user[12]),
            created_at=user[13]
        )
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao registrar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

@app.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Fazer login"""
    print(f"🔍 Tentativa de login: {credentials.nickname}")
    
    user = authenticate_user(credentials.nickname, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    token = create_token(user["id"])
    expires_in = ACCESS_TOKEN_EXPIRE_MINUTES * 60
    
    print(f"✅ Login bem-sucedido para {credentials.nickname}")
    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=expires_in
    )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(request: Request):
    """Obter informações do usuário atual"""
    print(f"🔍 Buscando informações do usuário atual...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    print(f"✅ Usuário encontrado: {user['nickname']}")
    return UserResponse(
        id=user["id"],
        nickname=user["nickname"],
        full_name=user["full_name"],
        email=user["email"],
        bio=user["bio"],
        age=user["age"],
        xp=user["xp"],
        level=user["level"],
        tokens_earned=user["tokens_earned"],
        tokens_available=user["tokens_available"],
        tokens_in_yield=user["tokens_in_yield"],
        is_active=user["is_active"],
        created_at=user["created_at"]
    )

@app.get("/auth/verify-token")
async def verify_token(request: Request):
    """Verificar se token é válido"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    return {"valid": True, "user_id": user["id"]}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor Connectus (SEM IA)...")
    print("🌐 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🗄️ Banco: SQLite")
    uvicorn.run(app, host="0.0.0.0", port=8000)
