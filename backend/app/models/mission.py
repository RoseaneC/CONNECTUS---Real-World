from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Numeric, ForeignKey, Time, JSON, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SAEnum
from enum import Enum
from app.core.database import Base

# [CONNECTUS PATCH] tipos de missão e completion
class MissionType(str, Enum):
    CHECKIN_QR = "CHECKIN_QR"
    IN_APP_ACTION = "IN_APP_ACTION"
    CHECKIN_GEO = "CHECKIN_GEO"  # opcional; fica atrás de flag


class Mission(Base):
    __tablename__ = "missions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # school, study, environment, community
    xp_reward = Column(Integer, default=0, nullable=False)
    token_reward = Column(Numeric(10, 6), default=0, nullable=False)
    is_daily = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    difficulty = Column(String(20), default="easy", nullable=False)  # easy, medium, hard
    
    # [CONNECTUS PATCH] novos campos para missões verificáveis
    type = Column(SAEnum(MissionType), nullable=False, default=MissionType.IN_APP_ACTION)
    window_start = Column(Time, nullable=True)  # p/ janela diária opcional
    window_end = Column(Time, nullable=True)
    verification_hint = Column(String, nullable=True)
    
    # Metadados
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user_missions = relationship("UserMission", back_populates="mission")
    
    def __repr__(self):
        return f"<Mission(id={self.id}, title='{self.title}', xp={self.xp_reward})>"


class UserMission(Base):
    __tablename__ = "user_missions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    
    # Status da missão
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Integer, default=0, nullable=False)  # 0-100%
    
    # Metadados
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="missions")
    mission = relationship("Mission", back_populates="user_missions")
    
    def __repr__(self):
        return f"<UserMission(user_id={self.user_id}, mission_id={self.mission_id}, completed={self.is_completed})>"
    
    def complete_mission(self):
        """Marca a missão como concluída"""
        self.is_completed = True
        self.completed_at = func.now()
        self.progress = 100


# [CONNECTUS PATCH] nova tabela para missões verificáveis
class MissionCompletion(Base):
    __tablename__ = "mission_completions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    completed_at = Column(DateTime, default=func.now, nullable=False)
    proof_type = Column(String, nullable=True)    # "qr" | "in_app" | "geo"
    proof_meta = Column(JSON, nullable=True)      # dados mínimos
    xp_awarded = Column(Integer, default=0)
    tokens_awarded = Column(Integer, default=0)

    __table_args__ = (UniqueConstraint("user_id", "mission_id", "completed_at", name="uq_daily_unique_by_day"),)



