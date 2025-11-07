"""
Configuração global de testes para ConnectUS Impact Score
"""

import os
import tempfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db


@pytest.fixture(scope="session")
def db_file():
    """Cria banco temporário para testes"""
    fd, path = tempfile.mkstemp(prefix="test_connectus_", suffix=".db")
    os.close(fd)
    yield f"sqlite:///{path}"
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


@pytest.fixture(scope="session")
def engine(db_file):
    """Engine de teste"""
    eng = create_engine(db_file, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture(scope="function")
def db_session(engine):
    """Sessão de banco para cada teste"""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    # Garantir tabelas de Impact Score existem
    try:
        from sqlalchemy import text
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS impact_events(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                weight REAL NOT NULL DEFAULT 0,
                metadata TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                CHECK(weight >= 0)
            )
        """))
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS impact_scores(
                user_id INTEGER PRIMARY KEY,
                score REAL NOT NULL DEFAULT 0,
                breakdown TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        session.commit()
    except Exception as e:
        print(f"⚠️  Tabelas já existem ou erro: {e}")
    
    try:
        yield session
        session.close()
    finally:
        # Limpar dados após cada teste
        try:
            session.execute(text("DELETE FROM impact_events"))
            session.execute(text("DELETE FROM impact_scores"))
            session.commit()
        except:
            pass
        session.close()


@pytest.fixture(scope="function")
def app_db_override(monkeypatch, db_session):
    """Override de dependência do DB no app"""
    from sqlalchemy import text as sql_text
    
    def _get_db():
        try:
            yield db_session
            db_session.commit()
        except:
            db_session.rollback()
            raise
    
    app.dependency_overrides[get_db] = _get_db
    yield
    app.dependency_overrides.pop(get_db, None)


# Mock de usuário autenticado
@pytest.fixture(scope="function")
def auth_user_override():
    """Mock de usuário para testes"""
    from app.core.auth import get_current_active_user
    
    class DummyUser:
        def __init__(self):
            self.id = 999
            self.nickname = "testuser"
            self.is_active = True
            self.is_admin = True
            self.email = "test@connectus.local"
    
    def _override():
        return DummyUser()
    
    app.dependency_overrides[get_current_active_user] = _override
    yield
    app.dependency_overrides.pop(get_current_active_user, None)


@pytest.fixture(scope="function")
def client(auth_user_override, app_db_override):
    """Cliente de teste para FastAPI"""
    return TestClient(app)


