"""
Rate limiting simples para endpoints
"""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Callable
from fastapi import Request, HTTPException, status
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Armazenamento em memória (limpa em produção seria necessário Redis)
_rate_limiter: dict[str, list[datetime]] = defaultdict(list)


def rate_limit(max_requests: int = 10, window_minutes: int = 1):
    """
    Decorator para rate limiting simples
    
    Args:
        max_requests: Número máximo de requisições
        window_minutes: Janela de tempo em minutos
        
    Returns:
        Decorator
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Obter IP do cliente
            client_ip = request.client.host if request.client else "unknown"
            
            # Limpar requisições antigas
            now = datetime.utcnow()
            window_start = now - timedelta(minutes=window_minutes)
            
            # Limpar requisições fora da janela
            _rate_limiter[client_ip] = [
                timestamp
                for timestamp in _rate_limiter[client_ip]
                if timestamp > window_start
            ]
            
            # Verificar limite
            if len(_rate_limiter[client_ip]) >= max_requests:
                logger.warning(f"Rate limit atingido para IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit atingido. Máximo {max_requests} requisições por {window_minutes} minuto(s)"
                )
            
            # Adicionar nova requisição
            _rate_limiter[client_ip].append(now)
            
            # Executar função
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator


