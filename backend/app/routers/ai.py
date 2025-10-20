from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from app.core.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.services.vexa_ai import vexa_reply
import logging

log = logging.getLogger("connectus.ai")

router = APIRouter(prefix="/ai", tags=["ai"])

class AIHistoryItem(BaseModel):
    id: str
    role: str
    content: str
    created_at: str

class AIFavoritesItem(BaseModel):
    id: str
    title: str
    created_at: str

class AIStats(BaseModel):
    total_messages: int = 0
    conversations: int = 0
    favorites: int = 0

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPublicIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[ChatMessage] | None = None

class ChatPublicOut(BaseModel):
    reply: str

@router.get("/health")
async def ai_health():
    from app.core.config import settings
    has_key = bool(settings.OPENAI_API_KEY)
    return {"ok": has_key, "model": settings.OPENAI_MODEL if has_key else None}

@router.get("/history", response_model=List[AIHistoryItem])
def get_history(limit: int = 50, user: Optional[User] = Depends(get_current_user_optional)):
    """Obtém histórico de conversas com IA (tolerante a anônimos)"""
    # Stub inicial: retorna lista vazia (compatível com front)
    return []

@router.get("/favorites", response_model=List[AIFavoritesItem])
def get_favorites(user: Optional[User] = Depends(get_current_user_optional)):
    """Obtém conversas favoritas com IA (tolerante a anônimos)"""
    return []

@router.get("/stats", response_model=AIStats)
def get_stats(user: Optional[User] = Depends(get_current_user_optional)):
    """Obtém estatísticas de uso da IA (tolerante a anônimos)"""
    return AIStats()

@router.post("/chat-public", response_model=ChatPublicOut)
async def chat_public(payload: ChatPublicIn, user: User = Depends(get_current_user)):
    """Chat público com IA (exige autenticação)"""
    # Validação de entrada
    if not payload.message:
        raise HTTPException(status_code=400, detail="message obrigatório")
    
    # Log controlado (sem PII)
    log.info("chat-public: user=%s len_hist=%s len_msg=%s",
             getattr(user, "id", None), len(payload.history or []), len(payload.message))
    
    # Monta histórico leve (apenas últimas 6 mensagens usuário/assistente)
    hist: List[Dict[str, str]] = []
    if payload.history:
        for m in payload.history[-6:]:
            if m.role in ("user", "assistant") and m.content:
                hist.append({"role": m.role, "content": m.content})

    # Adiciona a mensagem atual do usuário
    hist.append({"role": "user", "content": payload.message})

    try:
        text = await vexa_reply(hist)
        log.info("chat-public: status=200 user=%s", getattr(user, "id", None))
        return ChatPublicOut(reply=text)
    except Exception as e:
        # Verificar se é erro 401 da OpenAI
        error_msg = str(e)
        if "401" in error_msg and "OpenAI API error" in error_msg:
            log.error("chat-public: status=503 user=%s error=OpenAI 401", getattr(user, "id", None))
            raise HTTPException(status_code=503, detail="VEXA indisponível: verifique sua OPENAI_API_KEY e o acesso ao modelo.") from e
        else:
            # Fallback controlado para outros erros
            log.error("chat-public: status=503 user=%s error=%s", getattr(user, "id", None), str(e))
            raise HTTPException(status_code=503, detail="VEXA indisponível no momento.") from e
