"""
Schemas Pydantic para Impact Score
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, model_serializer


class ImpactEventIn(BaseModel):
    """Schema de entrada para criar evento de impacto"""
    type: str = Field(..., description="Tipo de evento (mission_completed, community_vote, peer_review, donation)")
    weight: Optional[float] = Field(None, ge=0, description="Peso do evento (opcional, usa default se None)")
    metadata: Optional[Dict[str, Any]] = Field(None, max_length=5120, description="Metadados do evento (JSON, max 5KB)")
    
    model_config = ConfigDict(extra="forbid")


class ImpactEventOut(BaseModel):
    """Schema de saída para evento de impacto
    
    Nota: expõe 'metadata' no JSON mas o ORM usa 'meta' para evitar conflito com palavra reservada SQLAlchemy
    """
    id: int
    user_id: int
    type: str
    weight: float
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
    @model_serializer
    def ser_model(self):
        """Garante que metadata é exposto no JSON (não meta)"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "weight": self.weight,
            "metadata": self.metadata,  # Expor como 'metadata' no JSON
            "timestamp": self.timestamp
        }


class ImpactScoreOut(BaseModel):
    """Schema de saída para score de impacto"""
    user_id: int
    score: float
    breakdown: Optional[Dict[str, int]]
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AttestationOut(BaseModel):
    """Schema de saída para attestation mock"""
    attestation_id: str
    hash: str
    stored: bool


class ImpactEventResponse(BaseModel):
    """Resposta completa ao criar evento (evento + novo score)"""
    event: ImpactEventOut
    score: ImpactScoreOut

