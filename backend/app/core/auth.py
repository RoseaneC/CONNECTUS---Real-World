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

# Security scheme (opcional para permitir cookie fallback)
security = HTTPBearer(auto_error=False)

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

def get_user_by_identifier(db: Session, identifier: str) -> Optional[User]:
    """[CONNECTUS HOTFIX] Buscar usuário por nickname ou email (case-insensitive)"""
    from sqlalchemy import func, or_
    
    # Normalizar para comparação case-insensitive
    id_lower = identifier.lower()
    
    # Buscar por nickname OU email (case-insensitive)
    return db.query(User).filter(
        or_(
            func.lower(User.nickname) == id_lower,
            func.lower(User.email) == id_lower
        )
    ).first()

def authenticate_user(db: Session, nickname: str, password: str) -> Optional[User]:
    """[CONNECTUS HOTFIX] Autenticar usuário com debug detalhado (case-insensitive)"""
    import logging
    auth_logger = logging.getLogger("auth")
    
    auth_logger.info(f"[AUTH] authenticate_user identifier={nickname}")
    
    # Usar busca case-insensitive por nickname ou email
    user = get_user_by_identifier(db, nickname)
    if not user:
        auth_logger.warning(f"[AUTH] authenticate_user_fail reason=user_not_found identifier={nickname}")
        return None
    
    auth_logger.info(f"[AUTH] authenticate_user_found user_id={user.id} is_active={user.is_active}")
    
    if not verify_password(password, user.password_hash):
        auth_logger.warning(f"[AUTH] authenticate_user_fail reason=invalid_password user_id={user.id}")
        return None
    
    auth_logger.info(f"[AUTH] authenticate_user_success user_id={user.id}")
    return user

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """Obter usuário atual a partir do token JWT (cookie ou Authorization header)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = None
    
    # Tentar obter token do cookie primeiro
    cookie_token = request.cookies.get("connectus_access_token")
    if cookie_token:
        token = cookie_token
    # Fallback para Authorization header
    elif credentials:
        try:
            token = credentials.credentials
        except Exception:
            pass
    
    if not token:
        raise credentials_exception
    
    try:
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

