from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime
from ..models.ranking import UserRanking
from ..models.user import User
from ..schemas.ranking import UserRankingResponse, RankingResponse
import logging

logger = logging.getLogger(__name__)


class RankingService:
    """Serviço para gerenciamento de rankings"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_ranking_by_xp(self, limit: int = 50, offset: int = 0) -> List[UserRanking]:
        """Obtém ranking por XP"""
        return self.db.query(UserRanking).filter(
            UserRanking.xp_rank.isnot(None)
        ).order_by(UserRanking.xp_rank).offset(offset).limit(limit).all()
    
    def get_ranking_by_tokens(self, limit: int = 50, offset: int = 0) -> List[UserRanking]:
        """Obtém ranking por tokens"""
        return self.db.query(UserRanking).filter(
            UserRanking.token_rank.isnot(None)
        ).order_by(UserRanking.token_rank).offset(offset).limit(limit).all()
    
    def get_ranking_by_missions(self, limit: int = 50, offset: int = 0) -> List[UserRanking]:
        """Obtém ranking por missões completadas"""
        return self.db.query(UserRanking).filter(
            UserRanking.mission_rank.isnot(None)
        ).order_by(UserRanking.mission_rank).offset(offset).limit(limit).all()
    
    def get_overall_ranking(self, limit: int = 50, offset: int = 0) -> List[UserRanking]:
        """Obtém ranking geral"""
        return self.db.query(UserRanking).filter(
            UserRanking.overall_rank.isnot(None)
        ).order_by(UserRanking.overall_rank).offset(offset).limit(limit).all()
    
    def get_user_ranking(self, user_id: int) -> Optional[UserRanking]:
        """Obtém ranking de um usuário específico"""
        return self.db.query(UserRanking).filter(UserRanking.user_id == user_id).first()
    
    def update_all_rankings(self):
        """Atualiza todos os rankings (executar via cron)"""
        try:
            # Atualizar métricas de todos os usuários
            self._update_all_user_metrics()
            
            # Calcular rankings
            self._calculate_xp_ranking()
            self._calculate_token_ranking()
            self._calculate_mission_ranking()
            self._calculate_overall_ranking()
            
            self.db.commit()
            logger.info("Rankings atualizados com sucesso")
            
        except Exception as e:
            logger.error(f"Erro ao atualizar rankings: {e}")
            self.db.rollback()
    
    def _update_all_user_metrics(self):
        """Atualiza métricas de todos os usuários"""
        users = self.db.query(User).filter(User.is_active == True).all()
        
        for user in users:
            ranking = self.db.query(UserRanking).filter(UserRanking.user_id == user.id).first()
            if not ranking:
                ranking = UserRanking(user_id=user.id)
                self.db.add(ranking)
            
            # Atualizar métricas
            ranking.total_xp = user.xp
            ranking.total_tokens = user.tokens_earned
            ranking.missions_completed = user.missions_completed
            ranking.posts_created = len(user.posts)
            
            # Calcular likes recebidos
            likes_received = sum(post.likes_count for post in user.posts)
            ranking.likes_received = likes_received
            
            ranking.last_updated = datetime.utcnow()
    
    def _calculate_xp_ranking(self):
        """Calcula ranking por XP"""
        rankings = self.db.query(UserRanking).order_by(desc(UserRanking.total_xp)).all()
        
        for i, ranking in enumerate(rankings, 1):
            ranking.xp_rank = i
    
    def _calculate_token_ranking(self):
        """Calcula ranking por tokens"""
        rankings = self.db.query(UserRanking).order_by(desc(UserRanking.total_tokens)).all()
        
        for i, ranking in enumerate(rankings, 1):
            ranking.token_rank = i
    
    def _calculate_mission_ranking(self):
        """Calcula ranking por missões"""
        rankings = self.db.query(UserRanking).order_by(desc(UserRanking.missions_completed)).all()
        
        for i, ranking in enumerate(rankings, 1):
            ranking.mission_rank = i
    
    def _calculate_overall_ranking(self):
        """Calcula ranking geral baseado em pontuação ponderada"""
        rankings = self.db.query(UserRanking).all()
        
        # Calcular pontuação geral para cada usuário
        for ranking in rankings:
            overall_score = ranking.calculate_overall_score()
            ranking.overall_score = overall_score
        
        # Ordenar por pontuação geral
        sorted_rankings = sorted(rankings, key=lambda x: x.overall_score, reverse=True)
        
        for i, ranking in enumerate(sorted_rankings, 1):
            ranking.overall_rank = i
    
    def get_ranking_page(self, ranking_type: str = "overall", page: int = 1, page_size: int = 20) -> RankingResponse:
        """Obtém página do ranking com paginação"""
        offset = (page - 1) * page_size
        
        if ranking_type == "xp":
            rankings = self.get_ranking_by_xp(page_size, offset)
        elif ranking_type == "tokens":
            rankings = self.get_ranking_by_tokens(page_size, offset)
        elif ranking_type == "missions":
            rankings = self.get_ranking_by_missions(page_size, offset)
        else:
            rankings = self.get_overall_ranking(page_size, offset)
        
        # Contar total de registros
        total_count = self.db.query(UserRanking).count()
        
        # Verificar se há próxima página
        has_next = (offset + page_size) < total_count
        
        return RankingResponse(
            rankings=rankings,
            total_count=total_count,
            page=page,
            page_size=page_size,
            has_next=has_next
        )
    
    def get_user_position(self, user_id: int, ranking_type: str = "overall") -> Optional[int]:
        """Obtém posição do usuário no ranking"""
        user_ranking = self.get_user_ranking(user_id)
        if not user_ranking:
            return None
        
        if ranking_type == "xp":
            return user_ranking.xp_rank
        elif ranking_type == "tokens":
            return user_ranking.token_rank
        elif ranking_type == "missions":
            return user_ranking.mission_rank
        else:
            return user_ranking.overall_rank
    
    def get_leaderboard_stats(self) -> dict:
        """Obtém estatísticas do leaderboard"""
        total_users = self.db.query(UserRanking).count()
        
        # Top 3 de cada categoria
        top_xp = self.get_ranking_by_xp(3)
        top_tokens = self.get_ranking_by_tokens(3)
        top_missions = self.get_ranking_by_missions(3)
        top_overall = self.get_overall_ranking(3)
        
        return {
            "total_users": total_users,
            "top_xp": [{"user": r.user, "xp": r.total_xp, "rank": r.xp_rank} for r in top_xp],
            "top_tokens": [{"user": r.user, "tokens": float(r.total_tokens), "rank": r.token_rank} for r in top_tokens],
            "top_missions": [{"user": r.user, "missions": r.missions_completed, "rank": r.mission_rank} for r in top_missions],
            "top_overall": [{"user": r.user, "score": r.calculate_overall_score(), "rank": r.overall_rank} for r in top_overall]
        }
    
    def get_user_achievements(self, user_id: int) -> dict:
        """Obtém conquistas do usuário"""
        user_ranking = self.get_user_ranking(user_id)
        if not user_ranking:
            return {}
        
        achievements = []
        
        # Conquistas baseadas em XP
        if user_ranking.total_xp >= 1000:
            achievements.append({"name": "Primeiro Milhar", "description": "Ganhou 1000 XP", "icon": "🥇"})
        if user_ranking.total_xp >= 5000:
            achievements.append({"name": "Experiente", "description": "Ganhou 5000 XP", "icon": "🏆"})
        if user_ranking.total_xp >= 10000:
            achievements.append({"name": "Veterano", "description": "Ganhou 10000 XP", "icon": "👑"})
        
        # Conquistas baseadas em missões
        if user_ranking.missions_completed >= 10:
            achievements.append({"name": "Dedicado", "description": "Completou 10 missões", "icon": "🎯"})
        if user_ranking.missions_completed >= 50:
            achievements.append({"name": "Missão Cumprida", "description": "Completou 50 missões", "icon": "🎖️"})
        if user_ranking.missions_completed >= 100:
            achievements.append({"name": "Lenda", "description": "Completou 100 missões", "icon": "🌟"})
        
        # Conquistas baseadas em tokens
        if float(user_ranking.total_tokens) >= 100:
            achievements.append({"name": "Rico", "description": "Ganhou 100 tokens", "icon": "💰"})
        if float(user_ranking.total_tokens) >= 500:
            achievements.append({"name": "Milionário", "description": "Ganhou 500 tokens", "icon": "💎"})
        
        # Conquistas baseadas em posts
        if user_ranking.posts_created >= 10:
            achievements.append({"name": "Comunicador", "description": "Criou 10 posts", "icon": "📝"})
        if user_ranking.posts_created >= 50:
            achievements.append({"name": "Influenciador", "description": "Criou 50 posts", "icon": "📢"})
        
        return {
            "total_achievements": len(achievements),
            "achievements": achievements
        }

















