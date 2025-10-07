"""
Rotas de autenticação para Connectus
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.auth import (
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    get_password_hash,
    get_user_by_nickname,
    get_current_active_user
)
from app.core.config import settings
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token, UserProfile, RefreshTokenRequest
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["autenticação"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrar novo usuário
    """
    # Verificar se nickname já existe
    existing_user = get_user_by_nickname(db, user_data.nickname)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nickname já cadastrado"
        )
    
    # Verificar se email já existe (se fornecido)
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
    
    # Criar hash da senha
    hashed_password = get_password_hash(user_data.password)
    
    # Criar usuário
    db_user = User(
        nickname=user_data.nickname,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        email=user_data.email,
        bio=user_data.bio
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Retornar dados do usuário (sem senha)
        return UserResponse(
            id=db_user.id,
            nickname=db_user.nickname,
            full_name=db_user.full_name,
            email=db_user.email,
            bio=db_user.bio,
            xp=db_user.xp,
            level=db_user.level,
            tokens_earned=float(db_user.tokens_earned),
            tokens_available=float(db_user.tokens_available),
            tokens_in_yield=float(db_user.tokens_in_yield),
            is_active=db_user.is_active,
            is_verified=db_user.is_verified,
            created_at=db_user.created_at,
            last_login=db_user.last_login,
            missions_completed=db_user.missions_completed,
            posts_created=db_user.posts_created,
            likes_received=db_user.likes_received,
            comments_made=db_user.comments_made,
            # Campos do Stellar removidos - não estamos mais usando Stellar SDK
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Fazer login do usuário
    """
    # Autenticar usuário
    user = authenticate_user(db, login_data.nickname, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    # Verificar se usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    # Criar tokens JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=7)
    
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=refresh_token_expires
    )
    
    # Atualizar último login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Renovar token de acesso usando refresh token
    """
    from app.core.auth import verify_token
    
    # Verificar refresh token
    payload = verify_token(refresh_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido"
        )
    
    # Buscar usuário
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido"
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo"
        )
    
    # Criar novo access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", response_model=UserProfile)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Obter informações do usuário atual
    """
    return UserProfile(
        id=current_user.id,
        nickname=current_user.nickname,
        full_name=current_user.full_name,
        email=current_user.email,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        xp=current_user.xp,
        level=current_user.level,
        tokens_earned=float(current_user.tokens_earned),
        tokens_available=float(current_user.tokens_available),
        tokens_in_yield=float(current_user.tokens_in_yield),
        missions_completed=current_user.missions_completed,
        posts_created=current_user.posts_created,
        likes_received=current_user.likes_received,
        comments_made=current_user.comments_made,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )

@router.post("/logout")
async def logout():
    """
    Fazer logout (frontend deve remover token)
    """
    return {"message": "Logout realizado com sucesso"}

@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_active_user)):
    """
    Verificar se token é válido
    """
    return {"valid": True, "user_id": current_user.id}