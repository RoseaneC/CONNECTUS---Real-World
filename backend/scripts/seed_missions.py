# [CONNECTUS PATCH] seed de missões demo
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.mission import Mission, MissionType

def upsert_mission(db, name, **kwargs):
    """Cria ou atualiza uma missão"""
    m = db.query(Mission).filter(Mission.title == name).first()
    if not m:
        m = Mission(title=name, **kwargs)
        db.add(m)
    else:
        for k, v in kwargs.items():
            setattr(m, k, v)
    db.commit()
    return m

def main():
    db = SessionLocal()
    try:
        # Missão QR - Ir à escola
        upsert_mission(
            db,
            "Ir à escola",
            description="Escaneie o QR code na entrada da escola para confirmar sua presença",
            category="school",
            type=MissionType.CHECKIN_QR,
            xp_reward=50,
            token_reward=2,
            is_daily=True,
            is_active=True,
            difficulty="easy",
            verification_hint="qr"
        )
        
        # Missão IN_APP_ACTION - Postar na timeline
        upsert_mission(
            db,
            "Poste na timeline",
            description="Crie um post na timeline compartilhando algo sobre seus estudos",
            category="study",
            type=MissionType.IN_APP_ACTION,
            xp_reward=30,
            token_reward=1,
            is_daily=True,
            is_active=True,
            difficulty="easy",
            verification_hint="post_today"
        )
        
        print("✅ OK: missões demo criadas/atualizadas")
        
    except Exception as e:
        print(f"❌ Erro ao criar missões: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
