"""
Configurações do Connectus - Versão simplificada
"""
import os
import re
import logging
from typing import Optional

# Configurar logging
logger = logging.getLogger(__name__)

def sanitize_openai_key(key: str) -> str:
    """
    Sanitiza a chave API da OpenAI - apenas trimming e aspas
    """
    if not key:
        return ""
    
    # Remover BOM
    key = key.lstrip('\ufeff')
    
    # Remover espaços em branco
    key = key.strip()
    
    # Remover aspas duplas/simples nas extremidades
    if key.startswith('"') and key.endswith('"'):
        key = key[1:-1]
    if key.startswith("'") and key.endswith("'"):
        key = key[1:-1]
    
    return key

def validate_openai_key(key: str) -> str:
    """
    Valida a chave API da OpenAI após sanitização
    """
    if not key:
        raise ValueError("OPENAI_API_KEY não encontrada")
    
    # Sanitizar primeiro
    sanitized_key = sanitize_openai_key(key)
    
    if not sanitized_key:
        raise ValueError("OPENAI_API_KEY vazia após sanitização")
    
    # Validar formato com regex (não bloquear boot)
    pattern = r"^sk-(live|test|proj)-[A-Za-z0-9_-]{20,}$"
    if not re.match(pattern, sanitized_key):
        logger.warning(f"OPENAI_API_KEY formato suspeito: {sanitized_key[:10]}...")
        # Não bloquear, apenas avisar
    
    return sanitized_key

def get_openai_key() -> Optional[str]:
    """
    Obtém chave API sanitizada
    """
    raw_key = os.getenv("OPENAI_API_KEY")
    
    if not raw_key:
        logger.warning("OPENAI_API_KEY não encontrada no .env")
        return None
    
    try:
        # Sanitizar e validar
        validated_key = validate_openai_key(raw_key)
        logger.info(f"OPENAI key prefix: {validated_key[:10]}... (sanitized)")
        return validated_key
        
    except Exception as e:
        logger.error(f"Erro na validação da chave API: {e}")
        return None

class Settings:
    def __init__(self):
        # Carregar .env
        from dotenv import load_dotenv
        load_dotenv(override=True)
        
        # Configurações básicas
        self.AUTH_BYPASS = os.getenv("AUTH_BYPASS", "false").lower() in ("1", "true", "yes", "on")
        
        # Configurações da OpenAI
        self.AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")
        self.OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.35"))
        self.AI_MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "900"))
        self.AI_STREAM = os.getenv("AI_STREAM", "true").lower() in ("1", "true", "yes", "on")
        
        # Sanitizar e validar chave API
        self.OPENAI_API_KEY = get_openai_key()
        
        # Configurações do banco
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./connectus.db")
        
        # Configurações CORS
        self.CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        
        # Status da validação
        self.OPENAI_OK = bool(self.OPENAI_API_KEY)
        
        # Log de startup
        if self.OPENAI_API_KEY:
            logger.info(f"OPENAI key prefix: {self.OPENAI_API_KEY[:10]}... (sanitized)")
        else:
            logger.warning("OPENAI key não encontrada ou inválida")

# Instância global
settings = Settings()