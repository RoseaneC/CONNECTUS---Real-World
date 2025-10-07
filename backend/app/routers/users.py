from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..core.database import get_db
from ..schemas.user import UserUpdate, UserProfile
from ..services.user_service import UserService
# Stellar service removido - não estamos mais usando Stellar SDK
from ..core.auth import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém perfil completo do usuário"""
    try:
        user_service = UserService(db)
        profile = await user_service.get_user_profile(current_user["id"])
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter perfil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza perfil do usuário"""
    try:
        user_service = UserService(db)
        
        # Verificar se nickname já existe (se foi alterado)
        if user_data.nickname and user_data.nickname != current_user["nickname"]:
            existing_user = user_service.get_user_by_nickname(user_data.nickname)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nickname já está em uso"
                )
        
        # Atualizar usuário
        updated_user = user_service.update_user(current_user["id"], user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Obter perfil atualizado
        profile = await user_service.get_user_profile(updated_user.id)
        
        logger.info(f"Perfil atualizado: {updated_user.nickname} (ID: {updated_user.id})")
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar perfil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/balance")
async def get_user_balance(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém saldo atual do usuário"""
    try:
        user_service = UserService(db)
        balance_data = await user_service.get_user_balance(current_user["id"])
        
        if not balance_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return balance_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter saldo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/transactions")
async def get_user_transactions(
    limit: int = 10,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém histórico de transações do usuário"""
    try:
        user_service = UserService(db)
        transactions_data = await user_service.get_user_transactions(current_user["id"], limit)
        
        if not transactions_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return transactions_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter transações: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


# Função de transferência de tokens removida - não estamos mais usando Stellar SDK


@router.get("/stats")
async def get_user_stats(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas do usuário"""
    try:
        user_service = UserService(db)
        stats = user_service.get_user_stats(current_user["id"])
        
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/{user_id}")
async def get_user_by_id(
    user_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém informações públicas de um usuário"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(user_id)
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Retornar apenas informações públicas
        return {
            "id": user.id,
            "nickname": user.nickname,
            "level": user.level,
            "xp": user.xp,
            "missions_completed": user.missions_completed,
            "created_at": user.created_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


