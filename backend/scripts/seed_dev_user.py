# [CONNECTUS PATCH] scripts/seed_dev_user.py
from app.core.config import settings  # mantém leitura do .env
from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.mission import UserMission  # Import necessário para resolver relacionamentos
from app.models.post import Post, PostLike, PostComment  # Import necessário para resolver relacionamentos
from app.models.chat import ChatMessage  # Import necessário para resolver relacionamentos
from app.models.ranking import UserRanking  # Import necessário para resolver relacionamentos
from app.core.auth import get_password_hash

def ensure_tables():
    Base.metadata.create_all(bind=engine)

def seed_dev_user():
    ensure_tables()
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(nickname="roseane").first()
        if user:
            print("ℹ️ Usuário 'roseane' já existe. Nada a fazer.")
            return
        u = User(
            nickname="roseane",
            email="roseane@example.com",
            password_hash=get_password_hash("123456"),
            is_active=True,
        )
        db.add(u)
        db.commit()
        print("✅ Usuário 'roseane' criado com sucesso!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_dev_user()
