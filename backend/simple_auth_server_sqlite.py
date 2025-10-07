#!/usr/bin/env python3
"""
Servidor de autenticação Connectus com SQLite
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

# Importar rotas de IA
from ai_routes import ai_router

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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas de IA
app.include_router(ai_router)

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
    full_name: Optional[str]
    email: Optional[str]
    bio: Optional[str]
    age: Optional[int]
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

class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    user_id: int
    content: str
    image_url: Optional[str]
    likes_count: int
    comments_count: int
    shares_count: int
    created_at: str
    user: UserResponse

class MissionResponse(BaseModel):
    id: int
    title: str
    description: str
    xp_reward: int
    token_reward: float
    is_active: bool
    created_at: str

class ChatRoomResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_public: bool
    members_count: int
    created_at: str

class ChatMessageResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    content: str
    created_at: str
    user: UserResponse

class RankingResponse(BaseModel):
    id: int
    user_id: int
    nickname: str
    xp: int
    level: int
    tokens_earned: float
    position: int

# Funções auxiliares
def get_db_connection():
    """Obter conexão com o banco de dados"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    """Hash da senha usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha"""
    # Para compatibilidade com o hash simples atual
    return hash_password(plain_password) == hashed_password

def create_token(user_id: int) -> str:
    """Criar token JWT"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Obter usuário por ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return dict(user)
    return None

def get_user_by_nickname(nickname: str) -> Optional[Dict[str, Any]]:
    """Obter usuário por nickname"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE nickname = ?", (nickname,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return dict(user)
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
    payload = verify_token(token)
    
    if not payload:
        return None
    
    user_id = int(payload.get("sub"))
    return get_user_by_id(user_id)

# Rotas
@app.get("/")
async def root():
    return {"message": "Connectus API", "status": "online", "database": "SQLite"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Connectus", "version": "1.0.0", "database": "SQLite"}

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
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
    
    # Criar novo usuário
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO users (nickname, password_hash, full_name, email, bio, age, xp, level, tokens_earned, tokens_available, tokens_in_yield, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data.nickname,
            hash_password(user_data.password),
            user_data.full_name,
            user_data.email,
            user_data.bio,
            user_data.age,
            0,  # xp inicial
            1,  # level inicial
            0.0,  # tokens_earned inicial
            0.0,  # tokens_available inicial
            0.0,  # tokens_in_yield inicial
            True  # is_active
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Buscar usuário criado
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        print(f"✅ Usuário {user_data.nickname} registrado com sucesso! ID: {user_id}")
        return UserResponse(**dict(user))
        
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

# ===== ROTAS DE POSTS =====
@app.get("/posts/timeline")
async def get_timeline(request: Request, limit: int = 20, offset: int = 0):
    """Obter timeline de posts"""
    print(f"🔍 Buscando timeline - limit: {limit}, offset: {offset}")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Buscar posts com dados do usuário
    cursor.execute("""
        SELECT p.*, u.nickname, u.full_name, u.email, u.bio, u.age, u.xp, u.level, 
               u.tokens_earned, u.tokens_available, u.tokens_in_yield, u.is_active, u.created_at as user_created_at
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    """, (limit, offset))
    
    posts = cursor.fetchall()
    conn.close()
    
    result = []
    for post in posts:
        post_dict = dict(post)
        user_data = {
            "id": post_dict["user_id"],
            "nickname": post_dict["nickname"],
            "full_name": post_dict["full_name"],
            "email": post_dict["email"],
            "bio": post_dict["bio"],
            "age": post_dict["age"],
            "xp": post_dict["xp"],
            "level": post_dict["level"],
            "tokens_earned": post_dict["tokens_earned"],
            "tokens_available": post_dict["tokens_available"],
            "tokens_in_yield": post_dict["tokens_in_yield"],
            "is_active": post_dict["is_active"],
            "created_at": post_dict["user_created_at"]
        }
        
        post_response = {
            "id": post_dict["id"],
            "user_id": post_dict["user_id"],
            "content": post_dict["content"],
            "image_url": post_dict["image_url"],
            "likes_count": post_dict["likes_count"],
            "comments_count": post_dict["comments_count"],
            "shares_count": post_dict["shares_count"],
            "created_at": post_dict["created_at"],
            "user": user_data
        }
        
        result.append(PostResponse(**post_response))
    
    print(f"✅ Timeline retornada: {len(result)} posts")
    return result

@app.post("/posts/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(post_data: PostCreate, request: Request):
    """Criar novo post"""
    print(f"🔍 Criando novo post...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO posts (user_id, content, image_url, likes_count, comments_count, shares_count)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user["id"],
            post_data.content,
            post_data.image_url,
            0,  # likes_count
            0,  # comments_count
            0   # shares_count
        ))
        
        post_id = cursor.lastrowid
        conn.commit()
        
        # Buscar post criado com dados do usuário
        cursor.execute("""
            SELECT p.*, u.nickname, u.full_name, u.email, u.bio, u.age, u.xp, u.level, 
                   u.tokens_earned, u.tokens_available, u.tokens_in_yield, u.is_active, u.created_at as user_created_at
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        """, (post_id,))
        
        post = cursor.fetchone()
        
        post_dict = dict(post)
        user_data = {
            "id": post_dict["user_id"],
            "nickname": post_dict["nickname"],
            "full_name": post_dict["full_name"],
            "email": post_dict["email"],
            "bio": post_dict["bio"],
            "age": post_dict["age"],
            "xp": post_dict["xp"],
            "level": post_dict["level"],
            "tokens_earned": post_dict["tokens_earned"],
            "tokens_available": post_dict["tokens_available"],
            "tokens_in_yield": post_dict["tokens_in_yield"],
            "is_active": post_dict["is_active"],
            "created_at": post_dict["user_created_at"]
        }
        
        post_response = {
            "id": post_dict["id"],
            "user_id": post_dict["user_id"],
            "content": post_dict["content"],
            "image_url": post_dict["image_url"],
            "likes_count": post_dict["likes_count"],
            "comments_count": post_dict["comments_count"],
            "shares_count": post_dict["shares_count"],
            "created_at": post_dict["created_at"],
            "user": user_data
        }
        
        print(f"✅ Post criado com sucesso! ID: {post_id}")
        return PostResponse(**post_response)
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao criar post: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

@app.get("/posts/my-posts")
async def get_my_posts(request: Request, limit: int = 20, offset: int = 0):
    """Obter posts do usuário atual"""
    print(f"🔍 Buscando posts do usuário...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT p.*, u.nickname, u.full_name, u.email, u.bio, u.age, u.xp, u.level, 
               u.tokens_earned, u.tokens_available, u.tokens_in_yield, u.is_active, u.created_at as user_created_at
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    """, (user["id"], limit, offset))
    
    posts = cursor.fetchall()
    conn.close()
    
    result = []
    for post in posts:
        post_dict = dict(post)
        user_data = {
            "id": post_dict["user_id"],
            "nickname": post_dict["nickname"],
            "full_name": post_dict["full_name"],
            "email": post_dict["email"],
            "bio": post_dict["bio"],
            "age": post_dict["age"],
            "xp": post_dict["xp"],
            "level": post_dict["level"],
            "tokens_earned": post_dict["tokens_earned"],
            "tokens_available": post_dict["tokens_available"],
            "tokens_in_yield": post_dict["tokens_in_yield"],
            "is_active": post_dict["is_active"],
            "created_at": post_dict["user_created_at"]
        }
        
        post_response = {
            "id": post_dict["id"],
            "user_id": post_dict["user_id"],
            "content": post_dict["content"],
            "image_url": post_dict["image_url"],
            "likes_count": post_dict["likes_count"],
            "comments_count": post_dict["comments_count"],
            "shares_count": post_dict["shares_count"],
            "created_at": post_dict["created_at"],
            "user": user_data
        }
        
        result.append(PostResponse(**post_response))
    
    print(f"✅ Posts do usuário retornados: {len(result)}")
    return result

# ===== ROTAS DE MISSÕES =====
@app.get("/missions")
async def get_missions(request: Request):
    """Obter missões disponíveis"""
    print(f"🔍 Buscando missões...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM missions WHERE is_active = 1 ORDER BY created_at ASC")
    missions = cursor.fetchall()
    conn.close()
    
    result = [MissionResponse(**dict(mission)) for mission in missions]
    
    print(f"✅ Missões retornadas: {len(result)}")
    return result

# ===== ROTAS DE CHAT =====
@app.get("/chat/rooms")
async def get_chat_rooms(request: Request):
    """Obter salas de chat"""
    print(f"🔍 Buscando salas de chat...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM chat_rooms WHERE is_public = 1 ORDER BY created_at ASC")
    rooms = cursor.fetchall()
    conn.close()
    
    result = [ChatRoomResponse(**dict(room)) for room in rooms]
    
    print(f"✅ Salas de chat retornadas: {len(result)}")
    return result

@app.get("/chat/rooms/{room_id}/messages")
async def get_room_messages(room_id: int, request: Request, limit: int = 50, offset: int = 0):
    """Obter mensagens de uma sala"""
    print(f"🔍 Buscando mensagens da sala {room_id}...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT m.*, u.nickname, u.full_name, u.email, u.bio, u.age, u.xp, u.level, 
               u.tokens_earned, u.tokens_available, u.tokens_in_yield, u.is_active, u.created_at as user_created_at
        FROM chat_messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.room_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
    """, (room_id, limit, offset))
    
    messages = cursor.fetchall()
    conn.close()
    
    result = []
    for message in messages:
        message_dict = dict(message)
        user_data = {
            "id": message_dict["user_id"],
            "nickname": message_dict["nickname"],
            "full_name": message_dict["full_name"],
            "email": message_dict["email"],
            "bio": message_dict["bio"],
            "age": message_dict["age"],
            "xp": message_dict["xp"],
            "level": message_dict["level"],
            "tokens_earned": message_dict["tokens_earned"],
            "tokens_available": message_dict["tokens_available"],
            "tokens_in_yield": message_dict["tokens_in_yield"],
            "is_active": message_dict["is_active"],
            "created_at": message_dict["user_created_at"]
        }
        
        message_response = {
            "id": message_dict["id"],
            "room_id": message_dict["room_id"],
            "user_id": message_dict["user_id"],
            "content": message_dict["content"],
            "created_at": message_dict["created_at"],
            "user": user_data
        }
        
        result.append(ChatMessageResponse(**message_response))
    
    print(f"✅ Mensagens retornadas: {len(result)}")
    return result

# ===== ROTAS DE RANKING =====
@app.get("/ranking")
async def get_ranking(request: Request, page: int = 1, page_size: int = 20):
    """Obter ranking de usuários"""
    print(f"🔍 Buscando ranking...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Buscar usuários ordenados por XP
    cursor.execute("""
        SELECT id, nickname, xp, level, tokens_earned
        FROM users
        WHERE is_active = 1
        ORDER BY xp DESC
        LIMIT ? OFFSET ?
    """, (page_size, (page - 1) * page_size))
    
    users = cursor.fetchall()
    conn.close()
    
    result = []
    for i, user_data in enumerate(users, (page - 1) * page_size + 1):
        ranking_data = {
            "id": i,
            "user_id": user_data["id"],
            "nickname": user_data["nickname"],
            "xp": user_data["xp"],
            "level": user_data["level"],
            "tokens_earned": user_data["tokens_earned"],
            "position": i
        }
        result.append(RankingResponse(**ranking_data))
    
    print(f"✅ Ranking retornado: {len(result)} usuários")
    return result

# ===== ROTAS DE PERFIL =====
@app.get("/profile")
async def get_profile(request: Request):
    """Obter perfil do usuário atual"""
    print(f"🔍 Buscando perfil do usuário...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    print(f"✅ Perfil retornado: {user['nickname']}")
    return UserResponse(**user)

@app.put("/profile")
async def update_profile(profile_data: dict, request: Request):
    """Atualizar perfil do usuário"""
    print(f"🔍 Atualizando perfil do usuário...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Atualizar campos permitidos
        allowed_fields = ["full_name", "email", "bio"]
        update_fields = []
        values = []
        
        for field in allowed_fields:
            if field in profile_data:
                update_fields.append(f"{field} = ?")
                values.append(profile_data[field])
        
        if update_fields:
            values.append(user["id"])
            cursor.execute(f"""
                UPDATE users 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, values)
            conn.commit()
        
        # Buscar usuário atualizado
        cursor.execute("SELECT * FROM users WHERE id = ?", (user["id"],))
        updated_user = cursor.fetchone()
        
        print(f"✅ Perfil atualizado: {user['nickname']}")
        return UserResponse(**dict(updated_user))
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao atualizar perfil: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor Connectus com SQLite...")
    print("🌐 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🗄️ Banco: SQLite")
    uvicorn.run(app, host="0.0.0.0", port=8000)
