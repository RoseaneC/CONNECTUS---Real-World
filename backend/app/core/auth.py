"""
Sistema de autenticação JWT completo para Connectus
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# Configuração JWT
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha usando SHA256"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    """Gerar hash da senha usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT de acesso"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT de refresh"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)  # Refresh token válido por 7 dias
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_user_by_nickname(db: Session, nickname: str) -> Optional[User]:
    """Buscar usuário por nickname"""
    return db.query(User).filter(User.nickname == nickname).first()

def authenticate_user(db: Session, nickname: str, password: str) -> Optional[User]:
    """Autenticar usuário com debug detalhado"""
    print(f"🔍 DEBUG AUTH: Tentando autenticar nickname: {nickname}")
    
    user = get_user_by_nickname(db, nickname)
    if not user:
        print(f"❌ DEBUG AUTH: Usuário {nickname} não encontrado")
        return None
    
    print(f"✅ DEBUG AUTH: Usuário encontrado - ID: {user.id}, Ativo: {user.is_active}")
    print(f"🔍 DEBUG AUTH: Hash no banco: {user.password_hash[:20]}...")
    
    password_hash = get_password_hash(password)
    print(f"🔍 DEBUG AUTH: Hash da senha enviada: {password_hash[:20]}...")
    
    if not verify_password(password, user.password_hash):
        print(f"❌ DEBUG AUTH: Senha incorreta para {nickname}")
        return None
    
    print(f"✅ DEBUG AUTH: Autenticação bem-sucedida para {nickname}")
    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Obter usuário atual a partir do token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Obter usuário atual opcionalmente (retorna None se não autenticado)"""
    try:
        # Tentar obter o token do header Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        if payload is None:
            return None
        
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
            
        user = db.query(User).filter(User.id == user_id).first()
        return user
        
    except Exception:
        return None

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Obter usuário ativo atual"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )
    return current_user

