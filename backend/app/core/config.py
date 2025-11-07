"""
Configurações da aplicação Connectus
"""

# [CONNECTUS DOC] Sistema de chaves OpenAI – VEXA IA
#
# A VEXA opera com duas chaves configuráveis:
# - OPENAI_API_KEY_TEST → ambiente de teste e fallback inicial
# - OPENAI_API_KEY → chave principal de produção (VEXA)
#
# A prioridade é:
# 1️⃣ Usar OPENAI_API_KEY_TEST se válida
# 2️⃣ Se falhar (401 ou indisponível), usar OPENAI_API_KEY
# 3️⃣ Se ambas forem inválidas → retorna HTTP 503 (sem quebrar backend)
#
# Logs no startup mostram ambas mascaradas e indicam qual está ativa.
#
# Definições no .env:
#   OPENAI_API_KEY_TEST=sk-xxxx
#   OPENAI_API_KEY=sk-xxxx
#   OPENAI_MODEL=gpt-4o-mini
#   AI_PROVIDER=openai

# [CONNECTUS PATCH] garantir leitura de .env com Pydantic v2
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Configurações da aplicação
    APP_NAME: str = "Connectus"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Configurações do banco de dados
    DATABASE_URL: str = "sqlite:///app/connectus.db"
    
    # Configurações JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configurações CORS
    # NOTE: CORS is configured in main.py using CORS_ALLOWED_ORIGINS env var
    # Removed ALLOWED_ORIGINS from Settings to avoid Pydantic JSON parsing conflicts
    
    # Configurações futuras para Web3 (removido Stellar SDK)
    ENABLE_WEB3: bool = False
    
    # Configurações OpenAI (opcional)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_API_KEY_TEST: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"  # mantenha leve
    VEXA_SYSTEM_PROMPT: str = "Você é a VEXA IA, assistente educacional da ConnectUS: clara, gentil e objetiva."
    
    # Pydantic v2: carregar backend/.env automaticamente
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

# [CONNECTUS PATCH] utils de diagnóstico
import os
from pathlib import Path

def _mask_key(k: str | None) -> str:
    if not k:
        return "None"
    if k.startswith("sk-"):
        return k[:7] + "..."
    return k[:4] + "..."

def _key_source() -> str:
    # Prioridade do Pydantic: ENV > .env
    if os.getenv("OPENAI_API_KEY_TEST") or os.getenv("OPENAI_API_KEY"):
        return "ENV"
    # Verificar se existe .env no diretório atual (backend)
    env_path = Path(".env")
    if env_path.exists():
        return ".env"
    return "unset"

settings = Settings()