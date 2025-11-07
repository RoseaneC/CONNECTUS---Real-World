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
from pydantic_settings import BaseSettings, SettingsConfigDict, EnvSettingsSource
from pydantic import field_validator, Field, model_validator
from typing import Optional, Any
import os

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
    # ALLOWED_ORIGINS is kept as optional string to avoid Pydantic JSON parsing errors
    # if the env var exists but is empty or invalid
    ALLOWED_ORIGINS: Optional[str] = Field(
        default=None,
        description="Allowed origins for CORS (not used, CORS_ALLOWED_ORIGINS is used instead)"
    )
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def validate_allowed_origins(cls, v):
        # Tratar strings vazias como None para evitar erros de parse JSON
        # O Pydantic Settings pode tentar fazer parse JSON antes deste validador,
        # mas este validador será chamado se o parse JSON falhar
        if v == "" or v is None:
            return None
        # Se for uma string, retornar como está (não tentar parse JSON)
        if isinstance(v, str):
            return v
        # Se for qualquer outro tipo (ex: resultado de parse JSON falho), retornar None
        return None
    
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
        env_ignore_empty=True,  # Ignorar variáveis de ambiente vazias
    )
    
    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        # Customizar fonte de ambiente para tratar ALLOWED_ORIGINS vazio antes do parse JSON
        class CustomEnvSettingsSource(EnvSettingsSource):
            def prepare_field_value(
                self, field_name: str, field, field_value: Any, value_is_complex: bool
            ) -> Any:
                # Interceptar ALLOWED_ORIGINS antes do parse JSON
                if field_name == "ALLOWED_ORIGINS" and field_value == "":
                    return None
                # Para outros campos, usar o comportamento padrão
                try:
                    return super().prepare_field_value(field_name, field, field_value, value_is_complex)
                except Exception:
                    # Se o parse JSON falhar para ALLOWED_ORIGINS, retornar None
                    if field_name == "ALLOWED_ORIGINS":
                        return None
                    raise
        
        return (
            init_settings,
            CustomEnvSettingsSource(settings_cls),
            dotenv_settings,
            file_secret_settings,
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