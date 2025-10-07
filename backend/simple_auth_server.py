#!/usr/bin/env python3
"""
Servidor de autenticação simplificado para Connectus
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
posts_db = {}
missions_db = {}
chat_rooms_db = {}
chat_messages_db = {}
ranking_db = {}

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
        return None
    except jwt.JWTError:
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

def get_user_from_token(request: Request) -> Optional[dict]:
    """Obter usuário a partir do token JWT"""
    authorization = request.headers.get("Authorization")
    
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload:
        return None
    
    user_id = int(payload.get("sub"))
    return users_db.get(user_id)

def initialize_sample_data():
    """Inicializar dados de exemplo"""
    print("🔍 Inicializando dados de exemplo...")
    
    # Missões de exemplo
    missions_db[1] = {
        "id": 1,
        "title": "Primeiro Post",
        "description": "Faça seu primeiro post na plataforma",
        "xp_reward": 50,
        "token_reward": 1.0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    missions_db[2] = {
        "id": 2,
        "title": "Socialize",
        "description": "Comente em 3 posts diferentes",
        "xp_reward": 100,
        "token_reward": 2.0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Salas de chat de exemplo
    chat_rooms_db[1] = {
        "id": 1,
        "name": "Geral",
        "description": "Sala de conversas gerais",
        "is_public": True,
        "members_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    chat_rooms_db[2] = {
        "id": 2,
        "name": "Desenvolvimento",
        "description": "Discussões sobre desenvolvimento",
        "is_public": True,
        "members_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    print("✅ Dados de exemplo inicializados!")

# Rotas
@app.get("/")
async def root():
    return {"message": "Connectus Auth API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Connectus", "version": "1.0.0"}

# Inicializar dados de exemplo
initialize_sample_data()

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

# ===== ROTAS DE POSTS =====
@app.get("/posts/timeline")
async def get_timeline(request: Request, limit: int = 20, offset: int = 0):
    """Obter timeline de posts"""
    print(f"🔍 Buscando timeline - limit: {limit}, offset: {offset}")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Converter posts para lista e ordenar por data
    posts_list = list(posts_db.values())
    posts_list.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Aplicar paginação
    posts_page = posts_list[offset:offset + limit]
    
    # Adicionar dados do usuário a cada post
    result = []
    for post in posts_page:
        post_user = users_db.get(post["user_id"])
        if post_user:
            post_data = post.copy()
            post_data["user"] = UserResponse(**post_user)
            result.append(PostResponse(**post_data))
    
    print(f"✅ Timeline retornada: {len(result)} posts")
    return result

@app.post("/posts/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(post_data: PostCreate, request: Request):
    """Criar novo post"""
    print(f"🔍 Criando novo post...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    post_id = len(posts_db) + 1
    post = {
        "id": post_id,
        "user_id": user["id"],
        "content": post_data.content,
        "image_url": post_data.image_url,
        "likes_count": 0,
        "comments_count": 0,
        "shares_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    posts_db[post_id] = post
    
    # Adicionar dados do usuário
    post_data_response = post.copy()
    post_data_response["user"] = UserResponse(**user)
    
    print(f"✅ Post criado com sucesso! ID: {post_id}")
    return PostResponse(**post_data_response)

@app.get("/posts/my-posts")
async def get_my_posts(request: Request, limit: int = 20, offset: int = 0):
    """Obter posts do usuário atual"""
    print(f"🔍 Buscando posts do usuário...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Filtrar posts do usuário
    user_posts = [post for post in posts_db.values() if post["user_id"] == user["id"]]
    user_posts.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Aplicar paginação
    posts_page = user_posts[offset:offset + limit]
    
    # Adicionar dados do usuário
    result = []
    for post in posts_page:
        post_data = post.copy()
        post_data["user"] = UserResponse(**user)
        result.append(PostResponse(**post_data))
    
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
    
    missions_list = list(missions_db.values())
    result = [MissionResponse(**mission) for mission in missions_list if mission["is_active"]]
    
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
    
    rooms_list = list(chat_rooms_db.values())
    result = [ChatRoomResponse(**room) for room in rooms_list if room["is_public"]]
    
    print(f"✅ Salas de chat retornadas: {len(result)}")
    return result

@app.get("/chat/rooms/{room_id}/messages")
async def get_room_messages(room_id: int, request: Request, limit: int = 50, offset: int = 0):
    """Obter mensagens de uma sala"""
    print(f"🔍 Buscando mensagens da sala {room_id}...")
    
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Filtrar mensagens da sala
    room_messages = [msg for msg in chat_messages_db.values() if msg["room_id"] == room_id]
    room_messages.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Aplicar paginação
    messages_page = room_messages[offset:offset + limit]
    
    # Adicionar dados do usuário
    result = []
    for message in messages_page:
        message_user = users_db.get(message["user_id"])
        if message_user:
            message_data = message.copy()
            message_data["user"] = UserResponse(**message_user)
            result.append(ChatMessageResponse(**message_data))
    
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
    
    # Criar ranking baseado em XP
    users_list = list(users_db.values())
    users_list.sort(key=lambda x: x["xp"], reverse=True)
    
    # Aplicar paginação
    start = (page - 1) * page_size
    end = start + page_size
    users_page = users_list[start:end]
    
    # Criar ranking
    result = []
    for i, user_data in enumerate(users_page, start + 1):
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
    
    # Atualizar campos permitidos
    allowed_fields = ["full_name", "email", "bio"]
    for field in allowed_fields:
        if field in profile_data:
            user[field] = profile_data[field]
    
    print(f"✅ Perfil atualizado: {user['nickname']}")
    return UserResponse(**user)

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor de autenticação Connectus...")
    print("🌐 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
