"""
Configurações da aplicação Connectus
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Configurações da aplicação
    APP_NAME: str = "Connectus"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Configurações do banco de dados
    DATABASE_URL: str = "sqlite:///./connectus.db"
    
    # Configurações JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configurações CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]
    
    # Configurações futuras para Web3 (removido Stellar SDK)
    ENABLE_WEB3: bool = False
    
    # Configurações OpenAI (opcional)
    OPENAI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignorar variáveis extras do .env

settings = Settings()