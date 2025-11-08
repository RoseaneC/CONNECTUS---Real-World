# 🔍 DIAGNÓSTICO COMPLETO - SISTEMA DE LOGIN CONNECTUS

**Data:** Janeiro de 2025  
**Versão:** 1.0.0  
**Status:** ⚠️ **FUNCIONAL COM PROBLEMAS IDENTIFICADOS**

---

## 📋 SUMÁRIO EXECUTIVO

O sistema de login do ConnectUS está **funcionalmente implementado**, mas apresenta **problemas críticos** que podem causar falhas em diferentes ambientes:

1. ⚠️ **Cookie `Secure=True` em ambiente local (HTTP)** - Falha silenciosa
2. ⚠️ **Validação de nickname muito restritiva** - Rejeita caracteres válidos
3. ⚠️ **Interceptors duplicados** - Pode causar loops de refresh
4. ⚠️ **Refresh token não retorna novo refresh token** - Expira após 7 dias
5. ⚠️ **CORS em produção** - Requer configuração específica

---

## 🔄 FLUXO COMPLETO DE LOGIN

### 1. Frontend - LoginPage.jsx

```58:78:frontend/src/pages/LoginPage.jsx
  const onSubmit = async (data) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const result = await login(data.nickname, data.password)
      
      if (result?.success) {
        navigate('/dashboard')
      } else {
        // Erro já foi tratado no AuthContext com toast
        // Não fazer nada aqui para evitar refresh
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro inesperado ao fazer login')
    } finally {
      setIsSubmitting(false)
    }
  }
```

**Análise:**
- ✅ Validação de formulário com react-hook-form
- ✅ Tratamento de erros básico
- ⚠️ Erro genérico se `login()` lançar exceção não tratada

---

### 2. Frontend - AuthContext.jsx - Função login()

```79:142:frontend/src/context/AuthContext.jsx
  const login = async (nickname, password) => {
    try {
      setLoading(true)
      console.log('🔍 Tentando fazer login:', { nickname, password: '***' })
      
      const response = await api.post('/auth/login', {
        nickname: nickname.trim().toLowerCase(),
        password
      })

      console.log('✅ Resposta do login:', response.data)
      const { access_token, refresh_token } = response.data
      
      // Salvar tokens no localStorage
      localStorage.setItem('token', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      setToken(access_token)
      setRefreshToken(refresh_token)
      
      // Buscar dados do usuário
      console.log('🔍 Buscando dados do usuário...')
      const userResponse = await api.get('/auth/me')
      console.log('✅ Dados do usuário:', userResponse.data)
      setUser(userResponse.data)
      
      toast.success('Login realizado com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('Erro no login:', error)
      console.error('API URL configurada:', import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000')
      console.error('Erro completo:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request
      })
      
      let errorMessage = 'Erro ao fazer login'
      
      if (error.response?.status === 401) {
        errorMessage = 'Usuário ou senha inválidos. Se for seu 1º acesso, crie sua conta.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || 'Dados inválidos'
      } else if (error.response?.status === 422) {
        errorMessage = 'Dados de login inválidos. Verifique o formato.'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.'
      } else if (!error.response) {
        // Network error - no response from server
        const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000'
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          errorMessage = `Não foi possível conectar ao servidor (${apiUrl}). Verifique se o backend está rodando e se a URL está correta.`
        } else {
          errorMessage = `Erro de conexão: ${error.message || 'Servidor não respondeu'}. Verifique a configuração de VITE_API_URL.`
        }
      }
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }
```

**Análise:**
- ✅ Tratamento detalhado de erros
- ✅ Logs úteis para debug
- ✅ Mensagens de erro amigáveis
- ⚠️ Não verifica se `access_token` e `refresh_token` existem antes de salvar

---

### 3. Frontend - api.js - Interceptor de Request

```22:31:frontend/src/services/api.js
// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token") || null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore if localStorage not available
  }
  return config;
}, (error) => Promise.reject(error));
```

**Análise:**
- ✅ Adiciona token automaticamente
- ✅ Tratamento de erro se localStorage não disponível

---

### 4. Backend - auth.py - Endpoint /auth/login

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

**Análise:**
- ✅ Autenticação com validação de senha
- ✅ Verificação de usuário ativo
- ✅ Criação de tokens JWT
- ✅ Cookie HttpOnly configurado
- ❌ **PROBLEMA CRÍTICO:** `secure=True` em ambiente local (HTTP) - cookie não será salvo

---

### 5. Backend - auth.py - Função authenticate_user()

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

**Análise:**
- ✅ Busca case-insensitive
- ✅ Logs detalhados para debug
- ✅ Validação de senha com SHA256

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. ❌ CRÍTICO: Cookie Secure em Ambiente Local

**Localização:** `backend/app/routers/auth.py:146`

**Problema:**
```python
secure=True,  # Obrigatório em produção (HTTPS)
```

**Causa:**
- Cookie com `Secure=True` só funciona em HTTPS
- Em ambiente local (HTTP), o cookie **não será salvo**
- Login funciona (tokens no localStorage), mas cookie não é criado
- Em produção (HTTPS), funciona normalmente

**Impacto:**
- ⚠️ Ambiente local: Cookie não funciona (mas tokens no localStorage funcionam)
- ✅ Ambiente produção: Funciona normalmente

**Stack Trace:**
- Não há erro explícito, apenas cookie não aparece no DevTools

**Onde quebra:**
- Backend (configuração de cookie)

**Sugestão de Correção:**
```python
# backend/app/routers/auth.py
import os

# Determinar se está em produção
is_production = os.getenv("ENVIRONMENT") == "production" or os.getenv("ENVIRONMENT") == "prod"
is_https = settings.DEBUG == False or is_production

response.set_cookie(
    key="connectus_access_token",
    value=access_token,
    httponly=True,
    secure=is_https,  # True apenas em produção/HTTPS
    samesite="none" if is_https else "lax",  # lax em local, none em produção
    path="/",
)
```

---

### 2. ⚠️ ALTO: Validação de Nickname Muito Restritiva

**Localização:** `backend/app/schemas/auth.py:15-23`

**Problema:**
```python
@validator('nickname')
def validate_nickname(cls, v):
    if not v or v.strip() == "":
        raise ValueError('Nickname não pode ser vazio')
    if ' ' in v:
        raise ValueError('Nickname não pode conter espaços')
    if not v.isalnum():  # ❌ PROBLEMA: Rejeita underscore (_)
        raise ValueError('Nickname deve conter apenas letras e números')
    return v.strip().lower()
```

**Causa:**
- `isalnum()` rejeita caracteres como `_` (underscore)
- Frontend permite `_` no pattern: `/^[a-zA-Z0-9_]+$/`
- Backend rejeita `_` - **inconsistência**

**Impacto:**
- ❌ Usuários com nickname contendo `_` não conseguem fazer login
- ❌ Erro 422 (Validation Error) sem mensagem clara

**Stack Trace:**
```
422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "nickname"],
      "msg": "Nickname deve conter apenas letras e números",
      "type": "value_error"
    }
  ]
}
```

**Onde quebra:**
- Backend (validação de schema)

**Sugestão de Correção:**
```python
# backend/app/schemas/auth.py
@validator('nickname')
def validate_nickname(cls, v):
    if not v or v.strip() == "":
        raise ValueError('Nickname não pode ser vazio')
    if ' ' in v:
        raise ValueError('Nickname não pode conter espaços')
    # Permitir letras, números e underscore (consistente com frontend)
    import re
    if not re.match(r'^[a-zA-Z0-9_]+$', v):
        raise ValueError('Nickname deve conter apenas letras, números e _')
    return v.strip().lower()
```

---

### 3. ⚠️ MÉDIO: Interceptors Duplicados

**Localização:** `frontend/src/context/AuthContext.jsx:28-58` e `frontend/src/services/api.js:44-114`

**Problema:**
- Dois interceptors de resposta configurados
- Um no `AuthContext` (linha 42-52)
- Outro no `api.js` (linha 44-114)
- Ambos tratam 401 e podem causar loops

**Causa:**
- Interceptor no `AuthContext` faz logout imediato em 401
- Interceptor no `api.js` tenta refresh token antes
- Conflito de lógica

**Impacto:**
- ⚠️ Pode causar logout prematuro
- ⚠️ Refresh token pode não ser tentado

**Onde quebra:**
- Frontend (lógica de interceptors)

**Sugestão de Correção:**
```javascript
// frontend/src/context/AuthContext.jsx
// REMOVER interceptor de resposta do AuthContext
// Deixar apenas o do api.js que já trata refresh token

useEffect(() => {
  const requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // ❌ REMOVER este interceptor de resposta
  // const responseInterceptor = api.interceptors.response.use(...)

  return () => {
    api.interceptors.request.eject(requestInterceptor)
    // api.interceptors.response.eject(responseInterceptor) // ❌ REMOVER
  }
}, [])
```

---

### 4. ⚠️ MÉDIO: Refresh Token Não Retorna Novo Refresh Token

**Localização:** `backend/app/routers/auth.py:154-195`

**Problema:**
```python
@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    # ...
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        # ❌ Não retorna novo refresh_token
    }
```

**Causa:**
- Refresh token expira em 7 dias
- Após expirar, usuário precisa fazer login novamente
- Não há rotação de refresh tokens

**Impacto:**
- ⚠️ Usuários precisam fazer login a cada 7 dias
- ⚠️ Experiência do usuário degradada

**Onde quebra:**
- Backend (lógica de refresh)

**Sugestão de Correção:**
```python
# backend/app/routers/auth.py
@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    # ... validação existente ...
    
    # Criar novo access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    
    # ✅ Criar novo refresh token (rotação)
    refresh_token_expires = timedelta(days=7)
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,  # ✅ Retornar novo refresh token
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
```

E atualizar o frontend:
```javascript
// frontend/src/services/api.js
const { access_token, refresh_token } = response.data;  // ✅ Salvar novo refresh token
localStorage.setItem('token', access_token);
localStorage.setItem('refreshToken', refresh_token);  // ✅ Atualizar refresh token
```

---

### 5. ⚠️ BAIXO: CORS em Produção

**Localização:** `backend/app/main.py:65-72`

**Problema:**
- CORS configurado com origins específicos
- Regex para previews do Vercel
- Pode falhar se origin não estiver na lista

**Causa:**
- Lista de origins pode não incluir todos os domínios
- Regex pode não cobrir todos os casos

**Impacto:**
- ⚠️ Requisições podem ser bloqueadas em produção
- ⚠️ Login pode falhar silenciosamente

**Onde quebra:**
- Backend (configuração CORS)

**Sugestão de Correção:**
- Verificar logs do backend no startup
- Adicionar origin ao `CORS_ORIGINS` se necessário
- Testar com diferentes domínios

---

## 📊 ANÁLISE DE ERROS HTTP

### 401 Unauthorized

**Causas:**
1. Credenciais inválidas (nickname/senha incorretos)
2. Usuário inativo
3. Token expirado ou inválido

**Tratamento:**
- ✅ Frontend mostra mensagem amigável
- ✅ Backend retorna `detail: "Credenciais inválidas"`

**Logs:**
```
❌ DEBUG AUTH: Usuário 'nickname' não encontrado
❌ DEBUG AUTH: Senha incorreta para nickname
```

---

### 400 Bad Request

**Causas:**
1. Dados inválidos no body
2. Nickname já cadastrado (registro)
3. Email já cadastrado (registro)

**Tratamento:**
- ✅ Frontend mostra mensagem específica
- ✅ Backend retorna `detail` com mensagem

---

### 422 Unprocessable Entity

**Causas:**
1. Validação de schema falhou (nickname com caracteres inválidos)
2. Formato de dados incorreto

**Tratamento:**
- ⚠️ Frontend mostra mensagem genérica
- ✅ Backend retorna detalhes de validação

**Problema:**
- Mensagem não é muito clara para o usuário

---

### 500 Internal Server Error

**Causas:**
1. Erro no banco de dados
2. Erro ao criar usuário
3. Erro ao gerar tokens

**Tratamento:**
- ✅ Frontend mostra mensagem genérica
- ✅ Backend loga erro detalhado

---

### Network Error (Sem Resposta)

**Causas:**
1. Backend não está rodando
2. URL incorreta (`VITE_API_URL`)
3. CORS bloqueando requisição
4. Problema de rede

**Tratamento:**
- ✅ Frontend detecta e mostra mensagem específica
- ✅ Logs úteis no console

---

## 🔍 DIFERENÇAS ENTRE AMBIENTE LOCAL E PRODUÇÃO

### Ambiente Local (HTTP)

**Problemas:**
1. ❌ Cookie `Secure=True` não funciona (HTTP)
2. ✅ Tokens no localStorage funcionam
3. ✅ CORS configurado para `http://localhost:5173`

**Comportamento:**
- Login funciona via tokens no localStorage
- Cookie não é salvo (mas não é crítico)
- Autenticação via `Authorization: Bearer` header

---

### Ambiente Produção (HTTPS)

**Funcionamento:**
1. ✅ Cookie `Secure=True` funciona (HTTPS)
2. ✅ Tokens no localStorage funcionam
3. ✅ CORS configurado para domínio do Vercel

**Comportamento:**
- Login funciona via tokens no localStorage
- Cookie é salvo e enviado automaticamente
- Autenticação via cookie OU header

---

## 🛠️ SUGESTÕES DE CORREÇÃO PRIORITÁRIAS

### Prioridade 1: Cookie Secure em Local

**Arquivo:** `backend/app/routers/auth.py`

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

### Prioridade 2: Validação de Nickname

**Arquivo:** `backend/app/schemas/auth.py`

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

### Prioridade 3: Remover Interceptor Duplicado

**Arquivo:** `frontend/src/context/AuthContext.jsx`

```javascript
useEffect(() => {
  const requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // ❌ REMOVER interceptor de resposta (já existe no api.js)

  return () => {
    api.interceptors.request.eject(requestInterceptor)
  }
}, [])
```

---

### Prioridade 4: Rotação de Refresh Token

**Arquivo:** `backend/app/routers/auth.py`

```python
@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    # ... validação existente ...
    
    # Criar novo access token
    access_token = create_access_token(...)
    
    # ✅ Criar novo refresh token
    new_refresh_token = create_refresh_token(...)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,  # ✅ Retornar novo
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
```

E atualizar `frontend/src/services/api.js`:
```javascript
const { access_token, refresh_token } = response.data;
localStorage.setItem('token', access_token);
localStorage.setItem('refreshToken', refresh_token);  // ✅ Atualizar
```

---

## 📝 CHECKLIST DE TESTES

### Testes Locais

- [ ] Login com nickname válido funciona
- [ ] Login com nickname contendo `_` funciona
- [ ] Erro 401 com credenciais inválidas
- [ ] Erro 422 com nickname inválido
- [ ] Token salvo no localStorage
- [ ] Cookie não aparece (esperado em HTTP)
- [ ] Refresh token funciona
- [ ] Logout remove tokens

### Testes Produção

- [ ] Login funciona
- [ ] Cookie é salvo (DevTools → Application → Cookies)
- [ ] Cookie tem `Secure`, `SameSite=None`, `HttpOnly`
- [ ] Sessão mantém após navegação
- [ ] CORS permite requisições
- [ ] Refresh token funciona
- [ ] Logout remove cookie

---

## 🎯 CONCLUSÃO

O sistema de login está **funcional**, mas apresenta **4 problemas** que devem ser corrigidos:

1. **Crítico:** Cookie `Secure=True` em local (não bloqueia, mas cookie não funciona)
2. **Alto:** Validação de nickname rejeita `_` (inconsistente com frontend)
3. **Médio:** Interceptors duplicados (pode causar problemas)
4. **Médio:** Refresh token não rotaciona (expira após 7 dias)

**Recomendação:** Corrigir problemas de Prioridade 1 e 2 imediatamente. Prioridade 3 e 4 podem ser feitas em seguida.

---

**Última Atualização:** Janeiro/2025  
**Versão do Diagnóstico:** 1.0.0

