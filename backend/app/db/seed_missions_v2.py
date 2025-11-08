"""
Seed inicial para Missões Diárias v2 (missions-v2)
Insere 3 missões ativas se a tabela estiver vazia
"""

import logging
from sqlalchemy.orm import Session
from app.models.missions_v2 import DailyMission

logger = logging.getLogger(__name__)


def seed_daily_missions(session: Session):
    """
    Seed de missões diárias v2.
    Insere 3 missões ativas se a tabela estiver vazia.
    """
    try:
        # Verificar se já existem missões
        count = session.query(DailyMission).count()
        if count > 0:
            logger.info(f"[MISSIONS_V2] Seed: {count} missões já existem. Pulando seed.")
            return
        
        # Criar as 3 missões iniciais
        missions = [
            DailyMission(
                code="CHECKIN",
                title="Check-in diário",
                description="Entre hoje e garanta sua streak!",
                xp_reward=10,
                token_reward=2,
                icon="calendar-check",
                is_active=True
            ),
            DailyMission(
                code="LIKE_POST",
                title="Curtir um post",
                description="Mostre apoio à comunidade",
                xp_reward=15,
                token_reward=3,
                icon="heart",
                is_active=True
            ),
            DailyMission(
                code="INVITE_FRIEND",
                title="Convidar um amigo",
                description="Traga alguém para a ConnectUS",
                xp_reward=30,
                token_reward=5,
                icon="user-plus",
                is_active=True
            ),
        ]
        
        for mission in missions:
            session.add(mission)
        
        session.commit()
        logger.info(f"[MISSIONS_V2] Seed: {len(missions)} missões criadas com sucesso.")
        
    except Exception as e:
        logger.error(f"[MISSIONS_V2] Seed falhou: {e}")
        session.rollback()
        raise

