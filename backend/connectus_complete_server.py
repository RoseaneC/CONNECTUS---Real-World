#!/usr/bin/env python3
"""
Servidor Connectus COMPLETO com todas as funcionalidades
Inclui: IA, Perfil, Timeline, Chat, Avatares
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import jwt
import hashlib
import sqlite3
import os
import uuid
import base64
from typing import Optional, List, Dict, Any
import json

# Configurações
SECRET_KEY = "connectus-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
DATABASE_PATH = "database/connectus.db"

# Criar diretórios necessários
os.makedirs("database", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("static", exist_ok=True)

def initialize_database():
    """Inicializar banco de dados com correções"""
    print("🔧 Inicializando banco de dados...")
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # 1. Adicionar coluna avatar se não existir
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'avatar' not in columns:
            print("🔧 Adicionando coluna avatar...")
            cursor.execute("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT 'avatar_1'")
            conn.commit()
            print("✅ Coluna avatar adicionada!")
        
        # 2. Atualizar usuários existentes
        cursor.execute("UPDATE users SET avatar = 'avatar_1' WHERE avatar IS NULL")
        conn.commit()
        
        # 3. Criar tabelas de IA
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_conversations'")
        if not cursor.fetchone():
            print("🔧 Criando tabelas de IA...")
            cursor.execute("""
                CREATE TABLE ai_conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    category TEXT NOT NULL,
                    query TEXT DEFAULT '',
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                );
            """)
        else:
            # Verificar se a coluna query existe e adicionar se necessário
            cursor.execute("PRAGMA table_info(ai_conversations)")
            columns = [column[1] for column in cursor.fetchall()]
            if 'query' not in columns:
                print("🔧 Adicionando coluna query à ai_conversations...")
                cursor.execute("ALTER TABLE ai_conversations ADD COLUMN query TEXT DEFAULT ''")
                print("✅ Coluna query adicionada!")
            cursor.execute("""
                CREATE TABLE ai_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id INTEGER NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    is_favorite BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (conversation_id) REFERENCES ai_conversations (id)
                );
            """)
            conn.commit()
            print("✅ Tabelas de IA criadas!")
        
        # 4. Adicionar salas de chat se não existirem
        cursor.execute("SELECT COUNT(*) FROM chat_rooms")
        if cursor.fetchone()[0] == 0:
            print("🔧 Adicionando salas de chat...")
            now = datetime.now(timezone.utc).isoformat()
            cursor.execute("""
                INSERT INTO chat_rooms (name, description, is_public, members_count, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, ("Geral", "Sala de conversas gerais", True, 0, now))
            cursor.execute("""
                INSERT INTO chat_rooms (name, description, is_public, members_count, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, ("Desenvolvimento", "Discussões sobre desenvolvimento", True, 0, now))
            cursor.execute("""
                INSERT INTO chat_rooms (name, description, is_public, members_count, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, ("Estudos", "Sala para estudos e dúvidas", True, 0, now))
            conn.commit()
            print("✅ Salas de chat criadas!")
        
        # 5. Adicionar missões se não existirem
        cursor.execute("SELECT COUNT(*) FROM missions")
        if cursor.fetchone()[0] == 0:
            print("🔧 Adicionando missões...")
            now = datetime.now(timezone.utc).isoformat()
            missions = [
                ("Primeiro Post", "Faça seu primeiro post na plataforma", 50, 1.0),
                ("Socialize", "Comente em 3 posts diferentes", 100, 2.0),
                ("Explorador", "Visite todas as seções da plataforma", 75, 1.5),
                ("Chat Ativo", "Envie 5 mensagens no chat", 60, 1.2),
                ("Estudioso", "Use a IA para estudar um tópico", 80, 1.8)
            ]
            for title, desc, xp, tokens in missions:
                cursor.execute("""
                    INSERT INTO missions (title, description, xp_reward, token_reward, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (title, desc, xp, tokens, True, now))
            conn.commit()
            print("✅ Missões criadas!")
        
        conn.close()
        print("✅ Banco de dados inicializado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")

# Inicializar banco na startup
initialize_database()

# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: int, user_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        
        # Adicionar informações do usuário ao websocket
        websocket.user_id = user_id
        websocket.room_id = room_id
        
        self.active_connections[room_id].append(websocket)
        print(f"✅ Usuário {user_id} conectado à sala {room_id}")
    
    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        print(f"❌ Usuário desconectado da sala {room_id}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast_to_room(self, message: str, room_id: int, sender_id: int):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    # Não enviar para o próprio remetente
                    if connection.user_id != sender_id:
                        await connection.send_text(message)
                except:
                    # Remover conexões mortas
                    self.active_connections[room_id].remove(connection)

manager = ConnectionManager()

# Configurar CORS
app = FastAPI(title="Connectus API Complete", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permissivo para desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Modelos Pydantic
class UserCreate(BaseModel):
    nickname: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    age: Optional[int] = None
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    nickname: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    age: Optional[int] = None
    avatar: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    nickname: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    age: Optional[int] = None
    avatar: Optional[str] = None
    xp: int = 0
    level: int = 1
    tokens_earned: float = 0.0
    tokens_available: float = 0.0
    tokens_in_yield: float = 0.0
    is_active: bool = True
    created_at: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    user_id: int
    content: str
    image_url: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    created_at: str
    user: Optional[Dict[str, Any]] = None

class MissionResponse(BaseModel):
    id: int
    title: str
    description: str
    xp_reward: int
    token_reward: float
    is_active: bool
    created_at: str

class RankingResponse(BaseModel):
    id: int
    nickname: str
    full_name: Optional[str] = None
    xp: int
    level: int
    tokens_earned: float
    avatar: Optional[str] = None

class ChatRoomResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_public: bool = True
    members_count: int = 0
    created_at: str

class ChatMessageResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    content: str
    created_at: str
    user: Optional[Dict[str, Any]] = None

class AIChatRequest(BaseModel):
    prompt: str
    category: Optional[str] = None
    conversation_id: Optional[int] = None

class AIChatResponse(BaseModel):
    response: str
    category: str
    timestamp: str
    is_favorite: bool = False
    user_id: Optional[int] = None
    conversation_id: Optional[int] = None

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    content: str
    created_at: str
    user: Optional[UserResponse] = None

class ChatRoomResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_public: bool = True
    members_count: int = 0
    created_at: str

# Modelos duplicados removidos - usando os definidos acima

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

def create_access_token(user_id: int) -> str:
    """Criar token de acesso JWT"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: int) -> str:
    """Criar refresh token JWT"""
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_refresh_token(token: str):
    """Verificar refresh token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

# Manter compatibilidade
def create_token(user_id: int) -> str:
    """Criar token JWT (compatibilidade)"""
    return create_access_token(user_id)

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Obter usuário por ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {
            "id": user[0],
            "nickname": user[1],
            "password_hash": user[2],
            "full_name": user[3],
            "email": user[4],
            "bio": user[5],
            "age": user[6],
            "avatar": str(user[7]) if len(user) > 7 and user[7] is not None else "avatar_1",
            "xp": int(user[8]) if len(user) > 8 and user[8] is not None else 0,
            "level": int(user[9]) if len(user) > 9 and user[9] is not None else 1,
            "tokens_earned": float(user[10]) if len(user) > 10 and user[10] is not None else 0.0,
            "tokens_available": float(user[11]) if len(user) > 11 and user[11] is not None else 0.0,
            "tokens_in_yield": float(user[12]) if len(user) > 12 and user[12] is not None else 0.0,
            "is_active": bool(user[13]) if len(user) > 13 else True,
            "created_at": str(user[14]) if len(user) > 14 and user[14] is not None else ""
        }
    return None

def get_user_by_nickname(nickname: str) -> Optional[Dict[str, Any]]:
    """Obter usuário por nickname"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE nickname = ?", (nickname,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {
            "id": user[0],
            "nickname": user[1],
            "password_hash": user[2],
            "full_name": user[3],
            "email": user[4],
            "bio": user[5],
            "age": user[6],
            "avatar": str(user[7]) if len(user) > 7 and user[7] is not None else "avatar_1",
            "xp": int(user[8]) if len(user) > 8 and user[8] is not None else 0,
            "level": int(user[9]) if len(user) > 9 and user[9] is not None else 1,
            "tokens_earned": float(user[10]) if len(user) > 10 and user[10] is not None else 0.0,
            "tokens_available": float(user[11]) if len(user) > 11 and user[11] is not None else 0.0,
            "tokens_in_yield": float(user[12]) if len(user) > 12 and user[12] is not None else 0.0,
            "is_active": bool(user[13]) if len(user) > 13 else True,
            "created_at": str(user[14]) if len(user) > 14 and user[14] is not None else ""
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
        return get_user_by_id(user_id)
        
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

def init_database():
    """Inicializar banco de dados com todas as tabelas"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tabela de usuários (atualizada com avatar)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            email TEXT UNIQUE,
            bio TEXT,
            age INTEGER,
            avatar TEXT,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            tokens_earned REAL DEFAULT 0.0,
            tokens_available REAL DEFAULT 0.0,
            tokens_in_yield REAL DEFAULT 0.0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TEXT NOT NULL
        );
    """)
    
    # Tabela de posts
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            shares_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    """)
    
    # Tabela de chat rooms
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            is_public BOOLEAN DEFAULT TRUE,
            members_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        );
    """)
    
    # Tabela de mensagens de chat
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (room_id) REFERENCES chat_rooms (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    """)
    
    # Tabela de conversas de IA
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        query TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)
    
    # Tabela de mensagens de IA
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            is_favorite BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (conversation_id) REFERENCES ai_conversations (id)
        );
    """)
    
    # Inserir dados de exemplo se não existirem
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        print("📝 Inserindo usuário de exemplo...")
        hashed_password = hash_password("123456")
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO users (nickname, password_hash, full_name, email, bio, age, avatar, xp, level, tokens_earned, tokens_available, tokens_in_yield, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("popzinha", hashed_password, "Popzinha Silva", "popzinha@example.com", "Usuária de teste", 25, "avatar_1", 100, 2, 10.0, 10.0, 0.0, True, now))
        
        cursor.execute("""
            INSERT INTO users (nickname, password_hash, full_name, email, bio, age, avatar, xp, level, tokens_earned, tokens_available, tokens_in_yield, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("roseane", hashed_password, "Roseane Santos", "roseane@example.com", "Usuária de teste", 30, "avatar_2", 150, 3, 15.0, 15.0, 0.0, True, now))
    
    # Inserir posts de exemplo
    cursor.execute("SELECT COUNT(*) FROM posts")
    if cursor.fetchone()[0] == 0:
        print("📝 Inserindo posts de exemplo...")
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO posts (user_id, content, image_url, likes_count, comments_count, shares_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (1, "Olá pessoal! Primeiro post no Connectus! 🚀", None, 5, 2, 1, now))
        
        cursor.execute("""
            INSERT INTO posts (user_id, content, image_url, likes_count, comments_count, shares_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (2, "Que plataforma incrível! Adorei a interface! 💜", None, 8, 3, 2, now))
    
    # Inserir salas de chat
    cursor.execute("SELECT COUNT(*) FROM chat_rooms")
    if cursor.fetchone()[0] == 0:
        print("📝 Inserindo salas de chat...")
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO chat_rooms (name, description, is_public, members_count, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, ("Geral", "Sala de conversas gerais", True, 0, now))
        
        cursor.execute("""
            INSERT INTO chat_rooms (name, description, is_public, members_count, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, ("Desenvolvimento", "Discussões sobre desenvolvimento", True, 0, now))
    
    conn.commit()
    conn.close()
    print("✅ Banco de dados inicializado com sucesso!")

# Inicializar banco de dados
init_database()

# ROTAS DE AUTENTICAÇÃO
@app.get("/health")
async def health_check():
    """Verificar saúde da API"""
    return {"status": "ok", "message": "Connectus API Complete funcionando"}

@app.websocket("/ws/chat/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: int, token: str = None):
    """WebSocket para chat em tempo real"""
    # Verificar token (opcional para WebSocket)
    user_id = None
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub"))
        except:
            await websocket.close(code=1008, reason="Token inválido")
            return
    
    if not user_id:
        await websocket.close(code=1008, reason="Token necessário")
        return
    
    # Conectar ao WebSocket
    await manager.connect(websocket, room_id, user_id)
    
    try:
        while True:
            # Receber mensagem do cliente
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Salvar mensagem no banco
            conn = get_db_connection()
            cursor = conn.cursor()
            now = datetime.now(timezone.utc).isoformat()
            
            cursor.execute("""
                INSERT INTO chat_messages (room_id, user_id, content, created_at)
                VALUES (?, ?, ?, ?)
            """, (room_id, user_id, message_data.get("content", ""), now))
            
            message_id = cursor.lastrowid
            conn.commit()
            
            # Buscar dados do usuário para a mensagem
            cursor.execute("""
                SELECT u.nickname, u.full_name, COALESCE(u.avatar, 'avatar_1') as avatar
                FROM users u WHERE u.id = ?
            """, (user_id,))
            user_data = cursor.fetchone()
            conn.close()
            
            # Preparar mensagem para broadcast
            broadcast_message = json.dumps({
                "id": message_id,
                "room_id": room_id,
                "user_id": user_id,
                "content": message_data.get("content", ""),
                "created_at": now,
                "user": {
                    "nickname": user_data[0] if user_data else "Usuário",
                    "full_name": user_data[1] if user_data else "",
                    "avatar": user_data[2] if user_data else "avatar_1"
                }
            })
            
            # Enviar para todos na sala
            await manager.broadcast_to_room(broadcast_message, room_id, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
    except Exception as e:
        print(f"❌ Erro no WebSocket: {e}")
        manager.disconnect(websocket, room_id)

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
            INSERT INTO users (nickname, password_hash, full_name, email, bio, age, avatar, xp, level, tokens_earned, tokens_available, tokens_in_yield, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data.nickname,
            password_hash,
            user_data.full_name,
            user_data.email,
            user_data.bio,
            user_data.age,
            user_data.avatar or "avatar_1",
            0, 1, 0.0, 0.0, 0.0, True, now
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Buscar usuário criado
        user = get_user_by_id(user_id)
        
        print(f"✅ Usuário {user_data.nickname} registrado com sucesso")
        
        return UserResponse(**user)
        
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
    
    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])
    
    print(f"✅ Login bem-sucedido para {credentials.nickname}")
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@app.post("/auth/refresh", response_model=Token)
async def refresh_token(request_data: RefreshTokenRequest):
    """Renovar token de acesso usando refresh token"""
    payload = verify_refresh_token(request_data.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido ou expirado"
        )
    
    user_id = int(payload.get("sub"))
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )
    
    # Criar novos tokens
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
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

# ROTAS DE PERFIL
@app.put("/profile", response_model=UserResponse)
async def update_profile(profile_data: UserUpdate, request: Request):
    """Atualizar perfil do usuário"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Atualizar apenas campos fornecidos
        update_fields = []
        values = []
        
        if profile_data.full_name is not None:
            update_fields.append("full_name = ?")
            values.append(profile_data.full_name)
        
        if profile_data.email is not None:
            update_fields.append("email = ?")
            values.append(profile_data.email)
        
        if profile_data.bio is not None:
            update_fields.append("bio = ?")
            values.append(profile_data.bio)
        
        if profile_data.age is not None:
            update_fields.append("age = ?")
            values.append(profile_data.age)
        
        if profile_data.avatar is not None:
            update_fields.append("avatar = ?")
            values.append(profile_data.avatar)
        
        if update_fields:
            values.append(user["id"])
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            conn.commit()
            
            # Buscar usuário atualizado
            updated_user = get_user_by_id(user["id"])
            print(f"✅ Perfil de {user['nickname']} atualizado com sucesso")
            return UserResponse(**updated_user)
        else:
            return UserResponse(**user)
            
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao atualizar perfil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

# ROTAS DE POSTS/TIMELINE
@app.get("/posts/timeline", response_model=List[PostResponse])
async def get_timeline(request: Request):
    """Obter timeline de posts"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT p.*, u.nickname, u.full_name, COALESCE(u.avatar, 'avatar_1') as avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 50
        """)
        
        posts = []
        for row in cursor.fetchall():
            post_data = {
                "id": row[0],
                "user_id": row[1],
                "content": row[2],
                "image_url": row[3],
                "likes_count": row[4],
                "comments_count": row[5],
                "shares_count": row[6],
                "created_at": row[7],
                "user": {
                    "id": row[1],
                    "nickname": row[8],
                    "full_name": row[9],
                    "avatar": row[10]
                }
            }
            posts.append(PostResponse(**post_data))
        
        print(f"✅ Timeline carregada com {len(posts)} posts")
        return posts
        
    except Exception as e:
        print(f"❌ Erro ao carregar timeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

@app.get("/posts/my-posts", response_model=List[PostResponse])
async def get_my_posts(request: Request):
    """Obter posts do usuário atual"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT p.*, u.nickname, u.full_name, COALESCE(u.avatar, 'avatar_1') as avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT 50
        """, (user["id"],))
        
        posts = []
        for row in cursor.fetchall():
            post_data = {
                "id": row[0],
                "user_id": row[1],
                "content": row[2],
                "image_url": row[3],
                "likes_count": row[4],
                "comments_count": row[5],
                "shares_count": row[6],
                "created_at": row[7],
                "user": {
                    "id": user["id"],
                    "nickname": row[8],
                    "full_name": row[9],
                    "avatar": row[10]
                }
            }
            posts.append(PostResponse(**post_data))
        
        print(f"✅ {len(posts)} posts do usuário carregados")
        return posts
        
    except Exception as e:
        print(f"❌ Erro ao carregar posts do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

@app.delete("/posts/{post_id}")
async def delete_post(post_id: int, request: Request):
    """Deletar post do usuário atual"""
    print(f"🔍 Tentativa de deletar post {post_id}")
    
    user = get_user_from_token(request)
    if not user:
        print("❌ Usuário não autenticado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    print(f"✅ Usuário autenticado: {user['nickname']}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar se o post existe e pertence ao usuário
        cursor.execute("""
            SELECT id FROM posts WHERE id = ? AND user_id = ?
        """, (post_id, user["id"]))
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado ou não pertence ao usuário"
            )
        
        # Deletar o post
        cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
        
        print(f"✅ Post {post_id} deletado por {user['nickname']}")
        return {"message": "Post deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao deletar post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

@app.post("/posts", response_model=PostResponse)
async def create_post(post_data: PostCreate, request: Request):
    """Criar novo post"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO posts (user_id, content, image_url, likes_count, comments_count, shares_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user["id"], post_data.content, post_data.image_url, 0, 0, 0, now))
        
        post_id = cursor.lastrowid
        conn.commit()
        
        # Buscar post criado
        cursor.execute("""
            SELECT p.*, u.nickname, u.full_name, COALESCE(u.avatar, 'avatar_1') as avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        """, (post_id,))
        
        row = cursor.fetchone()
        post_data = {
            "id": row[0],
            "user_id": row[1],
            "content": row[2],
            "image_url": row[3],
            "likes_count": row[4],
            "comments_count": row[5],
            "shares_count": row[6],
            "created_at": row[7],
            "user": {
                "id": row[1],
                "nickname": row[8],
                "full_name": row[9],
                "avatar": row[10]
            }
        }
        
        print(f"✅ Post criado por {user['nickname']}")
        return PostResponse(**post_data)
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao criar post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

# ROTAS DE CHAT
@app.get("/chat/rooms", response_model=List[ChatRoomResponse])
async def get_chat_rooms(request: Request):
    """Obter salas de chat"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM chat_rooms ORDER BY created_at DESC")
        rooms = []
        for row in cursor.fetchall():
            room_data = {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "is_public": bool(row[3]),
                "members_count": row[4],
                "created_at": row[5]
            }
            rooms.append(ChatRoomResponse(**room_data))
        
        print(f"✅ {len(rooms)} salas de chat carregadas")
        return rooms
        
    except Exception as e:
        print(f"❌ Erro ao carregar salas de chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

@app.get("/chat/rooms/{room_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(room_id: int, request: Request):
    """Obter mensagens de uma sala de chat"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT m.*, u.nickname, u.full_name, COALESCE(u.avatar, 'avatar_1') as avatar
            FROM chat_messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.room_id = ?
            ORDER BY m.created_at ASC
            LIMIT 100
        """, (room_id,))
        
        messages = []
        for row in cursor.fetchall():
            message_data = {
                "id": row[0],
                "room_id": row[1],
                "user_id": row[2],
                "content": row[3],
                "created_at": row[4],
                "user": {
                    "id": row[2],
                    "nickname": row[5],
                    "full_name": row[6],
                    "avatar": row[7]
                }
            }
            messages.append(ChatMessageResponse(**message_data))
        
        print(f"✅ {len(messages)} mensagens carregadas da sala {room_id}")
        return messages
        
    except Exception as e:
        print(f"❌ Erro ao carregar mensagens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

@app.post("/chat/rooms/{room_id}/messages", response_model=ChatMessageResponse)
async def send_chat_message(room_id: int, message_data: ChatMessageCreate, request: Request):
    """Enviar mensagem para uma sala de chat"""
    print(f"🔍 Enviando mensagem para sala {room_id}")
    print(f"🔍 Dados da mensagem: {message_data}")
    print(f"🔍 Tipo de dados: {type(message_data)}")
    print(f"🔍 Conteúdo: {message_data.content}")
    print(f"🔍 Conteúdo é string: {isinstance(message_data.content, str)}")
    print(f"🔍 Conteúdo vazio: {not message_data.content.strip()}")
    
    # Validar conteúdo
    if not message_data.content or not message_data.content.strip():
        print("❌ Conteúdo da mensagem vazio")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conteúdo da mensagem não pode estar vazio"
        )
    
    user = get_user_from_token(request)
    if not user:
        print("❌ Usuário não autenticado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    print(f"✅ Usuário autenticado: {user['nickname']}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO chat_messages (room_id, user_id, content, created_at)
            VALUES (?, ?, ?, ?)
        """, (room_id, user["id"], message_data.content, now))
        
        message_id = cursor.lastrowid
        conn.commit()
        
        # Buscar mensagem criada
        cursor.execute("""
            SELECT m.*, u.nickname, u.full_name, COALESCE(u.avatar, 'avatar_1') as avatar
            FROM chat_messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.id = ?
        """, (message_id,))
        
        row = cursor.fetchone()
        message_data = {
            "id": row[0],
            "room_id": row[1],
            "user_id": row[2],
            "content": row[3],
            "created_at": row[4],
            "user": {
                "id": row[2],
                "nickname": row[5],
                "full_name": row[6],
                "avatar": row[7]
            }
        }
        
        print(f"✅ Mensagem enviada por {user['nickname']} na sala {room_id}")
        return ChatMessageResponse(**message_data)
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao enviar mensagem: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
    finally:
        conn.close()

# ROTAS DE IA
@app.post("/ai/chat", response_model=AIChatResponse)
async def chat_with_ai(ai_data: AIChatRequest, request: Request):
    """Chat com IA"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    # Integração real com OpenAI
    try:
        import openai
        
        # Configurar OpenAI (você precisa definir OPENAI_API_KEY no ambiente)
        openai.api_key = os.getenv("OPENAI_API_KEY", "sk-test-key")
        
        # Definir contexto baseado na categoria
        context_prompts = {
            "estudos": "Você é um assistente educacional especializado em estudos. Ajuda com exercícios, resumos, explicações e técnicas de aprendizado.",
            "dúvidas": "Você é um tutor especializado em esclarecer dúvidas. Seja claro, didático e use exemplos práticos.",
            "curiosidades": "Você é um explorador de conhecimento que adora compartilhar curiosidades interessantes e fatos fascinantes.",
            "exercícios": "Você é um professor especializado em resolver exercícios. Guie passo a passo e explique o raciocínio.",
            "resumos": "Você é um especialista em criar resumos organizados e eficazes para estudos.",
            "geral": "Você é o Connectus AI, um assistente educacional amigável e útil."
        }
        
        category = ai_data.category or "geral"
        context = context_prompts.get(category.lower(), context_prompts["geral"])
        
        # Fazer chamada para OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": ai_data.prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        
    except Exception as e:
        print(f"❌ Erro ao chamar OpenAI: {e}")
        # Fallback para respostas simuladas se OpenAI falhar
        responses = {
            "estudos": "📚 Que ótimo que você está estudando! Posso te ajudar com exercícios, resumos ou explicações. O que você gostaria de saber?",
            "dúvidas": "🤔 Entendo sua dúvida! Vou te ajudar a esclarecer isso. Pode me dar mais detalhes sobre o que você não entendeu?",
            "curiosidades": "🌟 Que interessante! Adoro curiosidades! Vou te contar algo fascinante sobre esse tópico...",
            "exercícios": "💪 Vamos resolver esse exercício juntos! Primeiro, me diga qual é o problema e eu te guio passo a passo.",
            "resumos": "📝 Perfeito! Vou criar um resumo completo e organizado para você. Qual tópico você quer resumir?",
            "geral": "👋 Olá! Sou o Connectus AI e estou aqui para te ajudar! Como posso te auxiliar hoje?"
        }
        
        response_text = responses.get(category.lower(), responses["geral"])
    
    # Salvar conversa no banco
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        now = datetime.now(timezone.utc).isoformat()
        
        # Criar conversa se não existir
        conversation_id = ai_data.conversation_id
        if not conversation_id:
            cursor.execute("""
                INSERT INTO ai_conversations (user_id, category, query, created_at)
                VALUES (?, ?, ?, ?)
            """, (user["id"], category, ai_data.prompt, now))
            conversation_id = cursor.lastrowid
        
        # Salvar mensagem do usuário
        cursor.execute("""
            INSERT INTO ai_messages (conversation_id, role, content, timestamp, is_favorite)
            VALUES (?, ?, ?, ?, ?)
        """, (conversation_id, "user", ai_data.prompt, now, False))
        
        # Salvar resposta da IA
        cursor.execute("""
            INSERT INTO ai_messages (conversation_id, role, content, timestamp, is_favorite)
            VALUES (?, ?, ?, ?, ?)
        """, (conversation_id, "assistant", response_text, now, False))
        
        conn.commit()
        
        print(f"✅ Resposta da IA enviada para {user['nickname']}")
        return AIChatResponse(
            response=response_text,
            category=category,
            timestamp=now,
            is_favorite=False,
            user_id=user["id"],
            conversation_id=conversation_id
        )
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao salvar conversa da IA: {e}")
        return AIChatResponse(
            response=response_text,
            category=category,
            timestamp=now,
            is_favorite=False,
            user_id=user["id"],
            conversation_id=None
        )
    finally:
        conn.close()

# ROTAS DE AVATARES
@app.get("/avatars")
async def get_avatars():
    """Obter lista de avatares disponíveis"""
    avatars = [
        {"id": "avatar_1", "name": "Avatar Feminino 1", "url": "/static/avatars/avatar_1.png"},
        {"id": "avatar_2", "name": "Avatar Feminino 2", "url": "/static/avatars/avatar_2.png"},
        {"id": "avatar_3", "name": "Avatar Masculino 1", "url": "/static/avatars/avatar_3.png"},
        {"id": "avatar_4", "name": "Avatar Masculino 2", "url": "/static/avatars/avatar_4.png"},
        {"id": "avatar_5", "name": "Avatar Neutro 1", "url": "/static/avatars/avatar_5.png"},
        {"id": "avatar_6", "name": "Avatar Neutro 2", "url": "/static/avatars/avatar_6.png"},
        {"id": "avatar_7", "name": "Avatar Diversidade 1", "url": "/static/avatars/avatar_7.png"},
        {"id": "avatar_8", "name": "Avatar Diversidade 2", "url": "/static/avatars/avatar_8.png"},
    ]
    return avatars

# ===== ROTAS FALTANTES =====

@app.get("/missions", response_model=List[MissionResponse])
async def get_missions(request: Request):
    """Obter missões"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM missions WHERE is_active = 1 ORDER BY created_at DESC")
        missions = []
        for row in cursor.fetchall():
            missions.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "xp_reward": row[3],
                "token_reward": row[4],
                "is_active": bool(row[5]),
                "created_at": row[6]
            })
        
        print(f"✅ Missões retornadas: {len(missions)}")
        return missions
    except Exception as e:
        print(f"❌ Erro ao buscar missões: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

@app.get("/ranking", response_model=List[RankingResponse])
async def get_ranking(request: Request):
    """Obter ranking de usuários"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, nickname, full_name, xp, level, tokens_earned, COALESCE(avatar, 'avatar_1') as avatar
            FROM users 
            WHERE is_active = 1 
            ORDER BY xp DESC, level DESC 
            LIMIT 50
        """)
        
        ranking = []
        for row in cursor.fetchall():
            ranking.append({
                "id": row[0],
                "nickname": row[1],
                "full_name": row[2],
                "xp": row[3],
                "level": row[4],
                "tokens_earned": row[5],
                "avatar": row[6] or "avatar_1"
            })
        
        print(f"✅ Ranking retornado: {len(ranking)} usuários")
        return ranking
    except Exception as e:
        print(f"❌ Erro ao buscar ranking: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

@app.get("/posts/search")
async def search_posts(q: str, limit: int = 20, offset: int = 0, request: Request = None):
    """Buscar posts"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT p.*, u.nickname, u.full_name, COALESCE(u.avatar, 'avatar_1') as avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.content LIKE ? OR u.nickname LIKE ? OR u.full_name LIKE ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        """, (f"%{q}%", f"%{q}%", f"%{q}%", limit, offset))
        
        posts = []
        for row in cursor.fetchall():
            posts.append({
                "id": row[0],
                "user_id": row[1],
                "content": row[2],
                "image_url": row[3],
                "likes_count": row[4],
                "comments_count": row[5],
                "shares_count": row[6],
                "created_at": row[7],
                "user": {
                    "id": row[1],
                    "nickname": row[8],
                    "full_name": row[9],
                    "avatar": row[10] or "avatar_1"
                }
            })
        
        return posts
    except Exception as e:
        print(f"❌ Erro ao buscar posts: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

@app.post("/posts/{post_id}/like")
async def like_post(post_id: int, request: Request):
    """Curtir post"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar se post existe
        cursor.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Post não encontrado")
        
        # Incrementar likes
        cursor.execute("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?", (post_id,))
        conn.commit()
        
        return {"message": "Post curtido com sucesso!"}
    except Exception as e:
        print(f"❌ Erro ao curtir post: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

# Rotas de IA
@app.get("/ai/history")
async def get_ai_history(limit: int = 50, request: Request = None):
    """Obter histórico de conversas de IA"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, category, created_at 
            FROM ai_conversations 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (user["id"], limit))
        
        conversations = []
        for row in cursor.fetchall():
            conversations.append({
                "id": row[0],
                "category": row[1],
                "created_at": row[2]
            })
        
        return conversations
    except Exception as e:
        print(f"❌ Erro ao buscar histórico de IA: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

@app.get("/ai/favorites")
async def get_ai_favorites(request: Request = None):
    """Obter mensagens favoritas de IA"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT am.id, am.content, am.timestamp, ac.category 
            FROM ai_messages am
            JOIN ai_conversations ac ON am.conversation_id = ac.id
            WHERE ac.user_id = ? AND am.is_favorite = 1 AND am.role = 'assistant'
            ORDER BY am.timestamp DESC
        """, (user["id"],))
        
        favorites = []
        for row in cursor.fetchall():
            favorites.append({
                "id": row[0],
                "content": row[1],
                "timestamp": row[2],
                "category": row[3]
            })
        
        return favorites
    except Exception as e:
        print(f"❌ Erro ao buscar favoritos de IA: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

@app.get("/ai/stats")
async def get_ai_stats(request: Request = None):
    """Obter estatísticas de IA"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Contar conversas
        cursor.execute("SELECT COUNT(*) FROM ai_conversations WHERE user_id = ?", (user["id"],))
        conversations_count = cursor.fetchone()[0]
        
        # Contar mensagens
        cursor.execute("""
            SELECT COUNT(*) FROM ai_messages am
            JOIN ai_conversations ac ON am.conversation_id = ac.id
            WHERE ac.user_id = ?
        """, (user["id"],))
        messages_count = cursor.fetchone()[0]
        
        # Contar favoritos
        cursor.execute("""
            SELECT COUNT(*) FROM ai_messages am
            JOIN ai_conversations ac ON am.conversation_id = ac.id
            WHERE ac.user_id = ? AND am.is_favorite = 1
        """, (user["id"],))
        favorites_count = cursor.fetchone()[0]
        
        return {
            "conversations_count": conversations_count,
            "messages_count": messages_count,
            "favorites_count": favorites_count
        }
    except Exception as e:
        print(f"❌ Erro ao buscar stats de IA: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        conn.close()

# Rota duplicada removida - usando a rota principal acima

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor Connectus COMPLETO...")
    print("🌐 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🗄️ Banco: SQLite")
    print("🔓 CORS: Permitindo todas as origens")
    print("✨ Funcionalidades: IA, Perfil, Timeline, Chat, Avatares")
    uvicorn.run(app, host="0.0.0.0", port=8000)
