from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRanking(Base):
    __tablename__ = "user_rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Métricas de ranking
    total_xp = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Numeric(20, 6), default=0, nullable=False)
    missions_completed = Column(Integer, default=0, nullable=False)
    posts_created = Column(Integer, default=0, nullable=False)
    likes_received = Column(Integer, default=0, nullable=False)
    
    # Posição no ranking
    xp_rank = Column(Integer, nullable=True)
    token_rank = Column(Integer, nullable=True)
    mission_rank = Column(Integer, nullable=True)
    overall_rank = Column(Integer, nullable=True)
    
    # Metadados
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="ranking")
    
    def __repr__(self):
        return f"<UserRanking(user_id={self.user_id}, xp_rank={self.xp_rank}, overall_rank={self.overall_rank})>"
    
    def calculate_overall_score(self) -> float:
        """Calcula pontuação geral baseada em múltiplas métricas"""
        # Sistema de pontuação ponderado
        xp_score = self.total_xp * 0.3
        token_score = float(self.total_tokens) * 100 * 0.2
        mission_score = self.missions_completed * 10 * 0.3
        engagement_score = (self.posts_created * 5 + self.likes_received) * 0.2
        
        return xp_score + token_score + mission_score + engagement_score







