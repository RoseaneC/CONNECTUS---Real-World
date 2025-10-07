from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.mission import Mission, UserMission
from ..models.user import User
from ..schemas.mission import MissionCreate, UserMissionCreate, UserMissionUpdate
from .user_service import UserService
import logging

logger = logging.getLogger(__name__)


class MissionService:
    """Serviço para gerenciamento de missões"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
    
    def create_mission(self, mission_data: MissionCreate) -> Optional[Mission]:
        """Cria uma nova missão"""
        try:
            db_mission = Mission(**mission_data.dict())
            self.db.add(db_mission)
            self.db.commit()
            self.db.refresh(db_mission)
            
            logger.info(f"Missão criada: {db_mission.title} (ID: {db_mission.id})")
            return db_mission
            
        except Exception as e:
            logger.error(f"Erro ao criar missão: {e}")
            self.db.rollback()
            return None
    
    def get_all_missions(self, active_only: bool = True) -> List[Mission]:
        """Obtém todas as missões"""
        query = self.db.query(Mission)
        if active_only:
            query = query.filter(Mission.is_active == True)
        return query.order_by(desc(Mission.created_at)).all()
    
    def get_mission_by_id(self, mission_id: int) -> Optional[Mission]:
        """Obtém missão por ID"""
        return self.db.query(Mission).filter(Mission.id == mission_id).first()
    
    def get_user_missions(self, user_id: int, completed_only: bool = False) -> List[dict]:
        """Obtém missões do usuário"""
        query = self.db.query(UserMission).filter(UserMission.user_id == user_id)
        if completed_only:
            query = query.filter(UserMission.is_completed == True)
        user_missions = query.order_by(desc(UserMission.created_at)).all()
        
        # Converter para formato esperado pelo schema
        return [self._user_mission_to_dict(user_mission) for user_mission in user_missions]
    
    def assign_mission_to_user(self, user_id: int, mission_id: int) -> Optional[UserMission]:
        """Atribui missão ao usuário"""
        try:
            # Verificar se já existe
            existing = self.db.query(UserMission).filter(
                and_(UserMission.user_id == user_id, UserMission.mission_id == mission_id)
            ).first()
            
            if existing:
                return existing
            
            # Verificar se a missão existe e está ativa
            mission = self.get_mission_by_id(mission_id)
            if not mission or not mission.is_active:
                return None
            
            # Criar atribuição
            user_mission = UserMission(
                user_id=user_id,
                mission_id=mission_id
            )
            
            self.db.add(user_mission)
            self.db.commit()
            self.db.refresh(user_mission)
            
            return user_mission
            
        except Exception as e:
            logger.error(f"Erro ao atribuir missão: {e}")
            self.db.rollback()
            return None
    
    async def update_user_mission(self, user_mission_id: int, update_data: UserMissionUpdate) -> Optional[UserMission]:
        """Atualiza progresso da missão do usuário"""
        try:
            user_mission = self.db.query(UserMission).filter(UserMission.id == user_mission_id).first()
            if not user_mission:
                return None
            
            update_dict = update_data.dict(exclude_unset=True)
            for field, value in update_dict.items():
                setattr(user_mission, field, value)
            
            # Se completou a missão, dar recompensas
            if update_data.is_completed and not user_mission.is_completed:
                await self._complete_mission(user_mission)
            
            user_mission.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user_mission)
            
            return user_mission
            
        except Exception as e:
            logger.error(f"Erro ao atualizar missão do usuário: {e}")
            self.db.rollback()
            return None
    
    async def complete_mission(self, user_mission_id: int) -> bool:
        """Completa uma missão e dá recompensas"""
        try:
            user_mission = self.db.query(UserMission).filter(UserMission.id == user_mission_id).first()
            if not user_mission or user_mission.is_completed:
                return False
            
            # Completar missão
            user_mission.complete_mission()
            
            # Dar recompensas
            mission = user_mission.mission
            user = user_mission.user
            
            # Adicionar XP
            if mission.xp_reward > 0:
                self.user_service.add_xp(user.id, mission.xp_reward)
            
            # Adicionar tokens
            if mission.token_reward > 0:
                to_yield = user.is_eligible_for_yield
                self.user_service.add_tokens(user.id, float(mission.token_reward), to_yield)
            
            # Incrementar contador de missões
            self.user_service.complete_mission(user.id)
            
            self.db.commit()
            
            logger.info(f"Missão completada: {mission.title} por {user.nickname}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao completar missão: {e}")
            self.db.rollback()
            return False
    
    async def _complete_mission(self, user_mission: UserMission):
        """Método interno para completar missão"""
        user_mission.complete_mission()
        
        # Dar recompensas
        mission = user_mission.mission
        user = user_mission.user
        
        # Adicionar XP
        if mission.xp_reward > 0:
            self.user_service.add_xp(user.id, mission.xp_reward)
        
        # Adicionar tokens
        if mission.token_reward > 0:
            to_yield = user.is_eligible_for_yield
            self.user_service.add_tokens(user.id, float(mission.token_reward), to_yield)
        
        # Incrementar contador de missões
        self.user_service.complete_mission(user.id)
    
    def get_daily_missions(self, user_id: int) -> List[dict]:
        """Obtém missões diárias do usuário"""
        # Buscar missões diárias ativas
        daily_missions = self.db.query(Mission).filter(
            and_(Mission.is_daily == True, Mission.is_active == True)
        ).all()
        
        # Verificar se o usuário já tem essas missões atribuídas hoje
        today = datetime.utcnow().date()
        user_missions = []
        
        for mission in daily_missions:
            # Verificar se já existe missão do usuário para hoje
            existing = self.db.query(UserMission).filter(
                and_(
                    UserMission.user_id == user_id,
                    UserMission.mission_id == mission.id,
                    UserMission.created_at >= today
                )
            ).first()
            
            if not existing:
                # Atribuir nova missão diária
                user_mission = self.assign_mission_to_user(user_id, mission.id)
                if user_mission:
                    user_missions.append(user_mission)
            else:
                user_missions.append(existing)
        
        # Converter para formato esperado pelo schema
        return [self._user_mission_to_dict(user_mission) for user_mission in user_missions]
    
    def reset_daily_missions(self):
        """Reset das missões diárias (executar via cron)"""
        try:
            # Marcar missões diárias como não completadas
            today = datetime.utcnow().date()
            self.db.query(UserMission).filter(
                and_(
                    UserMission.created_at < today,
                    UserMission.is_completed == False
                )
            ).update({"is_completed": False})
            
            self.db.commit()
            logger.info("Missões diárias resetadas")
            
        except Exception as e:
            logger.error(f"Erro ao resetar missões diárias: {e}")
            self.db.rollback()
    
    def get_mission_stats(self, user_id: int) -> dict:
        """Obtém estatísticas de missões do usuário"""
        try:
            total_missions = self.db.query(UserMission).filter(UserMission.user_id == user_id).count()
            completed_missions = self.db.query(UserMission).filter(
                and_(UserMission.user_id == user_id, UserMission.is_completed == True)
            ).count()
            
            # Missões por categoria
            category_stats = {}
            missions = self.db.query(UserMission).join(Mission).filter(
                and_(UserMission.user_id == user_id, UserMission.is_completed == True)
            ).all()
            
            for user_mission in missions:
                category = user_mission.mission.category
                if category not in category_stats:
                    category_stats[category] = 0
                category_stats[category] += 1
            
            return {
                "total_missions": total_missions,
                "completed_missions": completed_missions,
                "completion_rate": (completed_missions / total_missions * 100) if total_missions > 0 else 0,
                "category_stats": category_stats
            }
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas de missões: {e}")
            return {
                "total_missions": 0,
                "completed_missions": 0,
                "completion_rate": 0,
                "category_stats": {}
            }
    
    def _user_mission_to_dict(self, user_mission: UserMission) -> dict:
        """Converte objeto UserMission para dict compatível com UserMissionResponse"""
        # Buscar missão
        mission = self.db.query(Mission).filter(Mission.id == user_mission.mission_id).first()
        mission_dict = {
            "id": mission.id,
            "title": mission.title,
            "description": mission.description,
            "category": mission.category,
            "xp_reward": mission.xp_reward,
            "token_reward": float(mission.token_reward),
            "is_daily": mission.is_daily,
            "difficulty": mission.difficulty,
            "is_active": mission.is_active,
            "created_at": mission.created_at.isoformat() if mission.created_at else None
        } if mission else {
            "id": user_mission.mission_id,
            "title": "Missão não encontrada",
            "description": "",
            "category": "unknown",
            "xp_reward": 0,
            "token_reward": 0.0,
            "is_daily": False,
            "difficulty": "easy",
            "is_active": False,
            "created_at": user_mission.created_at.isoformat() if user_mission.created_at else None
        }
        
        return {
            "id": user_mission.id,
            "user_id": user_mission.user_id,
            "mission_id": user_mission.mission_id,
            "is_completed": user_mission.is_completed,
            "completed_at": user_mission.completed_at.isoformat() if user_mission.completed_at else None,
            "progress": user_mission.progress,
            "created_at": user_mission.created_at.isoformat() if user_mission.created_at else None,
            "mission": mission_dict
        }


