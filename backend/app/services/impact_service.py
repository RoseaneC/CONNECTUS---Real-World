"""
Serviço de Impact Score
Implementa CRUD e lógica de recálculo de scores
"""

import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.impact import ImpactEvent, ImpactScore
from app.schemas.impact import ImpactEventIn, ImpactEventOut

logger = logging.getLogger(__name__)


def load_weights() -> Dict[str, float]:
    """Carrega pesos padrão de impacto"""
    weights_path = Path(__file__).parent.parent / "configs" / "impact_weights.json"
    
    default_weights = {
        "mission_completed": 3.0,
        "community_vote": 2.0,
        "peer_review": 1.0,
        "donation": 2.0
    }
    
    try:
        if weights_path.exists():
            with open(weights_path, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Erro ao carregar impact_weights.json: {e}")
    
    return default_weights


# Cache de pesos
_EVENT_WEIGHTS = load_weights()


def get_event_weight(event_type: str) -> float:
    """Obtém peso padrão para um tipo de evento"""
    return _EVENT_WEIGHTS.get(event_type, 1.0)


def validate_event_type(event_type: str) -> bool:
    """Valida tipo de evento"""
    valid_types = {"mission_completed", "community_vote", "peer_review", "donation"}
    return event_type in valid_types


def create_impact_event(
    db: Session,
    user_id: int,
    event_in: ImpactEventIn
) -> ImpactEvent:
    """
    Cria um novo evento de impacto
    
    Args:
        db: Sessão do banco de dados
        user_id: ID do usuário
        event_in: Dados do evento
        
    Returns:
        ImpactEvent criado
    """
    # Validar tipo de evento
    if not validate_event_type(event_in.type):
        raise ValueError(f"Tipo de evento inválido: {event_in.type}")
    
    # Usar peso fornecido ou padrão
    weight = event_in.weight if event_in.weight is not None else get_event_weight(event_in.type)
    
    # Criar evento
    # Usar 'meta' como atributo (ORM) mas passar 'metadata' do schema
    event = ImpactEvent(
        user_id=user_id,
        type=event_in.type,
        weight=weight,
        meta=event_in.metadata
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    logger.info(f"impact.event user_id={user_id} type={event_in.type} weight={weight}")
    
    return event


def recalc_impact_score(db: Session, user_id: int) -> ImpactScore:
    """
    Recalcula e persiste o score de impacto de um usuário
    
    Args:
        db: Sessão do banco de dados
        user_id: ID do usuário
        
    Returns:
        ImpactScore atualizado
    """
    # Buscar todos os eventos do usuário
    events = db.query(ImpactEvent).filter(ImpactEvent.user_id == user_id).all()
    
    # Calcular breakdown e score total
    breakdown: Dict[str, int] = {}
    total_score = 0.0
    
    for event in events:
        # Contar por tipo
        breakdown[event.type] = breakdown.get(event.type, 0) + 1
        
        # Somar peso total
        total_score += event.weight
    
    # Buscar ou criar score
    score_obj = db.query(ImpactScore).filter(ImpactScore.user_id == user_id).first()
    
    if score_obj is None:
        score_obj = ImpactScore(
            user_id=user_id,
            score=total_score,
            breakdown=breakdown
        )
        db.add(score_obj)
    else:
        score_obj.score = total_score
        score_obj.breakdown = breakdown
        score_obj.updated_at = func.now()
    
    db.commit()
    db.refresh(score_obj)
    
    logger.info(f"impact.recalc user_id={user_id} score={total_score:.2f}")
    
    return score_obj


def get_impact_score(db: Session, user_id: int) -> ImpactScore:
    """
    Obtém o score de impacto de um usuário (calcula se não existe)
    
    Args:
        db: Sessão do banco de dados
        user_id: ID do usuário
        
    Returns:
        ImpactScore
    """
    score_obj = db.query(ImpactScore).filter(ImpactScore.user_id == user_id).first()
    
    if score_obj is None:
        # Se não existe, recalcular do zero
        return recalc_impact_score(db, user_id)
    
    return score_obj


def list_impact_events(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 10
) -> Tuple[List[ImpactEvent], int]:
    """
    Lista eventos de impacto de um usuário (paginação)
    
    Args:
        db: Sessão do banco de dados
        user_id: ID do usuário
        page: Página (1-indexed)
        page_size: Tamanho da página
        
    Returns:
        (lista de eventos, total de eventos)
    """
    # Contar total
    total = db.query(ImpactEvent).filter(ImpactEvent.user_id == user_id).count()
    
    # Buscar com paginação
    offset = (page - 1) * page_size
    events = (
        db.query(ImpactEvent)
        .filter(ImpactEvent.user_id == user_id)
        .order_by(ImpactEvent.timestamp.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
    
    return events, total

