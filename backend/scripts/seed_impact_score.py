"""
Script para seeds de Impact Score (dados de demonstração)
"""

import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.user import User
from app.services.impact_service import create_impact_event, recalc_impact_score
from app.schemas.impact import ImpactEventIn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_impact_data():
    """Cria eventos de impacto de demonstração"""
    db = SessionLocal()
    
    try:
        # Buscar usuários existentes
        users = db.query(User).limit(3).all()
        
        if not users:
            logger.warning("Nenhum usuário encontrado. Execute seed_dev_user.py primeiro.")
            return
        
        logger.info(f"Encontrados {len(users)} usuários. Criando eventos de impacto...")
        
        # Eventos de demonstração
        demo_events = [
            # Usuário 1
            ("mission_completed", 3.0, {"mission_id": 1, "notes": "Missão educacional completa"}),
            ("mission_completed", 3.0, {"mission_id": 2, "notes": "Outra missão completa"}),
            ("community_vote", 2.0, {"poll_id": 1, "notes": "Participou em votação da comunidade"}),
            ("donation", 2.0, {"amount": 10, "notes": "Doação para causa social"}),
            
            # Usuário 2
            ("peer_review", 1.0, {"review_id": 1, "notes": "Revisou trabalho de colega"}),
            ("mission_completed", 3.0, {"mission_id": 3, "notes": "Missão completada"}),
            ("community_vote", 2.0, {"poll_id": 2, "notes": "Votação participativa"}),
            
            # Usuário 3 (menos eventos)
            ("mission_completed", 3.0, {"mission_id": 4, "notes": "Primeira missão"}),
            ("donation", 2.0, {"amount": 5, "notes": "Doação solidária"}),
        ]
        
        events_created = 0
        
        for i, user in enumerate(users):
            # Criar 3 eventos para cada usuário (distribuir de forma variada)
            user_start = i * 3
            user_events = demo_events[user_start:user_start + 3]
            
            for event_type, weight, metadata in user_events:
                try:
                    event_in = ImpactEventIn(
                        type=event_type,
                        weight=weight,
                        metadata=metadata
                    )
                    
                    create_impact_event(db, user.id, event_in)
                    events_created += 1
                    logger.info(f"✅ Evento criado para user_id={user.id}: {event_type}")
                    
                except Exception as e:
                    logger.error(f"❌ Erro ao criar evento: {e}")
            
            # Recalcular score
            recalc_impact_score(db, user.id)
            logger.info(f"✅ Score recalculado para user_id={user.id}")
        
        db.commit()
        logger.info(f"✅ Seeds de Impact Score concluídos: {events_created} eventos criados")
        
    except Exception as e:
        logger.error(f"❌ Erro ao criar seeds: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Iniciando seeds de Impact Score...")
    seed_impact_data()
    print("✅ Seeds concluídos!")


