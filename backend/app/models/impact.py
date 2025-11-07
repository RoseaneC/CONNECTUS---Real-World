"""
Modelo de Impact Score (Social Credit Score descentralizado)
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, ForeignKey, Index, CheckConstraint
from sqlalchemy.sql import func
from app.core.database import Base


class ImpactEvent(Base):
    """Eventos de impacto registrados pelos usuários"""
    __tablename__ = "impact_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Tipo de evento (enum textual)
    type = Column(String(50), nullable=False, index=True)
    
    # Peso do evento
    weight = Column(Float, nullable=False, index=True)
    
    # Metadados do evento (JSON)
    # Usar 'meta' como atributo Python para evitar conflito com palavra reservada do SQLAlchemy
    # mas manter nome de coluna 'metadata' no banco para compatibilidade
    meta = Column("metadata", JSON, nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Índices compostos para queries eficientes
    __table_args__ = (
        Index('idx_impact_events_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_impact_events_type_timestamp', 'type', 'timestamp'),
        CheckConstraint('weight >= 0', name='check_weight_nonnegative'),
    )
    
    def __repr__(self):
        return f"<ImpactEvent(id={self.id}, user_id={self.user_id}, type='{self.type}', weight={self.weight})>"


class ImpactScore(Base):
    """Scores de impacto por usuário (cache/aggregate)"""
    __tablename__ = "impact_scores"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    
    # Score total (soma ponderada)
    score = Column(Float, nullable=False, default=0.0)
    
    # Breakdown por tipo de evento (JSON)
    breakdown = Column(JSON, nullable=True)
    # Exemplo: { "mission_completed": 2, "community_vote": 1, "peer_review": 0, "donation": 1 }
    
    # Última atualização
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<ImpactScore(user_id={self.user_id}, score={self.score})>"

