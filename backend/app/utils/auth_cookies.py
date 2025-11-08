"""
Utilitário para gerenciar cookies de autenticação com configuração condicional por ambiente
"""
import os
from fastapi.responses import JSONResponse


def _is_prod() -> bool:
    """Verifica se está em ambiente de produção"""
    return os.getenv("ENVIRONMENT", "development").lower() == "production"


def set_auth_cookie(resp: JSONResponse, token: str):
    """
    Define cookie de autenticação com configuração apropriada para o ambiente
    
    Produção (HTTPS): SameSite=None; Secure=True
    Desenvolvimento (HTTP): SameSite=Lax; Secure=False
    """
    kwargs = dict(key="connectus_access_token", value=token, httponly=True, path="/")
    
    if _is_prod():
        kwargs.update(secure=True, samesite="none")   # HTTPS cross-site
    else:
        kwargs.update(secure=False, samesite="lax")   # HTTP local
    
    resp.set_cookie(**kwargs)


def clear_auth_cookie(resp: JSONResponse):
    """
    Remove cookie de autenticação com configuração apropriada para o ambiente
    """
    kwargs = dict(key="connectus_access_token", path="/")
    
    if _is_prod():
        kwargs.update(secure=True, samesite="none")
    else:
        kwargs.update(secure=False, samesite="lax")
    
    resp.delete_cookie(**kwargs)

