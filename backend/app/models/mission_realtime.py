"""
Modelos SQLAlchemy para Missões em Tempo Real
Tabelas de auditoria, eventos, tentativas e evidências
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class FeatureFlag(Base):
    """Feature flags para controle de funcionalidades"""
    __tablename__ = "feature_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    flag_name = Column(String(100), unique=True, nullable=False, index=True)
    flag_value = Column(Boolean, nullable=False, default=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

class MissionEvent(Base):
    """Eventos de missão (todos os eventos do sistema)"""
    __tablename__ = "mission_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mission_slug = Column(String(100), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    payload = Column(Text, nullable=False)  # JSON
    payload_hash = Column(String(64), nullable=False)  # SHA256
    created_at = Column(DateTime, default=func.current_timestamp(), index=True)
    
    # Relacionamentos
    user = relationship("User")  # Removido back_populates
    attempts = relationship("MissionAttempt", back_populates="event")
    
    # Índices compostos
    __table_args__ = (
        Index('idx_mission_events_user_mission', 'user_id', 'mission_slug'),
    )

class MissionAttempt(Base):
    """Tentativas de missão (resultado da avaliação)"""
    __tablename__ = "mission_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mission_slug = Column(String(100), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("mission_events.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False, index=True)  # pending, approved, rejected
    score = Column(Integer, default=0)
    evidence_hash = Column(String(64), nullable=False)  # SHA256
    reason = Column(Text)  # Motivo da aprovação/rejeição
    evaluated_at = Column(DateTime, default=func.current_timestamp())
    
    # Relacionamentos
    user = relationship("User")  # Removido back_populates
    event = relationship("MissionEvent", back_populates="attempts")
    evidences = relationship("MissionEvidence", back_populates="attempt", cascade="all, delete-orphan")
    
    # Índices compostos
    __table_args__ = (
        Index('idx_mission_attempts_user_status', 'user_id', 'status'),
    )

class MissionEvidence(Base):
    """Evidências de missão (provas de conclusão)"""
    __tablename__ = "mission_evidences"
    
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("mission_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_type = Column(String(50), nullable=False, index=True)  # qr_scan, post_created, quiz_passed, geo_checkin
    evidence_data = Column(Text, nullable=False)  # JSON
    evidence_hash = Column(String(64), nullable=False, index=True)  # SHA256
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relacionamentos
    attempt = relationship("MissionAttempt", back_populates="evidences")

class MissionRule(Base):
    """Regras de missão (configuração declarativa)"""
    __tablename__ = "mission_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    mission_slug = Column(String(100), unique=True, nullable=False, index=True)
    rule_name = Column(String(200), nullable=False)
    rule_config = Column(Text, nullable=False)  # JSON
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

# Adicionar relacionamentos ao modelo User existente
# Função removida para evitar conflitos de relacionamentos SQLAlchemy
