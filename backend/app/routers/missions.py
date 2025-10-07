from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..schemas.mission import MissionResponse, UserMissionResponse, UserMissionUpdate
from ..services.mission_service import MissionService
from ..core.auth import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/missions", tags=["missions"])


@router.get("/", response_model=List[MissionResponse])
async def get_all_missions(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Obtém todas as missões disponíveis"""
    try:
        mission_service = MissionService(db)
        missions = mission_service.get_all_missions(active_only)
        return missions
        
    except Exception as e:
        logger.error(f"Erro ao obter missões: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/my-missions", response_model=List[UserMissionResponse])
async def get_my_missions(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém missões do usuário atual"""
    try:
        mission_service = MissionService(db)
        user_missions = mission_service.get_user_missions(current_user["id"])
        
        if not user_missions:
            return []
        
        return user_missions
        
    except Exception as e:
        logger.error(f"Erro ao obter missões do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/daily", response_model=List[UserMissionResponse])
async def get_daily_missions(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém missões diárias do usuário"""
    try:
        mission_service = MissionService(db)
        daily_missions = mission_service.get_daily_missions(current_user["id"])
        
        if not daily_missions:
            return []
        
        return daily_missions
        
    except Exception as e:
        logger.error(f"Erro ao obter missões diárias: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/assign/{mission_id}")
async def assign_mission(
    mission_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atribui uma missão ao usuário"""
    try:
        mission_service = MissionService(db)
        
        # Verificar se a missão existe
        mission = mission_service.get_mission_by_id(mission_id)
        if not mission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Missão não encontrada"
            )
        
        if not mission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missão não está ativa"
            )
        
        # Atribuir missão
        user_mission = mission_service.assign_mission_to_user(current_user["id"], mission_id)
        if not user_mission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao atribuir missão"
            )
        
        logger.info(f"Missão {mission_id} atribuída ao usuário {current_user['id']}")
        return {"message": "Missão atribuída com sucesso", "user_mission_id": user_mission.id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atribuir missão: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.put("/{user_mission_id}/progress")
async def update_mission_progress(
    user_mission_id: int,
    update_data: UserMissionUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza progresso de uma missão"""
    try:
        mission_service = MissionService(db)
        
        # Verificar se a missão pertence ao usuário
        user_mission = mission_service.get_user_missions(current_user["id"])
        user_mission_ids = [um.id for um in user_mission]
        
        if user_mission_id not in user_mission_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Missão não encontrada ou não pertence ao usuário"
            )
        
        # Atualizar progresso
        updated_mission = await mission_service.update_user_mission(user_mission_id, update_data)
        if not updated_mission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao atualizar progresso da missão"
            )
        
        return {"message": "Progresso atualizado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar progresso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/{user_mission_id}/complete")
async def complete_mission(
    user_mission_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Completa uma missão e recebe recompensas"""
    try:
        mission_service = MissionService(db)
        
        # Verificar se a missão pertence ao usuário
        user_mission = mission_service.get_user_missions(current_user["id"])
        user_mission_ids = [um.id for um in user_mission]
        
        if user_mission_id not in user_mission_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Missão não encontrada ou não pertence ao usuário"
            )
        
        # Completar missão
        success = await mission_service.complete_mission(user_mission_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao completar missão"
            )
        
        logger.info(f"Missão {user_mission_id} completada pelo usuário {current_user['id']}")
        return {"message": "Missão completada com sucesso! Recompensas adicionadas."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao completar missão: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/stats")
async def get_mission_stats(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de missões do usuário"""
    try:
        mission_service = MissionService(db)
        stats = mission_service.get_mission_stats(current_user["id"])
        
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return {
            "user_id": current_user["id"],
            "nickname": current_user["nickname"],
            **stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de missões: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/{mission_id}", response_model=MissionResponse)
async def get_mission_by_id(
    mission_id: int,
    db: Session = Depends(get_db)
):
    """Obtém detalhes de uma missão específica"""
    try:
        mission_service = MissionService(db)
        mission = mission_service.get_mission_by_id(mission_id)
        
        if not mission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Missão não encontrada"
            )
        
        return mission
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter missão: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/reset-daily")
async def reset_daily_missions(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reset das missões diárias (apenas para administradores)"""
    try:
        # TODO: Implementar verificação de admin
        mission_service = MissionService(db)
        mission_service.reset_daily_missions()
        
        return {"message": "Missões diárias resetadas com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao resetar missões diárias: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


