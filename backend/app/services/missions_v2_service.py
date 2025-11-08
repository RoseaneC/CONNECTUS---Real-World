"""
Serviço para Missões Diárias v2 (missions-v2)
Gerencia missões diárias, progresso e recompensas de forma idempotente
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.missions_v2 import DailyMission, UserMissionProgress
from app.models.user import User
from app.services.user_service import UserService

logger = logging.getLogger(__name__)

# Timezone para data do "dia" (compatibilidade Python < 3.9)
try:
    from zoneinfo import ZoneInfo
    TZ_SAO_PAULO = ZoneInfo("America/Sao_Paulo")
except ImportError:
    # Fallback para Python < 3.9
    try:
        import pytz
        TZ_SAO_PAULO = pytz.timezone("America/Sao_Paulo")
    except ImportError:
        # Fallback final: usar UTC (não ideal, mas funcional)
        logger.warning("[MISSIONS_V2] zoneinfo e pytz não disponíveis. Usando UTC como fallback.")
        TZ_SAO_PAULO = None


def today_str_tz() -> str:
    """
    Retorna a data de hoje no formato YYYY-MM-DD usando timezone America/Sao_Paulo.
    """
    if TZ_SAO_PAULO:
        now = datetime.now(TZ_SAO_PAULO)
    else:
        # Fallback: usar UTC (não ideal, mas funcional)
        try:
            from datetime import timezone
            now = datetime.now(timezone.utc)
        except ImportError:
            now = datetime.utcnow()  # Python < 3.2
    return now.strftime("%Y-%m-%d")


def get_daily_missions(session: Session) -> List[DailyMission]:
    """
    Retorna lista de missões diárias ativas.
    """
    return session.query(DailyMission).filter(
        DailyMission.is_active == True
    ).all()


def get_user_progress_map(session: Session, user_id: int, date: str) -> Dict[int, str]:
    """
    Retorna dict { mission_id: status } para o dia especificado.
    """
    progress_list = session.query(UserMissionProgress).filter(
        UserMissionProgress.user_id == user_id,
        UserMissionProgress.date == date
    ).all()
    
    return {p.mission_id: p.status for p in progress_list}


def apply_rewards(session: Session, user_id: int, xp: int, tokens: int) -> Tuple[int, float]:
    """
    Aplica recompensas de XP e Tokens ao usuário.
    Retorna (xp_atual, tokens_atual).
    """
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"Usuário {user_id} não encontrado")
    
    # Atualizar XP
    user.xp = (user.xp or 0) + xp
    
    # Atualizar tokens (tokens_available e tokens_earned)
    current_available = float(user.tokens_available or 0)
    current_earned = float(user.tokens_earned or 0)
    
    user.tokens_available = current_available + tokens
    user.tokens_earned = current_earned + tokens
    
    session.flush()
    
    # Atualizar ranking (usando UserService)
    try:
        user_service = UserService(session)
        user_service._update_ranking(user_id)
    except Exception as e:
        logger.warning(f"[MISSIONS_V2] Erro ao atualizar ranking: {e}")
    
    return (user.xp, float(user.tokens_available))


def complete_mission(
    session: Session,
    user: User,
    mission_code: str
) -> Dict:
    """
    Completa uma missão diária de forma idempotente.
    
    Args:
        session: Sessão do banco de dados
        user: Usuário autenticado
        mission_code: Código da missão (ex: "CHECKIN")
    
    Returns:
        Dict com:
        - completed: bool
        - alreadyCompleted: bool
        - rewards: {xp, tokens}
        - userTotals: {xp, tokens}
    
    Raises:
        ValueError: Se missão não encontrada ou inativa
    """
    # 1) Resolver missão por code ativo
    mission = session.query(DailyMission).filter(
        DailyMission.code == mission_code.upper().strip(),
        DailyMission.is_active == True
    ).first()
    
    if not mission:
        raise ValueError(f"Missão '{mission_code}' não encontrada ou inativa")
    
    # 2) Determinar data do dia
    date = today_str_tz()
    
    # 3) Verificar se já existe progresso para este dia
    existing_progress = session.query(UserMissionProgress).filter(
        UserMissionProgress.user_id == user.id,
        UserMissionProgress.mission_id == mission.id,
        UserMissionProgress.date == date
    ).first()
    
    if existing_progress:
        # Já completada hoje - retornar sem aplicar recompensa
        logger.info(f"[MISSIONS] complete code={mission_code} user_id={user.id} already=True")
        return {
            "completed": True,
            "alreadyCompleted": True,
            "rewards": {"xp": 0, "tokens": 0},
            "userTotals": {
                "xp": user.xp or 0,
                "tokens": float(user.tokens_available or 0)
            }
        }
    
    # 4) Inserir progresso e aplicar recompensa (transacional)
    try:
        # Usar datetime com timezone se disponível
        try:
            from datetime import timezone
            completed_at = datetime.now(timezone.utc)
        except ImportError:
            completed_at = datetime.utcnow()
        
        progress = UserMissionProgress(
            user_id=user.id,
            mission_id=mission.id,
            date=date,
            status="completed",
            completed_at=completed_at
        )
        session.add(progress)
        session.flush()
        
        # Aplicar recompensas
        xp_current, tokens_current = apply_rewards(
            session,
            user.id,
            mission.xp_reward,
            mission.token_reward
        )
        
        session.commit()
        
        logger.info(f"[MISSIONS] complete code={mission_code} user_id={user.id} already=False xp={mission.xp_reward} tokens={mission.token_reward}")
        
        return {
            "completed": True,
            "alreadyCompleted": False,
            "rewards": {
                "xp": mission.xp_reward,
                "tokens": mission.token_reward
            },
            "userTotals": {
                "xp": xp_current,
                "tokens": tokens_current
            }
        }
        
    except IntegrityError as e:
        # Race condition: outro processo completou ao mesmo tempo
        session.rollback()
        logger.warning(f"[MISSIONS] Race condition detectada para code={mission_code} user_id={user.id}: {e}")
        
        # Verificar novamente
        existing_progress = session.query(UserMissionProgress).filter(
            UserMissionProgress.user_id == user.id,
            UserMissionProgress.mission_id == mission.id,
            UserMissionProgress.date == date
        ).first()
        
        if existing_progress:
            # Recarregar user para obter valores atualizados
            session.refresh(user)
            return {
                "completed": True,
                "alreadyCompleted": True,
                "rewards": {"xp": 0, "tokens": 0},
                "userTotals": {
                    "xp": user.xp or 0,
                    "tokens": float(user.tokens_available or 0)
                }
            }
        else:
            # Erro inesperado
            raise

