#!/usr/bin/env python3
"""
Script para inicializar o banco de dados com dados de exemplo
"""

import asyncio
import sys
import os
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base
from app.services.mission_service import MissionService
from app.services.chat_service import ChatService
from app.services.ranking_service import RankingService
from app.models.mission import Mission
from app.models.user import User
from app.models.ranking import UserRanking
from decimal import Decimal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_tables():
    """Criar todas as tabelas"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas criadas com sucesso")
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {e}")
        raise


def create_sample_missions():
    """Criar missões de exemplo"""
    db = SessionLocal()
    try:
        mission_service = MissionService(db)
        
        missions_data = [
            {
                "title": "Ir à escola",
                "description": "Vá à escola hoje e registre sua presença",
                "category": "school",
                "xp_reward": 50,
                "token_reward": Decimal("2.0"),
                "is_daily": True,
                "difficulty": "easy"
            },
            {
                "title": "Estudar 1h30",
                "description": "Dedique 1 hora e 30 minutos aos estudos",
                "category": "study",
                "xp_reward": 75,
                "token_reward": Decimal("3.0"),
                "is_daily": True,
                "difficulty": "medium"
            },
            {
                "title": "Reciclar latinhas",
                "description": "Colete e recicle 10 latinhas de alumínio",
                "category": "environment",
                "xp_reward": 100,
                "token_reward": Decimal("5.0"),
                "is_daily": True,
                "difficulty": "medium"
            },
            {
                "title": "Cuidar do território",
                "description": "Divulgue oportunidades de estudo na sua comunidade",
                "category": "community",
                "xp_reward": 150,
                "token_reward": Decimal("8.0"),
                "is_daily": False,
                "difficulty": "hard"
            },
            {
                "title": "Ajudar um colega",
                "description": "Ajude um colega com suas tarefas escolares",
                "category": "community",
                "xp_reward": 80,
                "token_reward": Decimal("4.0"),
                "is_daily": False,
                "difficulty": "medium"
            },
            {
                "title": "Plantar uma árvore",
                "description": "Plante uma árvore ou cuide de plantas",
                "category": "environment",
                "xp_reward": 200,
                "token_reward": Decimal("10.0"),
                "is_daily": False,
                "difficulty": "hard"
            }
        ]
        
        for mission_data in missions_data:
            mission = mission_service.create_mission(mission_data)
            if mission:
                logger.info(f"Missão criada: {mission.title}")
        
        logger.info("Missões de exemplo criadas com sucesso")
        
    except Exception as e:
        logger.error(f"Erro ao criar missões: {e}")
        raise
    finally:
        db.close()


def create_sample_users():
    """Criar usuários de exemplo"""
    db = SessionLocal()
    try:
        users_data = [
            {
                "stellar_account_id": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1",
                "public_key": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1",
                "nickname": "joao_silva",
                "full_name": "João Silva",
                "email": "joao@example.com",
                "age": 17,
                "xp": 2450,
                "tokens_earned": Decimal("125.50"),
                "tokens_available": Decimal("75.25"),
                "tokens_in_yield": Decimal("50.25"),
                "missions_completed": 45,
                "level": 12
            },
            {
                "stellar_account_id": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX2",
                "public_key": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX2",
                "nickname": "maria_santos",
                "full_name": "Maria Santos",
                "email": "maria@example.com",
                "age": 16,
                "xp": 2100,
                "tokens_earned": Decimal("98.75"),
                "tokens_available": Decimal("48.50"),
                "tokens_in_yield": Decimal("50.25"),
                "missions_completed": 38,
                "level": 10
            },
            {
                "stellar_account_id": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3",
                "public_key": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3",
                "nickname": "pedro_costa",
                "full_name": "Pedro Costa",
                "email": "pedro@example.com",
                "age": 18,
                "xp": 1850,
                "tokens_earned": Decimal("87.25"),
                "tokens_available": Decimal("87.25"),
                "tokens_in_yield": Decimal("0.00"),
                "missions_completed": 35,
                "level": 9
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Criar ranking para o usuário
            ranking = UserRanking(
                user_id=user.id,
                total_xp=user.xp,
                total_tokens=user.tokens_earned,
                missions_completed=user.missions_completed,
                posts_created=0,
                likes_received=0
            )
            db.add(ranking)
            db.commit()
            
            logger.info(f"Usuário criado: {user.nickname}")
        
        logger.info("Usuários de exemplo criados com sucesso")
        
    except Exception as e:
        logger.error(f"Erro ao criar usuários: {e}")
        raise
    finally:
        db.close()


def create_chat_rooms():
    """Criar salas de chat padrão"""
    db = SessionLocal()
    try:
        chat_service = ChatService(db)
        chat_service.create_default_rooms()
        logger.info("Salas de chat criadas com sucesso")
    except Exception as e:
        logger.error(f"Erro ao criar salas de chat: {e}")
        raise
    finally:
        db.close()


def update_rankings():
    """Atualizar rankings"""
    db = SessionLocal()
    try:
        ranking_service = RankingService(db)
        ranking_service.update_all_rankings()
        logger.info("Rankings atualizados com sucesso")
    except Exception as e:
        logger.error(f"Erro ao atualizar rankings: {e}")
        raise
    finally:
        db.close()


def main():
    """Função principal"""
    logger.info("Iniciando inicialização do banco de dados...")
    
    try:
        # Criar tabelas
        create_tables()
        
        # Criar dados de exemplo
        create_sample_missions()
        create_sample_users()
        create_chat_rooms()
        update_rankings()
        
        logger.info("Inicialização concluída com sucesso!")
        
    except Exception as e:
        logger.error(f"Erro durante a inicialização: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

















