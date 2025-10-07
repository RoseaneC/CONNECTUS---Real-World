from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..schemas.ranking import UserRankingResponse, RankingResponse
from ..services.ranking_service import RankingService
from ..core.auth import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ranking", tags=["ranking"])


@router.get("/overall", response_model=RankingResponse)
async def get_overall_ranking(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Obtém ranking geral"""
    try:
        ranking_service = RankingService(db)
        ranking = ranking_service.get_ranking_page("overall", page, page_size)
        return ranking
        
    except Exception as e:
        logger.error(f"Erro ao obter ranking geral: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/xp", response_model=RankingResponse)
async def get_xp_ranking(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Obtém ranking por XP"""
    try:
        ranking_service = RankingService(db)
        ranking = ranking_service.get_ranking_page("xp", page, page_size)
        return ranking
        
    except Exception as e:
        logger.error(f"Erro ao obter ranking de XP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/tokens", response_model=RankingResponse)
async def get_token_ranking(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Obtém ranking por tokens"""
    try:
        ranking_service = RankingService(db)
        ranking = ranking_service.get_ranking_page("tokens", page, page_size)
        return ranking
        
    except Exception as e:
        logger.error(f"Erro ao obter ranking de tokens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/missions", response_model=RankingResponse)
async def get_mission_ranking(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Obtém ranking por missões completadas"""
    try:
        ranking_service = RankingService(db)
        ranking = ranking_service.get_ranking_page("missions", page, page_size)
        return ranking
        
    except Exception as e:
        logger.error(f"Erro ao obter ranking de missões: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/my-position")
async def get_my_position(
    ranking_type: str = Query("overall", regex="^(overall|xp|tokens|missions)$"),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém posição do usuário no ranking"""
    try:
        ranking_service = RankingService(db)
        position = ranking_service.get_user_position(current_user["id"], ranking_type)
        
        if position is None:
            return {
                "user_id": current_user["id"],
                "nickname": current_user["nickname"],
                "ranking_type": ranking_type,
                "position": None,
                "message": "Usuário não está no ranking"
            }
        
        return {
            "user_id": current_user["id"],
            "nickname": current_user["nickname"],
            "ranking_type": ranking_type,
            "position": position
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter posição do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/my-ranking", response_model=UserRankingResponse)
async def get_my_ranking(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém dados de ranking do usuário atual"""
    try:
        ranking_service = RankingService(db)
        user_ranking = ranking_service.get_user_ranking(current_user["id"])
        
        if not user_ranking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dados de ranking não encontrados"
            )
        
        return user_ranking
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter ranking do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/leaderboard")
async def get_leaderboard(
    db: Session = Depends(get_db)
):
    """Obtém leaderboard com top 3 de cada categoria"""
    try:
        ranking_service = RankingService(db)
        leaderboard = ranking_service.get_leaderboard_stats()
        return leaderboard
        
    except Exception as e:
        logger.error(f"Erro ao obter leaderboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/achievements")
async def get_user_achievements(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém conquistas do usuário"""
    try:
        ranking_service = RankingService(db)
        achievements = ranking_service.get_user_achievements(current_user["id"])
        return achievements
        
    except Exception as e:
        logger.error(f"Erro ao obter conquistas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/update-all")
async def update_all_rankings(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza todos os rankings (apenas para administradores)"""
    try:
        # TODO: Implementar verificação de admin
        ranking_service = RankingService(db)
        ranking_service.update_all_rankings()
        
        return {"message": "Rankings atualizados com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao atualizar rankings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/stats")
async def get_ranking_stats(
    db: Session = Depends(get_db)
):
    """Obtém estatísticas gerais do ranking"""
    try:
        ranking_service = RankingService(db)
        leaderboard = ranking_service.get_leaderboard_stats()
        
        return {
            "total_users": leaderboard["total_users"],
            "categories": {
                "xp": len(leaderboard["top_xp"]),
                "tokens": len(leaderboard["top_tokens"]),
                "missions": len(leaderboard["top_missions"]),
                "overall": len(leaderboard["top_overall"])
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do ranking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )



