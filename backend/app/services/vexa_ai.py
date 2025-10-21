from typing import List, Dict
import httpx
from app.core.config import settings
import logging
from fastapi import HTTPException

log = logging.getLogger("connectus.vexa")

# [CONNECTUS PATCH] fallback automático OpenAI TEST→PROD
def _is_placeholder(k: str | None) -> bool:
    return not k or str(k).startswith("sk-your")

async def _call_openai(payload: dict, api_key: str):
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()

async def vexa_call(payload: dict):
    # Nenhuma chave válida → falhar rápido
    if _is_placeholder(settings.OPENAI_API_KEY_TEST) and _is_placeholder(settings.OPENAI_API_KEY):
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY/OPENAI_API_KEY_TEST ausentes ou placeholder. Configure no backend/.env.")

    last_error = None

    # Tenta TEST primeiro
    if not _is_placeholder(settings.OPENAI_API_KEY_TEST):
        try:
            from app.core.config import _mask_key
            print(f"🧩 VEXA (TEST MODE): usando chave de teste {_mask_key(settings.OPENAI_API_KEY_TEST)}")
            return await _call_openai(payload, settings.OPENAI_API_KEY_TEST)
        except httpx.HTTPStatusError as e:
            last_error = e
            if e.response.status_code == 401:
                print("⚠️  VEXA: chave TEST retornou 401, tentando chave oficial...")
            else:
                print(f"⚠️  VEXA: falha na TEST ({e.response.status_code})")

    # Fallback → PROD
    if not _is_placeholder(settings.OPENAI_API_KEY):
        try:
            from app.core.config import _mask_key
            print(f"🧩 VEXA (PROD MODE): usando chave oficial {_mask_key(settings.OPENAI_API_KEY)}")
            return await _call_openai(payload, settings.OPENAI_API_KEY)
        except httpx.HTTPStatusError as e:
            last_error = e
            if e.response.status_code == 401:
                raise HTTPException(status_code=503, detail="Credenciais OpenAI inválidas (401).")
            print(f"⚠️  VEXA: falha na PROD ({e.response.status_code})")

    print("⚠️ Nenhuma chave válida configurada (nem TEST nem VEXA).")
    print(f"🔎 VEXA: Nenhuma chave válida funcionou. Último erro: {last_error}")
    raise HTTPException(status_code=503, detail="OPENAI indisponível ou credenciais inválidas.")

async def vexa_reply(messages: List[Dict[str, str]]) -> str:
    # Monta payload no formato OpenAI Chat Completions
    msgs = [{"role": "system", "content": settings.VEXA_SYSTEM_PROMPT}] + messages
    
    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": msgs,
        "temperature": 0.7,
    }
    
    try:
        data = await vexa_call(payload)
        return data["choices"][0]["message"]["content"].strip()
    except HTTPException:
        # Re-raise HTTPException (503) para manter comportamento atual
        raise
    except Exception as e:
        log.error("VEXA service error: %s", str(e))
        raise HTTPException(status_code=503, detail="VEXA indisponível no momento.")
