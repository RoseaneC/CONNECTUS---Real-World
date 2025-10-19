from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)

def _inject_system_prompt(messages: List[Dict[str, str]], system_prompt: str) -> List[Dict[str, str]]:
    """
    Injeta o system prompt VEXA se não existir
    """
    has_system = any(m.get("role") == "system" for m in messages)
    if has_system:
        return messages
    return [{"role": "system", "content": system_prompt}, *messages]

class OpenAIProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.available = True
        logger.info(f"OpenAIProvider inicializado com chave: {api_key[:10]}...")
    
    async def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float,
        metadata: Dict[str, Any] | None = None,
    ) -> str:
        logger.info(f"OPENAI CHAT - Modelo: {model}")
        logger.info(f"OPENAI CHAT - Mensagens: {messages}")
        logger.info(f"OPENAI CHAT - Temperatura: {temperature}")
        
        if not self.available:
            return "OpenAI não disponível - verifique a instalação"
        
        try:
            from openai import OpenAI
            from backend.core.settings import (
                VEXA_SYSTEM_PROMPT,
                VEXA_TEMPERATURE,
                VEXA_TOP_P,
                VEXA_PRESENCE_PENALTY,
                VEXA_FREQUENCY_PENALTY,
                VEXA_MAX_TOKENS,
            )
            
            client = OpenAI(api_key=self.api_key)
            
            # Injetar system prompt VEXA
            messages_with_system = _inject_system_prompt(messages, VEXA_SYSTEM_PROMPT)
            
            logger.info("OPENAI CHAT - Fazendo chamada para OpenAI com parâmetros VEXA...")
            
            response = client.chat.completions.create(
                model=model,
                messages=messages_with_system,
                temperature=VEXA_TEMPERATURE,
                top_p=VEXA_TOP_P,
                presence_penalty=VEXA_PRESENCE_PENALTY,
                frequency_penalty=VEXA_FREQUENCY_PENALTY,
                max_tokens=VEXA_MAX_TOKENS
            )
            
            reply = response.choices[0].message.content
            logger.info(f"OPENAI CHAT - Resposta VEXA recebida: '{reply}' (tamanho: {len(reply)})")
            
            return reply
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"OPENAI CHAT - Erro: {error_msg}")
            
            if "invalid_api_key" in error_msg.lower() or "authentication" in error_msg.lower():
                logger.error("OpenAI auth error (verifique .env): {str(e)}")
                return "Erro de configuração da API. Verifique as credenciais."
            elif "rate limit" in error_msg.lower() or "quota" in error_msg.lower():
                logger.warning(f"Rate limit detectado: {error_msg}")
                return "Limite de requisições atingido - tente novamente em alguns minutos"
            elif "model" in error_msg.lower():
                logger.error(f"Erro de modelo: {error_msg}")
                return "Erro de modelo - verifique a configuração do modelo"
            else:
                logger.error(f"Erro genérico: {error_msg}")
                return f"Erro na IA: {error_msg}"
