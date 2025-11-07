"""
Router para Impact Score (Social Credit Score descentralizado)
"""

import hashlib
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.auth import get_current_active_user
from ..models.user import User
from ..schemas.impact import (
    ImpactEventIn, ImpactEventOut, ImpactEventResponse,
    ImpactScoreOut, AttestationOut
)
from ..services.impact_service import (
    create_impact_event,
    recalc_impact_score,
    get_impact_score,
    list_impact_events,
    validate_event_type
)
from ..utils.rate_limit import rate_limit
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/impact", tags=["impact"])


def ensure_user_access(auth_user: User, target_user_id: int):
    """
    Garante que o usuário só acessa seus próprios dados (ou é admin)
    
    Args:
        auth_user: Usuário autenticado
        target_user_id: ID do usuário alvo
    """
    if auth_user.id != target_user_id and not getattr(auth_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode acessar seus próprios dados"
        )


@router.post("/event", response_model=ImpactEventResponse)
@rate_limit(max_requests=10, window_minutes=1)
async def create_event(
    event_in: ImpactEventIn,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cria um novo evento de impacto e recalcula o score
    """
    try:
        # Validar tipo de evento
        if not validate_event_type(event_in.type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de evento inválido: {event_in.type}"
            )
        
        # Criar evento
        event = create_impact_event(db, current_user.id, event_in)
        
        # Recalcular score
        score_obj = recalc_impact_score(db, current_user.id)
        
        # Preparar resposta
        # Converter manualmente de meta (ORM) para metadata (JSON)
        event_data = {
            "id": event.id,
            "user_id": event.user_id,
            "type": event.type,
            "weight": event.weight,
            "metadata": event.meta,  # Converter meta -> metadata
            "timestamp": event.timestamp
        }
        
        return ImpactEventResponse(
            event=ImpactEventOut(**event_data),
            score=ImpactScoreOut.model_validate(score_obj)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao criar evento de impacto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/events/{user_id}", response_model=List[ImpactEventOut])
async def list_events(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Lista eventos de impacto de um usuário (paginação)
    """
    try:
        # Verificar acesso
        ensure_user_access(current_user, user_id)
        
        # Buscar eventos
        events, total = list_impact_events(db, user_id, page, page_size)
        
        # Converter manualmente de meta (ORM) para metadata (JSON)
        events_out = []
        for event in events:
            event_data = {
                "id": event.id,
                "user_id": event.user_id,
                "type": event.type,
                "weight": event.weight,
                "metadata": event.meta,  # Converter meta -> metadata
                "timestamp": event.timestamp
            }
            events_out.append(ImpactEventOut(**event_data))
        
        return events_out
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar eventos de impacto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/score/{user_id}", response_model=ImpactScoreOut)
async def get_score(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém o score de impacto de um usuário
    """
    try:
        # Verificar acesso
        ensure_user_access(current_user, user_id)
        
        # Buscar score
        score_obj = get_impact_score(db, user_id)
        
        return ImpactScoreOut.model_validate(score_obj)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter score de impacto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/attest", response_model=AttestationOut)
@rate_limit(max_requests=10, window_minutes=1)
async def create_attestation_mock(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cria attestation mock (sem blockchain real até o hackathon)
    """
    try:
        # Obter score atual
        score_obj = get_impact_score(db, current_user.id)
        
        # Gerar attestation_id (UUID)
        attestation_id = str(uuid.uuid4())
        
        # Gerar hash (simulação)
        # Hash = SHA256(user_id|score|timestamp)
        hash_data = f"{current_user.id}|{score_obj.score}|{score_obj.updated_at}"
        hash_value = hashlib.sha256(hash_data.encode()).hexdigest()
        
        logger.info(f"impact.attest user_id={current_user.id} attestation_id={attestation_id}")
        
        return AttestationOut(
            attestation_id=attestation_id,
            hash=f"0x{hash_value}",
            stored=True
        )
        
    except Exception as e:
        logger.error(f"Erro ao criar attestation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

