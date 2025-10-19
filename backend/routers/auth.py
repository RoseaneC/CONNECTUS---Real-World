# backend/routers/auth.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    nickname: str = ""
    password: str = ""

    class Config:
        extra = "allow"

class UserOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    nickname: Optional[str] = None

class LoginSuccess(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

@router.get("/me", response_model=UserOut)
async def get_current_user_info():
    """Obter informações do usuário atual"""
    return UserOut(id=1, name="test_user", email="test@connectus.ai", nickname="test_user")

@router.post("/login", response_model=LoginSuccess, status_code=status.HTTP_200_OK)
async def login(body: LoginRequest):
    """Login mock - sempre funciona"""
    print(f"DEBUG /auth/login - Body recebido: {body}")

    if not body.nickname or not body.password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nickname e password são obrigatórios"
        )

    # Login mock que sempre funciona
    print(f"✅ DEBUG: Login mock bem-sucedido para {body.nickname}")

    # Criar token de acesso mock
    access_token = "mock-token-" + str(hash(body.nickname + body.password))
    
    return LoginSuccess(
        access_token=access_token,
        user=UserOut(
            id=1, 
            name=str(body.nickname),
            email=str(body.nickname) + "@connectus.ai",
            nickname=str(body.nickname)
        )
    )
