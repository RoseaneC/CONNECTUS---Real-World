# 🔍 RELATÓRIO DE INVESTIGAÇÃO - ERROS DE LOGIN JWT
## Análise de "Sessão Expirada", "Usuário Não Encontrado" e "Senha Incorreta"

**Data:** Janeiro de 2025  
**Status:** ⚠️ **PROBLEMAS CRÍTICOS IDENTIFICADOS**

---

## 📋 SUMÁRIO EXECUTIVO

Investigação revela **4 problemas críticos** que podem causar os erros reportados:

1. ❌ **CRÍTICO:** Token JWT não valida expiração explicitamente
2. ❌ **CRÍTICO:** SECRET_KEY padrão inseguro e pode ser diferente entre ambientes
3. ⚠️ **ALTO:** Uso de `datetime.utcnow()` pode causar problemas de timezone
4. ⚠️ **MÉDIO:** Erros genéricos não diferenciam causas específicas

---

## 🔐 1. VALIDAÇÃO DO TOKEN JWT

### 1.1. Função de Verificação Atual

**Código:** `backend/app/core/auth.py:57-63`

```57:63:backend/app/core/auth.py
def verify_token(token: str) -> Optional[dict]:
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**Análise:**
- ✅ Usa `jose.jwt.decode()` que valida expiração automaticamente
- ✅ Retorna `None` se token inválido ou expirado
- ⚠️ **PROBLEMA:** Não diferencia entre tipos de erro (expirado vs inválido)
- ⚠️ **PROBLEMA:** Não loga qual erro específico ocorreu

### 1.2. Uso da Verificação

**Código:** `backend/app/core/auth.py:135-145`

```135:145:backend/app/core/auth.py
    try:
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
```

**Problema Identificado:**
- ❌ Se `verify_token()` retorna `None`, sempre levanta "Not authenticated"
- ❌ Não diferencia entre:
  - Token expirado
  - Token inválido
  - Token com formato errado
  - SECRET_KEY incorreto

**Impacto:**
- ⚠️ Usuário vê "Sessão expirada" mesmo se token for inválido por outra razão
- ⚠️ Dificulta debug

### 1.3. Validação de Expiração

**Como Funciona:**
- `jwt.decode()` valida automaticamente o campo `exp`
- Se `exp < now()`, levanta `ExpiredSignatureError`
- Mas código atual captura todos os `JWTError` como genérico

**Problema:**
- ❌ Não trata `ExpiredSignatureError` especificamente
- ❌ Não loga qual tipo de erro JWT ocorreu

---

## 🔑 2. DIFERENÇA ENTRE ACCESS TOKEN E REFRESH TOKEN

### 2.1. Criação dos Tokens

**Access Token:**
```33:43:backend/app/core/auth.py
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT de acesso"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

**Refresh Token:**
```45:55:backend/app/core/auth.py
def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT de refresh"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)  # Refresh token válido por 7 dias
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

**Diferenças:**
- ✅ Access token: expira em 30 minutos (padrão)
- ✅ Refresh token: expira em 7 dias
- ✅ Ambos têm campo `type` para diferenciação
- ✅ Ambos usam mesma `SECRET_KEY`

**Análise:**
- ✅ Diferenças estão corretas
- ✅ Validação de `type` no refresh funciona

### 2.2. Validação do Refresh Token

**Código:** `backend/app/routers/auth.py:162-167`

```162:167:backend/app/routers/auth.py
    # Verificar refresh token
    payload = verify_token(refresh_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido"
        )
```

**Análise:**
- ✅ Valida se token existe
- ✅ Valida se `type == "refresh"`
- ⚠️ Não diferencia se token expirou ou é inválido

---

## ⏰ 3. HORÁRIO DO SERVIDOR E EXPIRAÇÃO IMEDIATA

### 3.1. Uso de datetime.utcnow()

**Código:**
```python
# backend/app/core/auth.py:37
expire = datetime.utcnow() + expires_delta
```

**Problema Potencial:**
- ⚠️ `datetime.utcnow()` está **deprecated** no Python 3.12+
- ⚠️ Pode haver diferença de timezone entre servidor e cliente
- ⚠️ Se servidor estiver com horário errado, token pode expirar imediatamente

**Exemplo de Problema:**
```python
# Servidor: 2025-01-27 10:00:00 UTC
# Cria token com exp: 2025-01-27 10:30:00 UTC

# Cliente: 2025-01-27 10:31:00 UTC (1 minuto à frente)
# Token já está expirado quando recebido!
```

### 3.2. Validação de Expiração

**Como `jwt.decode()` Valida:**
- Compara `exp` (timestamp UTC) com horário atual do servidor
- Se servidor estiver com horário errado, validação falha

**Problema:**
- ❌ Se servidor estiver atrasado, token pode expirar antes do esperado
- ❌ Se servidor estiver adiantado, token pode ser rejeitado imediatamente

### 3.3. Logs Esperados (Se Horário Estiver Errado)

**Não há logs específicos**, mas comportamento seria:
- Token criado com `exp` no futuro
- Mas servidor valida com horário diferente
- Token é rejeitado como expirado

---

## 🔑 4. SECRET_KEY ENTRE LOCAL E HOSPEDADO

### 4.1. Configuração Atual

**Código:** `backend/app/core/config.py:40`

```40:40:backend/app/core/config.py
    SECRET_KEY: str = "your-secret-key-change-in-production"
```

**Problema Crítico:**
- ❌ **SECRET_KEY padrão é inseguro**
- ❌ Se não configurada no Railway, usa valor padrão
- ❌ Se diferente entre local e hospedado, tokens não funcionam

### 4.2. Como Funciona

**Local (.env):**
```bash
SECRET_KEY=minha-chave-local
```

**Hospedado (Railway):**
```bash
# Se não configurada:
SECRET_KEY=your-secret-key-change-in-production  # Padrão

# Se configurada (conforme env.example):
JWT_SECRET_KEY=minha-chave-producao  # ⚠️ Nome diferente!
```

**Problema Identificado:**
- ⚠️ Código lê `SECRET_KEY` de `settings.SECRET_KEY`
- ⚠️ Mas `env.example` menciona `JWT_SECRET_KEY` (linha 19)
- ⚠️ **CRÍTICO:** Se Railway usar `JWT_SECRET_KEY`, código não lê!
- ⚠️ **CRÍTICO:** Tokens criados com uma chave não podem ser validados com outra

### 4.3. Verificação no Código

**Código:** `backend/app/core/config.py:77-82`

```77:82:backend/app/core/config.py
    # Pydantic v2: carregar backend/.env automaticamente
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        env_ignore_empty=True,  # Ignorar variáveis de ambiente vazias
    )
```

**Análise:**
- ✅ Lê de `.env` ou variáveis de ambiente
- ⚠️ Mas campo é `SECRET_KEY`, não `JWT_SECRET_KEY`
- ⚠️ Se Railway usar `JWT_SECRET_KEY`, não será lido!

### 4.4. Impacto de SECRET_KEY Diferente

**Cenário:**
1. Token criado no local com `SECRET_KEY=chave-local`
2. Token enviado para hospedado com `SECRET_KEY=chave-producao`
3. Hospedado tenta validar com `chave-producao`
4. **Falha:** Token inválido (assinatura não confere)

**Erro:**
- `JWTError` (assinatura inválida)
- Retorna `None` em `verify_token()`
- Levanta "Not authenticated"

---

## 📊 5. RESPOSTAS DO BACKEND

### 5.1. Resposta de Login Bem-Sucedido

**Status:** `200 OK`

**Body:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Headers:**
```
Set-Cookie: connectus_access_token=eyJ...; Path=/; Secure; SameSite=None; HttpOnly
```

### 5.2. Resposta de Erro 401 - Credenciais Inválidas

**Status:** `401 Unauthorized`

**Body:**
```json
{
  "detail": "Credenciais inválidas"
}
```

**Quando Ocorre:**
- Usuário não encontrado
- Senha incorreta
- Usuário inativo

**Problema:**
- ❌ Mensagem genérica não diferencia causas
- ❌ Frontend mostra "Usuário ou senha inválidos" para todos os casos

### 5.3. Resposta de Erro 401 - Not Authenticated

**Status:** `401 Unauthorized`

**Body:**
```json
{
  "detail": "Not authenticated"
}
```

**Quando Ocorre:**
- Token não fornecido
- Token inválido
- Token expirado
- SECRET_KEY incorreto

**Problema:**
- ❌ Mensagem genérica não diferencia causas
- ❌ Frontend mostra "Sessão expirada" para todos os casos

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. ❌ CRÍTICO: SECRET_KEY Pode Ser Diferente

**Localização:** `backend/app/core/config.py:40` e Railway Variables

**Problema:**
```python
# Código lê:
SECRET_KEY = settings.SECRET_KEY  # Campo: SECRET_KEY

# Mas documentação menciona:
JWT_SECRET_KEY=...  # Nome diferente!
```

**Causa Provável:**
- Railway pode ter `JWT_SECRET_KEY` configurada
- Código lê `SECRET_KEY`
- Se não configurada, usa padrão inseguro
- Tokens criados com uma chave não podem ser validados com outra

**Impacto:**
- 🔴 **ALTO:** Tokens não funcionam entre ambientes
- 🔴 **ALTO:** Tokens criados localmente não funcionam em produção
- 🔴 **ALTO:** Tokens criados em produção não funcionam localmente

**Logs do Erro:**
```
# Não há logs específicos, mas comportamento:
verify_token() retorna None
get_current_user() levanta "Not authenticated"
Frontend recebe 401 e mostra "Sessão expirada"
```

**Correção Sugerida:**
```python
# backend/app/core/config.py
class Settings(BaseSettings):
    # Aceitar ambos os nomes
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="JWT secret key"
    )
    
    @field_validator('SECRET_KEY', mode='before')
    @classmethod
    def validate_secret_key(cls, v, info):
        # Tentar ler JWT_SECRET_KEY se SECRET_KEY não estiver definido
        if not v or v == "your-secret-key-change-in-production":
            jwt_secret = os.getenv("JWT_SECRET_KEY")
            if jwt_secret:
                return jwt_secret
        return v
```

**E no Railway:**
```bash
# Configurar AMBOS (para compatibilidade):
SECRET_KEY=<segredo-forte>
JWT_SECRET_KEY=<mesmo-segredo-forte>  # Alias
```

---

### 2. ❌ CRÍTICO: Token JWT Não Valida Expiração Explicitamente

**Localização:** `backend/app/core/auth.py:57-63`

**Problema:**
```python
def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:  # ❌ Captura TODOS os erros JWT
        return None  # ❌ Não diferencia tipo de erro
```

**Causa Provável:**
- `jwt.decode()` valida expiração automaticamente
- Mas código não diferencia `ExpiredSignatureError` de outros erros
- Todos retornam `None`, causando "Not authenticated"

**Impacto:**
- ⚠️ Dificulta debug
- ⚠️ Não loga qual tipo de erro ocorreu
- ⚠️ Usuário vê mensagem genérica

**Logs do Erro:**
```
# Não há logs específicos
# Apenas "Not authenticated" genérico
```

**Correção Sugerida:**
```python
# backend/app/core/auth.py
from jose import JWTError, ExpiredSignatureError

def verify_token(token: str) -> Optional[dict]:
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        print("⚠️ JWT: Token expirado")
        return None
    except JWTError as e:
        print(f"⚠️ JWT: Token inválido - {type(e).__name__}: {str(e)}")
        return None
```

---

### 3. ⚠️ ALTO: datetime.utcnow() Deprecated

**Localização:** `backend/app/core/auth.py:37, 49`

**Problema:**
```python
expire = datetime.utcnow() + expires_delta
```

**Causa:**
- `datetime.utcnow()` está deprecated no Python 3.12+
- Pode causar problemas de timezone
- Melhor usar `datetime.now(timezone.utc)`

**Impacto:**
- ⚠️ Pode causar problemas futuros
- ⚠️ Pode ter diferenças de timezone

**Correção Sugerida:**
```python
# backend/app/core/auth.py
from datetime import datetime, timedelta, timezone

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta  # ✅ Usar timezone.utc
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

---

### 4. ⚠️ MÉDIO: Mensagens de Erro Genéricas

**Localização:** `backend/app/routers/auth.py:100-105`

**Problema:**
```python
user = authenticate_user(db, login_data.nickname, login_data.password)
if not user:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas"  # ❌ Genérico
    )
```

**Causa:**
- Não diferencia entre "usuário não encontrado" e "senha incorreta"
- Frontend mostra mesma mensagem para ambos

**Impacto:**
- ⚠️ Dificulta debug
- ⚠️ Usuário não sabe qual é o problema

**Correção Sugerida:**
```python
# backend/app/routers/auth.py
@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Verificar se usuário existe primeiro
    user = get_user_by_identifier(db, login_data.nickname)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"  # ✅ Mensagem específica
        )
    
    # Verificar senha
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta"  # ✅ Mensagem específica
        )
    
    # Verificar se ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"  # ✅ Já específico
        )
    
    # ... resto do código
```

---

## 📝 LOGS RELEVANTES

### 5.1. Logs de Token Expirado

**Se token expirar:**
```
# Não há logs específicos atualmente
# Mas deveria ter:
⚠️ JWT: Token expirado
INFO: "GET /auth/me HTTP/1.1" 401 Unauthorized
```

### 5.2. Logs de Token Inválido (SECRET_KEY Diferente)

**Se SECRET_KEY for diferente:**
```
# Não há logs específicos
# Mas deveria ter:
⚠️ JWT: Token inválido - InvalidSignatureError: Signature verification failed
INFO: "GET /auth/me HTTP/1.1" 401 Unauthorized
```

### 5.3. Logs de Usuário Não Encontrado

**Código atual:**
```
🔍 DEBUG AUTH: Tentando autenticar identifier: usuario123
❌ DEBUG AUTH: Usuário 'usuario123' não encontrado (case-insensitive)
INFO: "POST /auth/login HTTP/1.1" 401 Unauthorized
```

### 5.4. Logs de Senha Incorreta

**Código atual:**
```
🔍 DEBUG AUTH: Tentando autenticar identifier: usuario123
✅ DEBUG AUTH: Usuário encontrado - ID: 1, Ativo: True
🔍 DEBUG AUTH: Hash no banco: e3b0c44298fc1c14...
🔍 DEBUG AUTH: Hash da senha enviada: 5e884898da280471...
❌ DEBUG AUTH: Senha incorreta para usuario123
INFO: "POST /auth/login HTTP/1.1" 401 Unauthorized
```

---

## 🎯 CAUSA PROVÁVEL DOS ERROS

### Cenário 1: "Sessão Expirada"

**Causa Mais Provável:**
1. ❌ **SECRET_KEY diferente** entre local e hospedado
   - Token criado com uma chave
   - Validado com outra chave
   - `jwt.decode()` falha
   - Retorna `None`
   - Levanta "Not authenticated"
   - Frontend mostra "Sessão expirada"

2. ⚠️ **Horário do servidor incorreto**
   - Servidor está adiantado
   - Token criado com `exp` no futuro
   - Mas servidor valida com horário adiantado
   - Token já está "expirado" quando criado

3. ⚠️ **Token realmente expirado**
   - Access token expira em 30 minutos
   - Se usuário não usar por 30+ minutos, expira
   - Refresh token deveria renovar, mas pode não estar funcionando

**Probabilidade:**
- 🔴 **ALTA:** SECRET_KEY diferente (mais provável)
- 🟡 **MÉDIA:** Horário do servidor
- 🟢 **BAIXA:** Token realmente expirado (se refresh funcionar)

---

### Cenário 2: "Usuário Não Encontrado"

**Causa Mais Provável:**
1. ✅ **Usuário realmente não existe**
   - Nickname digitado incorretamente
   - Usuário não foi criado
   - Banco de dados diferente entre ambientes

2. ⚠️ **Problema de case-sensitivity**
   - Código usa `get_user_by_identifier()` que é case-insensitive
   - Mas pode haver problema se banco tiver encoding diferente

**Probabilidade:**
- 🟢 **BAIXA:** Problema real (código já trata case-insensitive)
- 🟡 **MÉDIA:** Banco de dados diferente entre ambientes

---

### Cenário 3: "Senha Incorreta"

**Causa Mais Provável:**
1. ✅ **Senha realmente incorreta**
   - Usuário digitou senha errada
   - Senha foi alterada

2. ⚠️ **Hash de senha diferente**
   - Se hash mudou entre ambientes (improvável com SHA256)
   - Mas SHA256 é determinístico, então não deveria acontecer

3. ⚠️ **Encoding diferente**
   - Se senha tiver caracteres especiais
   - Encoding diferente pode causar hash diferente

**Probabilidade:**
- 🟢 **BAIXA:** Problema real (SHA256 é determinístico)
- 🟡 **MÉDIA:** Encoding de caracteres especiais

---

## 🛠️ CORREÇÕES SUGERIDAS

### Prioridade 1: Corrigir SECRET_KEY

**Arquivo:** `backend/app/core/config.py`

```python
# backend/app/core/config.py
import os

class Settings(BaseSettings):
    # Aceitar SECRET_KEY ou JWT_SECRET_KEY
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="JWT secret key (aceita SECRET_KEY ou JWT_SECRET_KEY)"
    )
    
    @field_validator('SECRET_KEY', mode='before')
    @classmethod
    def validate_secret_key(cls, v):
        # Se não definido ou é padrão, tentar JWT_SECRET_KEY
        if not v or v == "your-secret-key-change-in-production":
            jwt_secret = os.getenv("JWT_SECRET_KEY")
            if jwt_secret:
                print("🔑 Usando JWT_SECRET_KEY do ambiente")
                return jwt_secret
        return v
    
    # ... resto do código
```

**Railway Variables:**
```bash
# Configurar (escolha um):
SECRET_KEY=<segredo-forte-aleatório>
# OU
JWT_SECRET_KEY=<segredo-forte-aleatório>

# Recomendado: configurar AMBOS para compatibilidade
SECRET_KEY=<segredo-forte>
JWT_SECRET_KEY=<mesmo-segredo>
```

**Como Gerar Segredo Forte:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

---

### Prioridade 2: Melhorar Validação de Token

**Arquivo:** `backend/app/core/auth.py`

```python
# backend/app/core/auth.py
from jose import JWTError, ExpiredSignatureError

def verify_token(token: str) -> Optional[dict]:
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        print("⚠️ JWT: Token expirado")
        return None
    except JWTError as e:
        error_type = type(e).__name__
        print(f"⚠️ JWT: Token inválido - {error_type}: {str(e)[:100]}")
        return None
```

---

### Prioridade 3: Corrigir datetime.utcnow()

**Arquivo:** `backend/app/core/auth.py`

```python
# backend/app/core/auth.py
from datetime import datetime, timedelta, timezone

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT de acesso"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta  # ✅ timezone.utc
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT de refresh"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta  # ✅ timezone.utc
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

---

### Prioridade 4: Melhorar Mensagens de Erro

**Arquivo:** `backend/app/routers/auth.py`

```python
# backend/app/routers/auth.py
@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Fazer login do usuário"""
    # Verificar se usuário existe
    user = get_user_by_identifier(db, login_data.nickname)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"  # ✅ Mensagem específica
        )
    
    # Verificar senha
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta"  # ✅ Mensagem específica
        )
    
    # Verificar se ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    # ... resto do código (criar tokens, etc.)
```

---

### Prioridade 5: Adicionar Endpoint de Diagnóstico

**Arquivo:** `backend/app/routers/auth.py`

```python
# backend/app/routers/auth.py
@router.get("/debug/token")
async def debug_token(token: str = None):
    """Endpoint de diagnóstico de token (remover após debug)"""
    from app.core.auth import verify_token, SECRET_KEY
    from jose import jwt, ExpiredSignatureError, JWTError
    from datetime import datetime, timezone
    
    if not token:
        return {
            "error": "Token não fornecido",
            "usage": "GET /auth/debug/token?token=eyJ..."
        }
    
    try:
        # Tentar decodificar sem validar (para ver conteúdo)
        unverified = jwt.decode(token, options={"verify_signature": False})
        
        # Verificar expiração
        exp_timestamp = unverified.get("exp")
        if exp_timestamp:
            exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
            now = datetime.now(timezone.utc)
            is_expired = exp_datetime < now
            time_until_expiry = exp_datetime - now if not is_expired else None
        else:
            exp_datetime = None
            is_expired = None
            time_until_expiry = None
        
        # Tentar validar
        try:
            verified = verify_token(token)
            is_valid = verified is not None
        except Exception as e:
            is_valid = False
            validation_error = str(e)
        
        return {
            "token": {
                "header": unverified.get("type", "unknown"),
                "user_id": unverified.get("sub"),
                "exp": exp_timestamp,
                "exp_datetime": exp_datetime.isoformat() if exp_datetime else None,
                "is_expired": is_expired,
                "time_until_expiry_seconds": time_until_expiry.total_seconds() if time_until_expiry else None,
            },
            "validation": {
                "is_valid": is_valid,
                "error": validation_error if not is_valid else None,
            },
            "server": {
                "current_time": datetime.now(timezone.utc).isoformat(),
                "secret_key_length": len(SECRET_KEY),
                "secret_key_preview": SECRET_KEY[:10] + "..." if len(SECRET_KEY) > 10 else "***",
            }
        }
    except Exception as e:
        return {
            "error": "Erro ao processar token",
            "message": str(e)
        }
```

---

## 📊 RESUMO DE VERIFICAÇÕES

| Item | Status | Observações |
|------|--------|-------------|
| Validação de Token JWT | ⚠️ Genérica | Não diferencia tipos de erro |
| Access vs Refresh Token | ✅ OK | Diferenças corretas |
| Horário do Servidor | ⚠️ Problema | Usa `datetime.utcnow()` deprecated |
| SECRET_KEY | ❌ CRÍTICO | Pode ser diferente entre ambientes |
| Mensagens de Erro | ⚠️ Genéricas | Não diferenciam causas |

---

## 🎯 CONCLUSÃO

### Causa Provável dos Erros

**"Sessão Expirada":**
- 🔴 **MAIS PROVÁVEL:** SECRET_KEY diferente entre local e hospedado
- 🟡 **PROVÁVEL:** Horário do servidor incorreto
- 🟢 **POSSÍVEL:** Token realmente expirado

**"Usuário Não Encontrado":**
- 🟢 **MAIS PROVÁVEL:** Usuário realmente não existe
- 🟡 **POSSÍVEL:** Banco de dados diferente entre ambientes

**"Senha Incorreta":**
- 🟢 **MAIS PROVÁVEL:** Senha realmente incorreta
- 🟡 **POSSÍVEL:** Problema de encoding

### Recomendações Imediatas

1. ✅ **Verificar SECRET_KEY no Railway**
   - Deve ser igual entre local e hospedado
   - Deve ser um segredo forte
   - Não deve ser o padrão "your-secret-key-change-in-production"

2. ✅ **Verificar horário do servidor**
   - Railway geralmente usa UTC
   - Verificar se está correto

3. ✅ **Adicionar logs de diagnóstico**
   - Logar tipo de erro JWT
   - Logar se token expirou ou é inválido

4. ✅ **Melhorar mensagens de erro**
   - Diferenciar "usuário não encontrado" de "senha incorreta"
   - Diferenciar "token expirado" de "token inválido"

---

**Última Atualização:** Janeiro/2025  
**Versão do Relatório:** 1.0.0

