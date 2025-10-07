from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from datetime import datetime
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate
from ..core.security import create_access_token, hash_password, verify_password
import logging

logger = logging.getLogger(__name__)


class UserService:
    """Serviço para gerenciamento de usuários"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> Optional[User]:
        """Cria um novo usuário"""
        try:
            # Verificar se já existe usuário com esse email
            existing_user = self.db.query(User).filter(
                User.email == user_data.email
            ).first()
            
            if existing_user:
                return existing_user
            
            # Determinar se é menor de idade
            is_minor = user_data.age < 18
            
            # Hash da senha
            password_hash = hash_password(user_data.password)
            
            # Criar usuário
            db_user = User(
                nickname=user_data.nickname,
                full_name=user_data.full_name,
                email=user_data.email,
                password_hash=password_hash,
                age=user_data.age,
                is_minor=is_minor
            )
            
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
            logger.info(f"Usuário criado: {db_user.nickname} (ID: {db_user.id})")
            return db_user
            
        except Exception as e:
            logger.error(f"Erro ao criar usuário: {e}")
            self.db.rollback()
            return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Obtém usuário pelo email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Autentica usuário por email e senha"""
        user = self.get_user_by_email(email)
        if user and verify_password(password, user.password_hash):
            return user
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Obtém usuário por ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_nickname(self, nickname: str) -> Optional[User]:
        """Obtém usuário por nickname"""
        return self.db.query(User).filter(User.nickname == nickname).first()
    
    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Atualiza dados do usuário"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return None
            
            update_data = user_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(user, field, value)
            
            user.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user)
            
            return user
            
        except Exception as e:
            logger.error(f"Erro ao atualizar usuário: {e}")
            self.db.rollback()
            return None
    
    def update_last_login(self, user_id: int) -> bool:
        """Atualiza último login do usuário"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.last_login = datetime.utcnow()
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Erro ao atualizar último login: {e}")
            self.db.rollback()
            return False
    
    def add_xp(self, user_id: int, amount: int) -> bool:
        """Adiciona XP ao usuário"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.add_xp(amount)
            self.db.commit()
            
            # Atualizar ranking
            self._update_ranking(user_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao adicionar XP: {e}")
            self.db.rollback()
            return False
    
    def add_tokens(self, user_id: int, amount: float, to_yield: bool = False) -> bool:
        """Adiciona tokens ao usuário"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.add_tokens(amount, to_yield)
            self.db.commit()
            
            # Atualizar ranking
            self._update_ranking(user_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao adicionar tokens: {e}")
            self.db.rollback()
            return False
    
    def complete_mission(self, user_id: int) -> bool:
        """Incrementa contador de missões concluídas"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.missions_completed += 1
            self.db.commit()
            
            # Atualizar ranking
            self._update_ranking(user_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao completar missão: {e}")
            self.db.rollback()
            return False
    
    async def get_user_profile(self, user_id: int) -> Optional[dict]:
        """Obtém perfil completo do usuário"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                logger.warning(f"Usuário {user_id} não encontrado")
                return None
            
            return {
                "id": user.id,
                "nickname": user.nickname,
                "full_name": user.full_name,
                "email": user.email,
                "age": user.age,
                "is_minor": user.is_minor,
                "is_eligible_for_yield": user.is_eligible_for_yield,
                "xp": user.xp,
                "level": user.level,
                "tokens_earned": str(user.tokens_earned),
                "tokens_available": str(user.tokens_available),
                "tokens_in_yield": str(user.tokens_in_yield),
                "missions_completed": user.missions_completed,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        except Exception as e:
            logger.error(f"Erro ao obter perfil do usuário {user_id}: {e}")
            return None
    
    async def get_user_balance(self, user_id: int) -> Optional[dict]:
        """Obtém saldo do usuário"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                logger.warning(f"Usuário {user_id} não encontrado")
                return None
            
            return {
                "user_id": user.id,
                "tokens_available": str(user.tokens_available),
                "tokens_in_yield": str(user.tokens_in_yield),
                "tokens_earned": str(user.tokens_earned)
            }
        except Exception as e:
            logger.error(f"Erro ao obter saldo do usuário {user_id}: {e}")
            return None
    
    # Função de transações removida - não estamos mais usando Stellar SDK
    
    def get_user_stats(self, user_id: int) -> Optional[dict]:
        """Obtém estatísticas do usuário"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                logger.warning(f"Usuário {user_id} não encontrado")
                return None
            
            # Estatísticas básicas
            stats = {
                "user_id": user.id,
                "nickname": user.nickname,
                "level": user.level,
                "xp": user.xp,
                "tokens_earned": str(user.tokens_earned),
                "tokens_available": str(user.tokens_available),
                "tokens_in_yield": str(user.tokens_in_yield),
                "missions_completed": user.missions_completed,
                "is_minor": user.is_minor,
                "is_eligible_for_yield": user.is_eligible_for_yield
            }
            
            # Adicionar estatísticas de posts
            try:
                from ..services.post_service import PostService
                post_service = PostService(self.db)
                user_posts = post_service.get_user_posts(user_id)
                stats["posts_created"] = len(user_posts)
            except Exception as e:
                logger.error(f"Erro ao obter estatísticas de posts: {e}")
                stats["posts_created"] = 0
            
            # Adicionar estatísticas de missões
            try:
                from ..services.mission_service import MissionService
                mission_service = MissionService(self.db)
                user_missions = mission_service.get_user_missions(user_id)
                completed_missions = [m for m in user_missions if m.get("is_completed", False)]
                stats["missions_completed"] = len(completed_missions)
            except Exception as e:
                logger.error(f"Erro ao obter estatísticas de missões: {e}")
                stats["missions_completed"] = 0
            
            return stats
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas do usuário {user_id}: {e}")
            return None
    
    def _update_ranking(self, user_id: int):
        """Atualiza dados do ranking do usuário"""
        try:
            from ..models.ranking import UserRanking
            from ..models.user import User
            
            user = self.get_user_by_id(user_id)
            if not user:
                return
            
            ranking = self.db.query(UserRanking).filter(UserRanking.user_id == user_id).first()
            if not ranking:
                ranking = UserRanking(user_id=user_id)
                self.db.add(ranking)
            
            # Atualizar métricas
            ranking.total_xp = user.xp
            ranking.total_tokens = user.tokens_earned
            ranking.missions_completed = user.missions_completed
            ranking.posts_created = len(user.posts) if hasattr(user, 'posts') else 0
            ranking.likes_received = sum(getattr(post, 'likes_count', 0) for post in user.posts) if hasattr(user, 'posts') else 0
            ranking.last_updated = datetime.utcnow()
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Erro ao atualizar ranking: {e}")
            self.db.rollback()
    
    def create_access_token(self, user: User) -> str:
        """Cria token de acesso para o usuário"""
        token_data = {"user_id": user.id}
        return create_access_token(data=token_data)

