# backend/app/api/routers/auth_routes.py
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

# Importar do sistema real
from app.core.database import get_db
from app.core.auth import verify_password, create_access_token
from app.models.user import User

router = APIRouter(tags=["auth"])

AUTH_BYPASS = False  # Pode ser configurado via env se necessário

class LoginRequest(BaseModel):
    nickname: str = ""
    password: str = ""

    class Config:
        extra = "allow"  # ignora chaves a mais sem dar 422

    def normalized_identifier(self) -> Optional[str]:
        return self.nickname.strip() if self.nickname else None

class UserOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    nickname: Optional[str] = None

class LoginSuccess(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

def get_user_by_identifier(db: Session, ident_lower: str) -> Optional[User]:
    """Buscar usuário por qualquer identificador (case-insensitive)"""
    return db.query(User).filter(
        or_(
            func.lower(User.email) == ident_lower,
            func.lower(User.nickname) == ident_lower
        )
    ).first()

@router.get("/me", response_model=UserOut)
async def get_current_user_info(db: Session = Depends(get_db)):
    """Obter informações do usuário atual"""
    # Para simplificar, vamos retornar um usuário mock por enquanto
    # Em produção, você deve verificar o token JWT
    return UserOut(id=1, name="test_user", email="test@connectus.ai", nickname="test_user")

@router.post("/login", response_model=LoginSuccess, status_code=status.HTTP_200_OK)
async def login(body: LoginRequest):
    # LOG de diagnóstico
    print("DEBUG /api/auth/login - Body recebido:", body)

    ident = body.normalized_identifier()
    if not ident:
        # 422 controlado e claro
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Envie email/nickname/username/login/identifier (qualquer um) + password."
        )

    # Para simplificar, vamos fazer um login mock que sempre funciona
    # Em produção, você deve verificar no banco de dados
    print(f"✅ DEBUG: Login mock bem-sucedido para {ident}")

    # Criar token de acesso mock
    access_token = "mock-token-" + str(hash(ident + body.password))
    
    return LoginSuccess(
        access_token=access_token,
        user=UserOut(
            id=1, 
            name=str(ident),
            email=str(ident) + "@connectus.ai",
            nickname=str(ident)
        )
    )
