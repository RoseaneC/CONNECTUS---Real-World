"""
Router para Missões Diárias v2 (missions-v2)
Rotas isoladas para o novo sistema de missões diárias
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.missions_v2_service import (
    today_str_tz,
    get_daily_missions,
    get_user_progress_map,
    complete_mission
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/missions", tags=["missions-v2"])


# Schemas de requisição/resposta
class CompleteMissionRequest(BaseModel):
    code: str


class MissionResponse(BaseModel):
    code: str
    title: str
    description: str
    xp_reward: int
    token_reward: int
    completed: bool
    icon: Optional[str] = None

    class Config:
        from_attributes = True


class DailyMissionsResponse(BaseModel):
    date: str
    missions: List[MissionResponse]
    summary: dict


class CompleteMissionResponse(BaseModel):
    ok: bool
    code: str
    completed: bool
    alreadyCompleted: bool
    rewards: dict
    userTotals: dict


@router.get("/daily", response_model=DailyMissionsResponse)
async def get_daily_missions_endpoint(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém missões diárias ativas e progresso do usuário no dia.
    
    Query params:
    - date: opcional, formato YYYY-MM-DD (default: hoje em America/Sao_Paulo)
    """
    try:
        # Usar data fornecida ou hoje
        target_date = date if date else today_str_tz()
        
        # Validar formato de data (básico)
        if len(target_date) != 10 or target_date.count("-") != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de data inválido. Use YYYY-MM-DD"
            )
        
        # Buscar missões ativas
        missions = get_daily_missions(db)
        
        # Buscar progresso do usuário
        progress_map = get_user_progress_map(db, current_user.id, target_date)
        
        # Montar resposta
        missions_response = []
        for mission in missions:
            is_completed = progress_map.get(mission.id) == "completed"
            missions_response.append(MissionResponse(
                code=mission.code,
                title=mission.title,
                description=mission.description,
                xp_reward=mission.xp_reward,
                token_reward=mission.token_reward,
                completed=is_completed,
                icon=mission.icon
            ))
        
        # Calcular summary
        total = len(missions_response)
        completed = sum(1 for m in missions_response if m.completed)
        success_rate = round((completed / total * 100)) if total > 0 else 0
        
        return DailyMissionsResponse(
            date=target_date,
            missions=missions_response,
            summary={
                "total": total,
                "completed": completed,
                "successRate": success_rate
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[MISSIONS_V2] Erro ao obter missões diárias: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/complete", response_model=CompleteMissionResponse)
async def complete_mission_endpoint(
    request: CompleteMissionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Completa uma missão diária.
    
    Body:
    - code: código da missão (ex: "CHECKIN")
    """
    try:
        # Sanitizar código
        code = request.code.strip().upper()
        
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código da missão é obrigatório"
            )
        
        # Completar missão
        result = complete_mission(db, current_user, code)
        
        return CompleteMissionResponse(
            ok=True,
            code=code,
            completed=result["completed"],
            alreadyCompleted=result["alreadyCompleted"],
            rewards=result["rewards"],
            userTotals=result["userTotals"]
        )
        
    except ValueError as e:
        # Missão não encontrada ou inativa
        logger.warning(f"[MISSIONS_V2] Missão não encontrada: {request.code}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[MISSIONS_V2] Erro ao completar missão: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

