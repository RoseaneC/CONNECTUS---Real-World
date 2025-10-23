# [CONNECTUS PATCH] mission service
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models.mission import Mission, MissionCompletion, MissionType
from app.models.post import Post  # usado p/ IN_APP_ACTION (postar hoje)

def _today_range():
    start = datetime.combine(date.today(), datetime.min.time())
    end = datetime.combine(date.today(), datetime.max.time())
    return start, end

def has_completed_today(db: Session, user_id: int, mission_id: int) -> bool:
    start, end = _today_range()
    return db.query(MissionCompletion).filter(
        MissionCompletion.user_id==user_id,
        MissionCompletion.mission_id==mission_id,
        MissionCompletion.completed_at>=start,
        MissionCompletion.completed_at<=end
    ).first() is not None

def award(db: Session, user_id: int, mission: Mission, proof_type: str, proof_meta: dict):
    # registrar completion
    mc = MissionCompletion(
        user_id=user_id, mission_id=mission.id,
        proof_type=proof_type, proof_meta=proof_meta,
        xp_awarded=mission.xp_reward, tokens_awarded=int(mission.token_reward)
    )
    db.add(mc)
    db.flush()
    
    # TODO: atualizar ranking/XP/tokens (integração com ranking_service)
    # award_points(db, user_id, mission.xp_reward, mission.token_reward)
    
    db.commit()
    return mc

def can_complete_now(mission: Mission) -> bool:
    # respeitar janela (opcional)
    if mission.window_start and mission.window_end:
        now = datetime.utcnow().time()
        return mission.window_start <= now <= mission.window_end
    return True

def validate_in_app_action(db: Session, user_id: int, mission: Mission) -> bool:
    # exemplo: "Postar na timeline hoje"
    if mission.verification_hint == "post_today":
        start, end = _today_range()
        return db.query(Post).filter(
            Post.user_id==user_id,
            Post.created_at>=start,
            Post.created_at<=end
        ).count() > 0
    return False