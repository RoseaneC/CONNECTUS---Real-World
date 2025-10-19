# backend/routers/ai_working.py
from fastapi import APIRouter, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging
import os

# Configurar logging
logger = logging.getLogger(__name__)

# Importar configurações e provedor
from backend.core.settings import get_openai_key
from backend.ai.providers.openai_provider import OpenAIProvider

class ChatRequest(BaseModel):
    message: str = ""
    
    class Config:
        extra = "allow"

def normalize_to_openai(payload: Dict[str, Any]) -> Dict[str, Any]:
    # já no formato OpenAI?
    if "messages" in payload and isinstance(payload["messages"], list):
        return {
            "model": payload.get("model", os.getenv("OPENAI_MODEL", "gpt-4o-mini")),
            "messages": payload["messages"],
            "temperature": float(payload.get("temperature", 0.7)),
            "metadata": payload.get("metadata") or {},
        }
    # formato simples do front
    simple = payload.get("message") or payload.get("text") or payload.get("prompt") \
             or payload.get("query") or payload.get("content") or ""
    if not isinstance(simple, str):
        simple = str(simple)
    msgs: List[Dict[str, str]] = [{"role": "user", "content": simple}]
    return {
        "model": payload.get("model", os.getenv("OPENAI_MODEL", "gpt-4o-mini")),
        "messages": msgs,
        "temperature": float(payload.get("temperature", 0.7)),
        "metadata": payload.get("meta") or payload.get("metadata") or {},
    }

# Router funcional para IA
router = APIRouter(tags=["ai"])

@router.get("/provider")
async def provider_status():
    return {
        "provider": "OpenAIProvider",
        "selected": "openai",
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "dotenv_loaded": True,
        "using_openai": True,
    }

@router.get("/config")
async def ai_config():
    """Rota de diagnóstico para desenvolvimento"""
    api_key = get_openai_key()
    return {
        "provider": "OpenAIProvider",
        "keyPrefix": api_key[:8] + "..." if api_key else "N/A",
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "openai_ok": bool(api_key)
    }

@router.post("/chat-public")
async def chat_public(payload: Dict[str, Any] = Body(...)):
    logger.info(f"CHAT PUBLIC - Payload recebido: {payload}")
    req = normalize_to_openai(payload)
    logger.info(f"CHAT PUBLIC - Payload normalizado: {req}")
    
    try:
        # Obter chave API sanitizada
        api_key = get_openai_key()
        if not api_key:
            return {
                "ok": False,
                "reply": "Erro de configuração da API. Verifique as credenciais.",
                "provider": "OpenAIProvider"
            }
        
        # Usar provedor OpenAI
        provider = OpenAIProvider(api_key)
        reply = await provider.chat(
            model=req["model"],
            messages=req["messages"],
            temperature=req["temperature"],
            metadata=req["metadata"]
        )
        
        logger.info(f"CHAT PUBLIC - Resposta: '{reply}' (tamanho: {len(reply)})")
        
        result = {
            "ok": True, 
            "reply": reply, 
            "provider": "OpenAIProvider"
        }
        logger.info(f"CHAT PUBLIC - Resultado final: {result}")
        return result
        
    except Exception as e:
        logger.error(f"CHAT PUBLIC - Erro geral: {e}")
        return {
            "ok": False, 
            "reply": "Erro de configuração da API. Verifique as credenciais.",
            "provider": "OpenAIProvider"
        }

@router.post("/chat")
async def chat(payload: Dict[str, Any] = Body(...)):
    logger.info(f"CHAT - Payload recebido: {payload}")
    req = normalize_to_openai(payload)
    logger.info(f"CHAT - Payload normalizado: {req}")
    
    try:
        # Obter chave API sanitizada
        api_key = get_openai_key()
        if not api_key:
            return {
                "ok": False,
                "reply": "Erro de configuração da API. Verifique as credenciais.",
                "provider": "OpenAIProvider"
            }
        
        # Usar provedor OpenAI
        provider = OpenAIProvider(api_key)
        reply = await provider.chat(
            model=req["model"],
            messages=req["messages"],
            temperature=req["temperature"],
            metadata=req["metadata"]
        )
        
        logger.info(f"CHAT - Resposta: '{reply}' (tamanho: {len(reply)})")
        
        result = {
            "ok": True, 
            "reply": reply, 
            "provider": "OpenAIProvider"
        }
        logger.info(f"CHAT - Resultado final: {result}")
        return result
        
    except Exception as e:
        logger.error(f"CHAT - Erro geral: {e}")
        return {
            "ok": False, 
            "reply": "Erro de configuração da API. Verifique as credenciais.",
            "provider": "OpenAIProvider"
        }

@router.get("/stats")
async def ai_stats():
    """Estatísticas de IA"""
    return {
        "ok": True,
        "provider": "OpenAIProvider",
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "usage": {
            "messages": 0,
            "tokens": 0,
            "period": "auto"
        },
        "total_conversations": 0,
        "conversations_by_category": {},
        "total_favorites": 0,
        "recent_conversations": 0
    }
