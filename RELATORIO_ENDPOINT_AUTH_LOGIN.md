# 🔍 RELATÓRIO DETALHADO - ENDPOINT /auth/login

**Data:** Janeiro de 2025  
**Endpoint:** `POST /auth/login`  
**Status:** ⚠️ **FUNCIONAL COM PROBLEMAS DE SEGURANÇA**

---

## 📋 1. CÓDIGO COMPLETO DO ENDPOINT

### 1.1. Endpoint Principal (`backend/app/routers/auth.py`)

```94:152:backend/app/routers/auth.py
@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Fazer login do usuário
    """
    # Autenticar usuário
    user = authenticate_user(db, login_data.nickname, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    # Verificar se usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    # Criar tokens JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=7)
    
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=refresh_token_expires
    )
    
    # Atualizar último login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Criar resposta JSON
    response = JSONResponse(content={
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    })
    
    # Configurar cookie HttpOnly para cross-site
    response.set_cookie(
        key="connectus_access_token",
        value=access_token,
        httponly=True,
        secure=True,          # Obrigatório em produção (HTTPS)
        samesite="none",      # Obrigatório para cross-site
        path="/",
        # Não definir domain=; deixar o browser associar ao host do Railway
    )
    
    return response
```

### 1.2. Função de Autenticação (`backend/app/core/auth.py`)

```84:105:backend/app/core/auth.py
def authenticate_user(db: Session, nickname: str, password: str) -> Optional[User]:
    """[CONNECTUS HOTFIX] Autenticar usuário com debug detalhado (case-insensitive)"""
    print(f"🔍 DEBUG AUTH: Tentando autenticar identifier: {nickname}")
    
    # Usar busca case-insensitive por nickname ou email
    user = get_user_by_identifier(db, nickname)
    if not user:
        print(f"❌ DEBUG AUTH: Usuário '{nickname}' não encontrado (case-insensitive)")
        return None
    
    print(f"✅ DEBUG AUTH: Usuário encontrado - ID: {user.id}, Ativo: {user.is_active}")
    print(f"🔍 DEBUG AUTH: Hash no banco: {user.password_hash[:20]}...")
    
    password_hash = get_password_hash(password)
    print(f"🔍 DEBUG AUTH: Hash da senha enviada: {password_hash[:20]}...")
    
    if not verify_password(password, user.password_hash):
        print(f"❌ DEBUG AUTH: Senha incorreta para {nickname}")
        return None
    
    print(f"✅ DEBUG AUTH: Autenticação bem-sucedida para {nickname}")
    return user
```

### 1.3. Funções de Hash de Senha (`backend/app/core/auth.py`)

```25:31:backend/app/core/auth.py
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha usando SHA256"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    """Gerar hash da senha usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()
```

### 1.4. Criação de Tokens JWT (`backend/app/core/auth.py`)

```33:55:backend/app/core/auth.py
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

---

## ✅ 2. VERIFICAÇÃO DE GERAÇÃO DE TOKEN JWT

### 2.1. Token de Acesso

**Status:** ✅ **FUNCIONANDO CORRETAMENTE**

- ✅ Token é gerado usando `jose.jwt.encode()`
- ✅ Payload contém:
  - `sub`: ID do usuário (string)
  - `exp`: Data de expiração
  - `type`: "access"
- ✅ Algoritmo: HS256
- ✅ Secret Key: `settings.SECRET_KEY`
- ✅ Expiração: 30 minutos (configurável via `ACCESS_TOKEN_EXPIRE_MINUTES`)

**Código:**
```python
access_token = create_access_token(
    data={"sub": str(user.id)}, 
    expires_delta=access_token_expires
)
```

### 2.2. Token de Refresh

**Status:** ✅ **FUNCIONANDO CORRETAMENTE**

- ✅ Token é gerado usando `jose.jwt.encode()`
- ✅ Payload contém:
  - `sub`: ID do usuário (string)
  - `exp`: Data de expiração
  - `type`: "refresh"
- ✅ Expiração: 7 dias

**Código:**
```python
refresh_token = create_refresh_token(
    data={"sub": str(user.id)},
    expires_delta=refresh_token_expires
)
```

### 2.3. Resposta JSON

**Status:** ✅ **FUNCIONANDO CORRETAMENTE**

A resposta contém:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 2.4. Cookie HttpOnly

**Status:** ⚠️ **PROBLEMA IDENTIFICADO**

- ✅ Cookie é configurado com `httponly=True`
- ✅ Cookie é configurado com `samesite="none"`
- ❌ **PROBLEMA:** `secure=True` em ambiente local (HTTP) - cookie não será salvo

---

## 🌐 3. VERIFICAÇÃO DE CORS, IP E SESSÃO

### 3.1. Configuração CORS (`backend/app/main.py`)

```65:72:backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Specific origins
    allow_origin_regex=r"https://.*\.vercel\.app$",  # Cobre previews do Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Origins Permitidos:**
- `http://127.0.0.1:5173` (local)
- `http://localhost:5173` (local)
- `https://connectus-real-world.vercel.app` (produção)
- Regex: `https://.*\.vercel\.app$` (previews Vercel)

**Status:** ✅ **CONFIGURADO CORRETAMENTE**

### 3.2. IP e Sessão

**Status:** ⚠️ **NÃO IMPLEMENTADO**

- ❌ Não há verificação de IP
- ❌ Não há limitação de tentativas de login
- ❌ Não há bloqueio de sessão duplicada
- ⚠️ **RISCO DE SEGURANÇA:** Sem rate limiting

---

## 📊 4. LOGS ESPERADOS DO SERVIDOR (Uvicorn)

### 4.1. Logs de Sucesso

Quando um login é bem-sucedido, os logs do uvicorn devem mostrar:

```
INFO:     127.0.0.1:XXXXX - "POST /auth/login HTTP/1.1" 200 OK
🔍 DEBUG AUTH: Tentando autenticar identifier: usuario123
✅ DEBUG AUTH: Usuário encontrado - ID: 1, Ativo: True
🔍 DEBUG AUTH: Hash no banco: e3b0c44298fc1c14...
🔍 DEBUG AUTH: Hash da senha enviada: e3b0c44298fc1c14...
✅ DEBUG AUTH: Autenticação bem-sucedida para usuario123
```

### 4.2. Logs de Erro - Usuário Não Encontrado

```
INFO:     127.0.0.1:XXXXX - "POST /auth/login HTTP/1.1" 401 Unauthorized
🔍 DEBUG AUTH: Tentando autenticar identifier: usuario_inexistente
❌ DEBUG AUTH: Usuário 'usuario_inexistente' não encontrado (case-insensitive)
```

### 4.3. Logs de Erro - Senha Incorreta

```
INFO:     127.0.0.1:XXXXX - "POST /auth/login HTTP/1.1" 401 Unauthorized
🔍 DEBUG AUTH: Tentando autenticar identifier: usuario123
✅ DEBUG AUTH: Usuário encontrado - ID: 1, Ativo: True
🔍 DEBUG AUTH: Hash no banco: e3b0c44298fc1c14...
🔍 DEBUG AUTH: Hash da senha enviada: 5e884898da280471...
❌ DEBUG AUTH: Senha incorreta para usuario123
```

### 4.4. Logs de Erro - Usuário Inativo

```
INFO:     127.0.0.1:XXXXX - "POST /auth/login HTTP/1.1" 401 Unauthorized
🔍 DEBUG AUTH: Tentando autenticar identifier: usuario123
✅ DEBUG AUTH: Usuário encontrado - ID: 1, Ativo: False
```

---

## 🗄️ 5. VERIFICAÇÃO DO BANCO DE DADOS SQLite

### 5.1. Localização do Banco

**Caminho Padrão:** `backend/app/connectus.db`

**Configuração:**
```python
DATABASE_URL: str = "sqlite:///app/connectus.db"
```

### 5.2. Estrutura da Tabela `users`

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    # ... outros campos ...
    is_active = Column(Boolean, default=True)
```

### 5.3. Como Verificar Usuários no Banco

**Script SQL:**
```sql
-- Verificar todos os usuários
SELECT id, nickname, email, is_active, created_at 
FROM users;

-- Verificar usuário específico
SELECT id, nickname, email, password_hash, is_active 
FROM users 
WHERE nickname = 'usuario123';

-- Verificar hash de senha (primeiros 20 caracteres)
SELECT id, nickname, substr(password_hash, 1, 20) as hash_preview 
FROM users;
```

**Script Python:**
```python
from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
user = db.query(User).filter(User.nickname == "usuario123").first()
if user:
    print(f"ID: {user.id}")
    print(f"Nickname: {user.nickname}")
    print(f"Hash: {user.password_hash[:20]}...")
    print(f"Ativo: {user.is_active}")
else:
    print("Usuário não encontrado")
```

---

## 🔐 6. VERIFICAÇÃO DE HASH DE SENHA

### 6.1. Algoritmo Atual

**Status:** ❌ **PROBLEMA CRÍTICO DE SEGURANÇA**

O sistema usa **SHA256** para hash de senhas, o que é **INSEGURO**:

```python
def get_password_hash(password: str) -> str:
    """Gerar hash da senha usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()
```

**Problemas:**
1. ❌ SHA256 é rápido (vulnerável a ataques de força bruta)
2. ❌ Não usa salt (mesma senha = mesmo hash)
3. ❌ Não é adequado para senhas (foi projetado para integridade, não segurança)

### 6.2. Comparação com Bcrypt

**Bcrypt (Recomendado):**
- ✅ Algoritmo lento (protege contra força bruta)
- ✅ Usa salt automático (mesma senha = hash diferente)
- ✅ Adequado para senhas
- ✅ Configurável (número de rounds)

**SHA256 (Atual - Inseguro):**
- ❌ Algoritmo rápido (vulnerável)
- ❌ Sem salt (previsível)
- ❌ Não adequado para senhas

### 6.3. Verificação de Senha

**Código Atual:**
```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha usando SHA256"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
```

**Status:** ⚠️ **FUNCIONA, MAS INSEGURO**

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. ❌ CRÍTICO: Hash de Senha Inseguro (SHA256)

**Localização:** `backend/app/core/auth.py:25-31`

**Problema:**
- Usa SHA256 em vez de bcrypt
- Vulnerável a ataques de força bruta
- Sem salt (mesma senha = mesmo hash)

**Impacto:**
- 🔴 **ALTO RISCO DE SEGURANÇA**
- Senhas podem ser quebradas facilmente
- Não segue boas práticas de segurança

**Logs do Erro:**
- Não há erro explícito, mas é uma vulnerabilidade crítica

**Causa Provável:**
- Implementação inicial simplificada
- Biblioteca `passlib[bcrypt]` já está instalada (requirements.txt linha 5), mas código não usa
- Código foi implementado com SHA256 e nunca foi migrado para bcrypt

**Correção Sugerida:**
```python
# backend/app/core/auth.py
from passlib.context import CryptContext

# Configurar bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha usando bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gerar hash da senha usando bcrypt"""
    return pwd_context.hash(password)
```

**Migração Necessária:**
1. Atualizar `requirements.txt` para incluir `passlib[bcrypt]`
2. Criar script de migração para re-hashar senhas existentes
3. Atualizar função de registro para usar bcrypt

---

### 2. ⚠️ ALTO: Cookie Secure em Ambiente Local

**Localização:** `backend/app/routers/auth.py:146`

**Problema:**
```python
secure=True,  # Obrigatório em produção (HTTPS)
```

**Causa:**
- Cookie com `Secure=True` só funciona em HTTPS
- Em ambiente local (HTTP), cookie não é salvo

**Impacto:**
- ⚠️ Cookie não funciona em desenvolvimento
- ✅ Tokens no localStorage funcionam (workaround)

**Logs do Erro:**
- Não há erro explícito
- Cookie simplesmente não aparece no DevTools

**Correção Sugerida:**
```python
import os

# Determinar ambiente
is_production = os.getenv("ENVIRONMENT") == "production"
is_https = not settings.DEBUG or is_production

response.set_cookie(
    key="connectus_access_token",
    value=access_token,
    httponly=True,
    secure=is_https,  # True apenas em HTTPS
    samesite="none" if is_https else "lax",
    path="/",
)
```

---

### 3. ⚠️ MÉDIO: Falta de Rate Limiting

**Problema:**
- Não há limitação de tentativas de login
- Vulnerável a ataques de força bruta

**Impacto:**
- ⚠️ Atacantes podem tentar muitas senhas
- ⚠️ Sem proteção contra brute force

**Correção Sugerida:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/login")
@limiter.limit("5/minute")  # 5 tentativas por minuto
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # ... código existente ...
```

---

### 4. ⚠️ BAIXO: Validação de Nickname Restritiva

**Localização:** `backend/app/schemas/auth.py:15-23`

**Problema:**
- Backend rejeita `_` (underscore)
- Frontend permite `_` no pattern

**Impacto:**
- ⚠️ Inconsistência entre frontend e backend
- ⚠️ Usuários podem receber erro 422

**Correção Sugerida:**
```python
import re

@validator('nickname')
def validate_nickname(cls, v):
    if not v or v.strip() == "":
        raise ValueError('Nickname não pode ser vazio')
    if ' ' in v:
        raise ValueError('Nickname não pode conter espaços')
    # Permitir letras, números e underscore
    if not re.match(r'^[a-zA-Z0-9_]+$', v):
        raise ValueError('Nickname deve conter apenas letras, números e _')
    return v.strip().lower()
```

---

## 📝 RESUMO DE VERIFICAÇÕES

| Item | Status | Observações |
|------|--------|-------------|
| Geração de Token JWT | ✅ OK | Tokens gerados corretamente |
| Retorno de Tokens | ✅ OK | JSON e cookie configurados |
| CORS | ✅ OK | Configurado corretamente |
| Hash de Senha | ❌ CRÍTICO | SHA256 inseguro, deve usar bcrypt |
| Cookie Secure | ⚠️ PROBLEMA | Não funciona em local (HTTP) |
| Rate Limiting | ❌ FALTANDO | Sem proteção contra brute force |
| Validação Nickname | ⚠️ PROBLEMA | Rejeita `_` inconsistente com frontend |
| Logs de Debug | ✅ OK | Logs detalhados implementados |

---

## 🛠️ CORREÇÕES PRIORITÁRIAS

### Prioridade 1: Migrar para Bcrypt

**Arquivo:** `backend/app/core/auth.py`

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha usando bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gerar hash da senha usando bcrypt"""
    return pwd_context.hash(password)
```

**Arquivo:** `backend/requirements.txt`
```
passlib[bcrypt]==1.7.4  # ✅ JÁ ESTÁ INSTALADO, mas código não usa!
```

**Script de Migração:**
```python
# backend/scripts/migrate_passwords_to_bcrypt.py
from app.core.database import SessionLocal
from app.models.user import User
from app.core.auth import get_password_hash, verify_password
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def migrate_passwords():
    db = SessionLocal()
    users = db.query(User).all()
    
    for user in users:
        # Se já é bcrypt (começa com $2b$), pular
        if user.password_hash.startswith("$2b$"):
            continue
        
        # Tentar verificar com SHA256 (senha antiga)
        # Se funcionar, re-hashear com bcrypt
        # Nota: Isso requer que você saiba a senha original
        # Ou force reset de senha para todos os usuários
        
        # Opção 1: Forçar reset de senha
        # user.password_hash = pwd_context.hash("temp_password")
        # db.commit()
        
        # Opção 2: Manter SHA256 e migrar gradualmente
        # (usuários migram ao fazer login)
        pass
    
    db.close()
```

---

### Prioridade 2: Corrigir Cookie Secure

**Arquivo:** `backend/app/routers/auth.py`

```python
import os

is_production = os.getenv("ENVIRONMENT") == "production"
is_https = not settings.DEBUG or is_production

response.set_cookie(
    key="connectus_access_token",
    value=access_token,
    httponly=True,
    secure=is_https,
    samesite="none" if is_https else "lax",
    path="/",
)
```

---

### Prioridade 3: Adicionar Rate Limiting

**Arquivo:** `backend/requirements.txt`
```
slowapi==0.1.9
```

**Arquivo:** `backend/app/main.py`
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

**Arquivo:** `backend/app/routers/auth.py`
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # ... código existente ...
```

---

## 🎯 CONCLUSÃO

O endpoint `/auth/login` está **funcional**, mas apresenta **problemas críticos de segurança**:

1. ❌ **CRÍTICO:** Hash de senha usando SHA256 (inseguro)
2. ⚠️ **ALTO:** Cookie Secure não funciona em local
3. ⚠️ **MÉDIO:** Falta de rate limiting
4. ⚠️ **BAIXO:** Validação de nickname inconsistente

**Recomendação:** Corrigir o problema de hash de senha (Prioridade 1) **imediatamente** antes de colocar em produção.

---

**Última Atualização:** Janeiro/2025  
**Versão do Relatório:** 1.0.0

