"""
Router para Missões em Tempo Real
Endpoints REST para registro de eventos e consulta de tentativas
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Any, List, Optional
from sqlalchemy import text
import json, hashlib
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.services.mission_engine import MissionEngine

router = APIRouter(prefix="/missions", tags=["missões-tempo-real"])

@router.get("/health")
async def health_check(db = Depends(get_db)):
    """
    Verifica saúde do sistema de missões em tempo real.
    """
    try:
        # Verificar feature flag
        feature_flag = db.execute(
            text("SELECT flag_value FROM feature_flags WHERE flag_name = 'MISSIONS_REALTIME_ENABLED'")
        ).fetchone()
        
        is_enabled = feature_flag and feature_flag[0]
        
        # Contar regras ativas
        active_rules_count = db.execute(
            text("SELECT COUNT(*) FROM mission_rules WHERE is_active = 1")
        ).scalar()
        
        # Contar eventos recentes (última hora)
        recent_events_count = db.execute(text("""
            SELECT COUNT(*) FROM mission_events 
            WHERE created_at >= datetime('now', '-1 hour')
        """)).scalar()
        
        return {
            "ok": True,
            "status": "healthy" if is_enabled else "disabled",
            "enabled": bool(is_enabled),
            "active_rules": active_rules_count,
            "recent_events": recent_events_count,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Erro no health check: {e}")
        return {
            "ok": False,
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

class MissionEventIn(BaseModel):
    mission_slug: str = Field(..., description="Slug da missão")
    event_type: str = Field(..., description="Tipo do evento")
    payload: dict = Field(..., description="Dados do evento")

@router.post("/event")
async def register_mission_event(
    event_data: MissionEventIn,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Registra um evento de missão e avalia automaticamente.
    """
    try:
        # Verificar se o módulo está habilitado
        feature_flag = db.execute(
            text("SELECT flag_value FROM feature_flags WHERE flag_name = 'MISSIONS_REALTIME_ENABLED'")
        ).fetchone()
        
        if not feature_flag or not feature_flag[0]:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Sistema de missões em tempo real desabilitado"
            )
        
        # Gerar hash do payload
        payload_json = json.dumps(event_data.payload, sort_keys=True)
        payload_hash = hashlib.sha256(payload_json.encode()).hexdigest()
        
        # Criar evento
        result = db.execute(text("""
            INSERT INTO mission_events (user_id, mission_slug, event_type, payload, payload_hash, created_at)
            VALUES (:user_id, :mission_slug, :event_type, :payload, :payload_hash, :created_at)
        """), {
            "user_id": current_user.id,
            "mission_slug": event_data.mission_slug,
            "event_type": event_data.event_type,
            "payload": payload_json,
            "payload_hash": payload_hash,
            "created_at": datetime.utcnow()
        })
        
        event_id = result.lastrowid
        
        # Avaliar evento com MissionEngine
        engine = MissionEngine(db.connection(), current_user.id)
        evaluation_result = engine.evaluate(
            mission_slug=event_data.mission_slug,
            triggering_event={
                "event_type": event_data.event_type,
                "payload": event_data.payload
            }
        )
        
        # Criar tentativa
        result = db.execute(text("""
            INSERT INTO mission_attempts (user_id, mission_slug, event_id, status, score, evidence_hash, reason, evaluated_at)
            VALUES (:user_id, :mission_slug, :event_id, :status, :score, :evidence_hash, :reason, :evaluated_at)
        """), {
            "user_id": current_user.id,
            "mission_slug": event_data.mission_slug,
            "event_id": event_id,
            "status": evaluation_result["status"],
            "score": evaluation_result["score"],
            "evidence_hash": evaluation_result["evidence_hash"],
            "reason": evaluation_result["reason"],
            "evaluated_at": datetime.utcnow()
        })
        
        attempt_id = result.lastrowid
        
        # Criar evidência se aprovada
        if evaluation_result["status"] == "approved":
            evidence_data = {
                "event_id": event_id,
                "attempt_id": attempt_id,
                "evaluation_result": evaluation_result,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            evidence_json = json.dumps(evidence_data, sort_keys=True)
            evidence_hash = hashlib.sha256(evidence_json.encode()).hexdigest()
            
            db.execute(text("""
                INSERT INTO mission_evidences (attempt_id, evidence_type, evidence_data, evidence_hash, created_at)
                VALUES (:attempt_id, :evidence_type, :evidence_data, :evidence_hash, :created_at)
            """), {
                "attempt_id": attempt_id,
                "evidence_type": event_data.event_type,
                "evidence_data": evidence_json,
                "evidence_hash": evidence_hash,
                "created_at": datetime.utcnow()
            })
        
        db.commit()
        
        return {
            "ok": True,
            "event_id": event_id,
            "attempt_id": attempt_id,
            "result": evaluation_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao registrar evento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao processar evento"
        )

@router.get("/attempts")
async def get_mission_attempts(
    status_filter: Optional[str] = Query(None, description="Filtrar por status: pending, approved, rejected"),
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Retorna tentativas de missão do usuário atual.
    """
    try:
        # Query base
        query = """
            SELECT id, mission_slug, status, score, reason, evaluated_at, evidence_hash, event_id
            FROM mission_attempts 
            WHERE user_id = :user_id
        """
        params = {"user_id": current_user.id}
        
        # Aplicar filtro de status se especificado
        if status_filter:
            query += " AND status = :status"
            params["status"] = status_filter
        
        # Aplicar paginação
        query += " ORDER BY evaluated_at DESC LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset
        
        attempts = db.execute(text(query), params).fetchall()
        
        # Contar total para paginação
        count_query = "SELECT COUNT(*) FROM mission_attempts WHERE user_id = :user_id"
        count_params = {"user_id": current_user.id}
        if status_filter:
            count_query += " AND status = :status"
            count_params["status"] = status_filter
        
        total_count = db.execute(text(count_query), count_params).scalar()
        
        # Formatar resposta
        attempts_data = []
        for attempt in attempts:
            attempt_data = {
                "id": attempt[0],
                "mission_slug": attempt[1],
                "status": attempt[2],
                "score": attempt[3],
                "reason": attempt[4],
                "evaluated_at": attempt[5].isoformat() if attempt[5] else None,
                "evidence_hash": attempt[6],
                "event_id": attempt[7]
            }
            attempts_data.append(attempt_data)
        
        return {
            "ok": True,
            "attempts": attempts_data,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total_count
            }
        }
        
    except Exception as e:
        print(f"❌ Erro ao buscar tentativas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao buscar tentativas"
        )

@router.get("/stats")
async def get_mission_stats(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Retorna estatísticas de missões do usuário.
    """
    try:
        # Estatísticas básicas
        stats_query = text("""
            SELECT 
                COUNT(*) as total_attempts,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_attempts,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_attempts,
                SUM(CASE WHEN status = 'approved' THEN score ELSE 0 END) as total_score
            FROM mission_attempts 
            WHERE user_id = :user_id
        """)
        
        result = db.execute(stats_query, {"user_id": current_user.id}).fetchone()
        
        total_attempts = result[0] or 0
        approved_attempts = result[1] or 0
        rejected_attempts = result[2] or 0
        total_score = result[3] or 0
        
        success_rate = (approved_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        stats = {
            "total_attempts": total_attempts,
            "approved_attempts": approved_attempts,
            "rejected_attempts": rejected_attempts,
            "total_score": total_score,
            "success_rate": round(success_rate, 2)
        }
        
        return {
            "ok": True,
            "stats": stats
        }
        
    except Exception as e:
        print(f"❌ Erro ao buscar estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao buscar estatísticas"
        )

@router.get("/rules")
async def get_mission_rules(
    active_only: bool = Query(True, description="Retornar apenas regras ativas"),
    db = Depends(get_db)
):
    """
    Retorna regras de missão disponíveis.
    """
    try:
        query = "SELECT mission_slug, rule_name, rule_config, is_active, created_at, updated_at FROM mission_rules"
        params = {}
        
        if active_only:
            query += " WHERE is_active = 1"
        
        rules = db.execute(text(query), params).fetchall()
        
        rules_data = []
        for rule in rules:
            rule_data = {
                "mission_slug": rule[0],
                "rule_name": rule[1],
                "is_active": bool(rule[3]),
                "created_at": rule[4].isoformat() if rule[4] else None,
                "updated_at": rule[5].isoformat() if rule[5] else None
            }
            
            # Adicionar configuração se solicitado
            try:
                rule_data["config"] = json.loads(rule[2])
            except:
                rule_data["config"] = {}
            
            rules_data.append(rule_data)
        
        return {
            "ok": True,
            "rules": rules_data
        }
        
    except Exception as e:
        print(f"❌ Erro ao buscar regras: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao buscar regras"
        )

# Rota health movida para o início para evitar conflito com /{mission_id}