#!/usr/bin/env python3
"""
Servidor simplificado para teste
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import hashlib
import json
from datetime import datetime

# Modelos Pydantic
class UserCreate(BaseModel):
    nickname: str
    full_name: str
    email: str
    password: str
    age: int

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    nickname: str
    full_name: str
    email: str
    age: int
    xp: int
    tokens_earned: str
    tokens_available: str
    tokens_in_yield: str
    missions_completed: int
    level: int
    is_minor: bool
    is_active: bool
    created_at: str
    last_login: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserRegisterResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str

# Modelos para Posts
class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    content: str
    image_url: Optional[str] = None
    author_id: int
    author_nickname: str
    author_avatar: str
    likes_count: int
    comments_count: int
    is_liked: bool
    created_at: str

# Modelos para Missões
class MissionResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    xp_reward: int
    token_reward: float
    difficulty: str
    is_completed: bool
    progress: int
    deadline: Optional[str] = None

# Modelos para Ranking
class RankingUser(BaseModel):
    position: int
    name: str
    nickname: str
    level: int
    xp: int
    tokens: float
    missions: int
    score: int

# Modelos para Chat
class MessageCreate(BaseModel):
    content: str
    room_id: int

class MessageResponse(BaseModel):
    id: int
    content: str
    user_id: int
    user_nickname: str
    user_avatar: str
    user_level: int
    room_id: int
    timestamp: str
    is_own: bool

class RoomResponse(BaseModel):
    id: int
    name: str
    description: str
    members_count: int
    is_private: bool

# Simulação de banco de dados em memória
users_db = []
user_id_counter = 1

# Dados mockados para demonstração
posts_db = []
post_id_counter = 1

missions_db = [
    {
        "id": 1,
        "title": "Ir à escola",
        "description": "Vá à escola hoje e registre sua presença",
        "category": "school",
        "xp_reward": 50,
        "token_reward": 2.0,
        "difficulty": "easy",
        "is_completed": False,
        "progress": 0,
        "deadline": None
    },
    {
        "id": 2,
        "title": "Estudar 1h30",
        "description": "Dedique 1 hora e 30 minutos aos estudos",
        "category": "study",
        "xp_reward": 75,
        "token_reward": 3.0,
        "difficulty": "medium",
        "is_completed": False,
        "progress": 60,
        "deadline": None
    },
    {
        "id": 3,
        "title": "Reciclar latinhas",
        "description": "Colete e recicle 10 latinhas de alumínio",
        "category": "environment",
        "xp_reward": 100,
        "token_reward": 5.0,
        "difficulty": "medium",
        "is_completed": True,
        "progress": 100,
        "deadline": None
    },
    {
        "id": 4,
        "title": "Cuidar do território",
        "description": "Divulgue oportunidades de estudo na sua comunidade",
        "category": "community",
        "xp_reward": 150,
        "token_reward": 8.0,
        "difficulty": "hard",
        "is_completed": False,
        "progress": 25,
        "deadline": None
    }
]

rooms_db = [
    {
        "id": 1,
        "name": "Geral",
        "description": "Chat geral da comunidade",
        "members_count": 156,
        "is_private": False
    },
    {
        "id": 2,
        "name": "Missões",
        "description": "Discussões sobre missões e conquistas",
        "members_count": 89,
        "is_private": False
    },
    {
        "id": 3,
        "name": "Dúvidas",
        "description": "Tire suas dúvidas aqui",
        "members_count": 45,
        "is_private": False
    },
    {
        "id": 4,
        "name": "Suporte",
        "description": "Suporte técnico",
        "members_count": 12,
        "is_private": False
    }
]

messages_db = []
message_id_counter = 1

# Função para hash de senha
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Função para verificar senha
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# Função para criar token simples
def create_access_token(user_id: int) -> str:
    return f"token_{user_id}_{datetime.now().timestamp()}"

# Criar aplicação FastAPI
app = FastAPI(title="Connectus API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Connectus API funcionando!"}

@app.post("/auth/register", response_model=UserRegisterResponse)
async def register(user_data: UserCreate):
    """Registra um novo usuário"""
    global user_id_counter
    
    # Verificar se email já existe
    for user in users_db:
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=400,
                detail="Usuário já registrado com este email"
            )
    
    # Verificar se nickname já existe
    for user in users_db:
        if user["nickname"] == user_data.nickname:
            raise HTTPException(
                status_code=400,
                detail="Nickname já está em uso"
            )
    
    # Criar usuário
    user_id = user_id_counter
    user_id_counter += 1
    
    is_minor = user_data.age < 18
    now = datetime.now().isoformat()
    
    new_user = {
        "id": user_id,
        "nickname": user_data.nickname,
        "full_name": user_data.full_name,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "age": user_data.age,
        "xp": 0,
        "tokens_earned": "0.0",
        "tokens_available": "0.0",
        "tokens_in_yield": "0.0",
        "missions_completed": 0,
        "level": 1,
        "is_minor": is_minor,
        "is_active": True,
        "created_at": now,
        "last_login": None
    }
    
    users_db.append(new_user)
    
    # Criar token
    access_token = create_access_token(user_id)
    
    # Preparar resposta
    user_response = UserResponse(
        id=new_user["id"],
        nickname=new_user["nickname"],
        full_name=new_user["full_name"],
        email=new_user["email"],
        age=new_user["age"],
        xp=new_user["xp"],
        tokens_earned=new_user["tokens_earned"],
        tokens_available=new_user["tokens_available"],
        tokens_in_yield=new_user["tokens_in_yield"],
        missions_completed=new_user["missions_completed"],
        level=new_user["level"],
        is_minor=new_user["is_minor"],
        is_active=new_user["is_active"],
        created_at=new_user["created_at"],
        last_login=new_user["last_login"]
    )
    
    return UserRegisterResponse(
        user=user_response,
        access_token=access_token,
        token_type="bearer"
    )

@app.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login com email e senha"""
    
    # Buscar usuário
    user = None
    for u in users_db:
        if u["email"] == login_data.email:
            user = u
            break
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos"
        )
    
    # Verificar senha
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos"
        )
    
    # Atualizar último login
    user["last_login"] = datetime.now().isoformat()
    
    # Criar token
    access_token = create_access_token(user["id"])
    
    return Token(
        access_token=access_token,
        token_type="bearer"
    )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user():
    """Obtém informações do usuário atual (simulado)"""
    if not users_db:
        raise HTTPException(
            status_code=401,
            detail="Usuário não encontrado"
        )
    
    # Retornar o primeiro usuário (para teste)
    user = users_db[0]
    
    return UserResponse(
        id=user["id"],
        nickname=user["nickname"],
        full_name=user["full_name"],
        email=user["email"],
        age=user["age"],
        xp=user["xp"],
        tokens_earned=user["tokens_earned"],
        tokens_available=user["tokens_available"],
        tokens_in_yield=user["tokens_in_yield"],
        missions_completed=user["missions_completed"],
        level=user["level"],
        is_minor=user["is_minor"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        last_login=user["last_login"]
    )

# === ROTAS PARA POSTS ===
@app.get("/posts/timeline", response_model=list[PostResponse])
async def get_timeline(limit: int = 20, offset: int = 0):
    """Obter timeline de posts"""
    # Simular posts mockados
    mock_posts = [
        {
            "id": 1,
            "content": "Acabei de completar a missão de reciclagem! 🌱",
            "image_url": None,
            "author_id": 1,
            "author_nickname": "joao_silva",
            "author_avatar": "J",
            "likes_count": 12,
            "comments_count": 3,
            "is_liked": False,
            "created_at": "2024-01-15T14:30:00Z"
        },
        {
            "id": 2,
            "content": "Estudando para o vestibular! 📚 #foco #estudos",
            "image_url": None,
            "author_id": 2,
            "author_nickname": "maria_santos",
            "author_avatar": "M",
            "likes_count": 8,
            "comments_count": 1,
            "is_liked": True,
            "created_at": "2024-01-15T13:45:00Z"
        }
    ]
    return mock_posts[offset:offset+limit]

@app.post("/posts", response_model=PostResponse)
async def create_post(post: PostCreate, token: str = None):
    """Criar novo post"""
    global post_id_counter
    
    # Simular criação de post
    new_post = {
        "id": post_id_counter,
        "content": post.content,
        "image_url": post.image_url,
        "author_id": 1,  # Simular usuário logado
        "author_nickname": "usuario_atual",
        "author_avatar": "U",
        "likes_count": 0,
        "comments_count": 0,
        "is_liked": False,
        "created_at": datetime.now().isoformat()
    }
    
    posts_db.append(new_post)
    post_id_counter += 1
    
    return new_post

@app.post("/posts/{post_id}/like")
async def like_post(post_id: int, token: str = None):
    """Curtir/descurtir post"""
    return {"success": True, "liked": True}

# === ROTAS PARA MISSÕES ===
@app.get("/missions", response_model=list[MissionResponse])
async def get_missions():
    """Obter lista de missões"""
    return missions_db

@app.post("/missions/{mission_id}/complete")
async def complete_mission(mission_id: int, token: str = None):
    """Completar missão"""
    # Simular conclusão de missão
    for mission in missions_db:
        if mission["id"] == mission_id:
            mission["is_completed"] = True
            mission["progress"] = 100
            break
    
    return {"success": True, "message": "Missão completada!"}

# === ROTAS PARA RANKING ===
@app.get("/ranking", response_model=list[RankingUser])
async def get_ranking():
    """Obter ranking de usuários"""
    # Simular ranking mockado
    ranking = [
        {
            "position": 1,
            "name": "João Silva",
            "nickname": "joao_silva",
            "level": 12,
            "xp": 2450,
            "tokens": 125.50,
            "missions": 45,
            "score": 2850
        },
        {
            "position": 2,
            "name": "Maria Santos",
            "nickname": "maria_santos",
            "level": 10,
            "xp": 2100,
            "tokens": 98.75,
            "missions": 38,
            "score": 2450
        },
        {
            "position": 3,
            "name": "Pedro Costa",
            "nickname": "pedro_costa",
            "level": 9,
            "xp": 1850,
            "tokens": 87.25,
            "missions": 35,
            "score": 2150
        }
    ]
    return ranking

# === ROTAS PARA CHAT ===
@app.get("/chat/rooms", response_model=list[RoomResponse])
async def get_rooms():
    """Obter lista de salas de chat"""
    return rooms_db

@app.get("/chat/rooms/{room_id}/messages", response_model=list[MessageResponse])
async def get_messages(room_id: int, limit: int = 50, offset: int = 0):
    """Obter mensagens de uma sala"""
    # Simular mensagens mockadas
    mock_messages = [
        {
            "id": 1,
            "content": "Pessoal, acabei de completar a missão de reciclagem! 🌱",
            "user_id": 1,
            "user_nickname": "joao_silva",
            "user_avatar": "J",
            "user_level": 5,
            "room_id": room_id,
            "timestamp": "14:30",
            "is_own": False
        },
        {
            "id": 2,
            "content": "Parabéns! Eu também estou trabalhando nessa missão.",
            "user_id": 2,
            "user_nickname": "maria_santos",
            "user_avatar": "M",
            "user_level": 8,
            "room_id": room_id,
            "timestamp": "14:32",
            "is_own": False
        },
        {
            "id": 3,
            "content": "Consegui 15 latinhas hoje! A meta era 10 😊",
            "user_id": 3,
            "user_nickname": "usuario_atual",
            "user_avatar": "U",
            "user_level": 3,
            "room_id": room_id,
            "timestamp": "14:35",
            "is_own": True
        }
    ]
    return mock_messages[offset:offset+limit]

@app.post("/chat/rooms/{room_id}/messages", response_model=MessageResponse)
async def send_message(room_id: int, message: MessageCreate, token: str = None):
    """Enviar mensagem para uma sala"""
    global message_id_counter
    
    new_message = {
        "id": message_id_counter,
        "content": message.content,
        "user_id": 1,  # Simular usuário logado
        "user_nickname": "usuario_atual",
        "user_avatar": "U",
        "user_level": 3,
        "room_id": room_id,
        "timestamp": datetime.now().strftime("%H:%M"),
        "is_own": True
    }
    
    messages_db.append(new_message)
    message_id_counter += 1
    
    return new_message

@app.get("/")
async def root():
    return {"message": "Connectus API - Servidor Simplificado"}

if __name__ == "__main__":
    print("🚀 Iniciando servidor simplificado...")
    print("📡 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🔧 Health: http://localhost:8000/health")
    
    uvicorn.run(
        "simple_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )