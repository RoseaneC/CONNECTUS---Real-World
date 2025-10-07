from pydantic import BaseModel
from typing import Optional
from datetime import datetime
# from decimal import Decimal


class UserBase(BaseModel):
    nickname: str
    full_name: str
    email: str
    age: int


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None


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
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class UserProfile(UserResponse):
    """Perfil completo do usuário para exibição"""
    is_eligible_for_yield: bool
    
    class Config:
        from_attributes = True


class UserRegisterResponse(BaseModel):
    """Resposta do registro de usuário"""
    user: UserResponse
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


