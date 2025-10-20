from typing import List, Dict
import httpx
from app.core.config import settings
import logging

log = logging.getLogger("connectus.vexa")

async def vexa_reply(messages: List[Dict[str, str]]) -> str:
    if not settings.OPENAI_API_KEY:
        return "VEXA está temporariamente indisponível (sem chave de IA configurada)."

    # Monta payload no formato OpenAI Chat Completions
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
    # Garante que sempre há um system prompt
    msgs = [{"role": "system", "content": settings.VEXA_SYSTEM_PROMPT}] + messages

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(url, headers=headers, json={
                "model": settings.OPENAI_MODEL,
                "messages": msgs,
                "temperature": 0.7,
            })
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as e:
        # Log do erro da OpenAI sem vazar a chave
        log.error("OpenAI API error: status=%s, body=%s", e.response.status_code, e.response.text)
        raise Exception(f"OpenAI API error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        log.error("VEXA service error: %s", str(e))
        raise
