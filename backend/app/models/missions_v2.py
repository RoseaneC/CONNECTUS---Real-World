"""
Modelos SQLAlchemy para Missões Diárias v2 (missions-v2)
Tabelas isoladas e aditivas para o novo sistema de missões diárias
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, UniqueConstraint, Index
from sqlalchemy.sql import func
from app.core.database import Base


class DailyMission(Base):
    """Tabela de missões diárias disponíveis"""
    __tablename__ = "daily_missions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(String(255), nullable=False)
    xp_reward = Column(Integer, nullable=False, default=0)
    token_reward = Column(Integer, nullable=False, default=0)
    icon = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<DailyMission(id={self.id}, code='{self.code}', title='{self.title}')>"


class UserMissionProgress(Base):
    """Tabela de progresso do usuário em missões diárias (idempotência por dia)"""
    __tablename__ = "user_mission_progress"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    mission_id = Column(Integer, nullable=False, index=True)
    date = Column(String(10), nullable=False)  # YYYY-MM-DD
    status = Column(String(20), nullable=False, default="pending")  # "pending" | "completed"
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Constraint único para garantir idempotência diária
    __table_args__ = (
        UniqueConstraint('user_id', 'mission_id', 'date', name='uq_user_mission_date'),
        Index('idx_user_mission_date', 'user_id', 'mission_id', 'date'),
    )
    
    def __repr__(self):
        return f"<UserMissionProgress(id={self.id}, user_id={self.user_id}, mission_id={self.mission_id}, date='{self.date}', status='{self.status}')>"

