"""
Schemas de autenticação para Connectus
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=50, description="Nickname único do usuário")
    full_name: Optional[str] = Field(None, max_length=100, description="Nome completo")
    email: Optional[str] = Field(None, max_length=100, description="Email do usuário")
    bio: Optional[str] = Field(None, max_length=500, description="Biografia do usuário")
    
    @validator('nickname')
    def validate_nickname(cls, v):
        if not v or v.strip() == "":
            raise ValueError('Nickname não pode ser vazio')
        if ' ' in v:
            raise ValueError('Nickname não pode conter espaços')
        if not v.isalnum():
            raise ValueError('Nickname deve conter apenas letras e números')
        return v.strip().lower()
    
    @validator('email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Email inválido')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="Senha do usuário")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        if ' ' in v:
            raise ValueError('Senha não pode conter espaços')
        return v

class UserLogin(BaseModel):
    nickname: str = Field(..., description="Nickname do usuário")
    password: str = Field(..., description="Senha do usuário")
    
    @validator('nickname')
    def validate_nickname(cls, v):
        if not v or v.strip() == "":
            raise ValueError('Nickname é obrigatório')
        return v.strip().lower()

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token para renovar acesso")

class UserResponse(UserBase):
    id: int
    xp: int
    level: int
    tokens_earned: float
    tokens_available: float
    tokens_in_yield: float
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    missions_completed: int
    posts_created: int
    likes_received: int
    comments_made: int
    
    # Campos removidos - não estamos mais usando Stellar SDK
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserProfile(BaseModel):
    id: int
    nickname: str
    full_name: Optional[str]
    email: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    xp: int
    level: int
    tokens_earned: float
    tokens_available: float
    tokens_in_yield: float
    missions_completed: int
    posts_created: int
    likes_received: int
    comments_made: int
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

