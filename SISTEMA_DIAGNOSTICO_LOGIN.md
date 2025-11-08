# 🔍 Sistema de Diagnóstico de Login - ConnectUS

**Data:** Janeiro 2025  
**Status:** ✅ Implementado

---

## 📋 Resumo

Sistema completo de diagnóstico para rastrear e debugar problemas de login no backend FastAPI do ConnectUS. Inclui middleware de logging, logs detalhados no endpoint de login, endpoint de debug e script de teste.

---

## ✅ Implementações

### 1. Middleware Global de Logging (`backend/app/main.py`)

**Classe:** `LogLoginRequestsMiddleware`

**Funcionalidades:**
- Intercepta todas as requisições POST para `/auth/login`
- Registra:
  - Método HTTP e path
  - IP do cliente
  - Body da requisição (senha truncada para segurança)
  - Headers principais (origin, referer, user-agent, content-type)
  - Status code da resposta
  - Tempo de resposta (usando `time.perf_counter()`)

**Exemplo de log:**
```
2025-01-XX XX:XX:XX - root - INFO - [AUTH] login_request method=POST path=/auth/login ip=127.0.0.1
2025-01-XX XX:XX:XX - root - INFO - [AUTH] login_request body={"nickname":"roseane","password":"********"}
2025-01-XX XX:XX:XX - root - INFO - [AUTH] login_request headers={'origin': 'http://localhost:5173', ...}
2025-01-XX XX:XX:XX - root - INFO - [AUTH] login_response status=200 duration=0.34s
```

---

### 2. Logs Detalhados no Endpoint de Login (`backend/app/routers/auth.py`)

**Logger:** `logging.getLogger("auth")` com nível `INFO`

**Logs adicionados:**
- `[AUTH] login_try ident={nickname}` - Tentativa de login iniciada
- `[AUTH] login_fail reason=user_not_found` - Usuário não encontrado
- `[AUTH] login_user_found user_id={id} nickname={nick} is_active={bool}` - Usuário encontrado
- `[AUTH] login_fail reason=user_inactive` - Usuário inativo
- `[AUTH] login_token_created user_id={id} token_len={len}` - Token criado
- `[AUTH] login_cookie_set user_id={id} success={bool}` - Cookie setado (ou não)
- `[AUTH] login_success user_id={id} nickname={nick}` - Login bem-sucedido

**Exemplo de fluxo completo:**
```
[AUTH] login_try ident=roseane
[AUTH] authenticate_user identifier=roseane
[AUTH] authenticate_user_found user_id=1 is_active=True
[AUTH] authenticate_user_success user_id=1
[AUTH] login_user_found user_id=1 nickname=roseane is_active=True
[AUTH] login_token_created user_id=1 token_len=180
[AUTH] login_cookie_set user_id=1 success=True
[AUTH] login_success user_id=1 nickname=roseane
```

---

### 3. Logs na Função de Autenticação (`backend/app/core/auth.py`)

**Logs adicionados em `authenticate_user()`:**
- `[AUTH] authenticate_user identifier={nickname}` - Início da autenticação
- `[AUTH] authenticate_user_fail reason=user_not_found` - Usuário não encontrado
- `[AUTH] authenticate_user_found user_id={id} is_active={bool}` - Usuário encontrado
- `[AUTH] authenticate_user_fail reason=invalid_password` - Senha inválida
- `[AUTH] authenticate_user_success user_id={id}` - Autenticação bem-sucedida

---

### 4. Endpoint de Debug (`backend/app/routers/auth.py`)

**Endpoint:** `GET /auth/debug-cookie`

**Funcionalidade:**
- Retorna informações sobre o cookie `connectus_access_token`
- Útil para testar se o cookie foi definido corretamente

**Resposta:**
```json
{
  "cookie": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cookie_present": true,
  "cookie_length": 180
}
```

**Uso:**
```bash
# Com cookie
curl -H "Cookie: connectus_access_token=..." http://127.0.0.1:8000/auth/debug-cookie

# Sem cookie
curl http://127.0.0.1:8000/auth/debug-cookie
```

---

### 5. Configuração de Logging (`backend/app/main.py`)

**Configuração básica no startup:**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

**Resultado:**
- Todos os logs seguem o formato padrão
- Timestamp, nome do logger, nível e mensagem
- Fácil de filtrar e analisar

---

### 6. Script de Teste (`backend/scripts/test_login.py`)

**Funcionalidades:**
- Faz POST para `/auth/login` com credenciais
- Mostra status code, corpo da resposta e header Set-Cookie
- Testa `/auth/debug-cookie` com o cookie recebido
- Suporta argumentos de linha de comando

**Uso:**
```bash
# Teste padrão (roseane/123456)
python scripts/test_login.py

# Teste com credenciais customizadas
python scripts/test_login.py --nickname usuario --password senha123

# Teste com URL customizada
python scripts/test_login.py --url http://localhost:8000
```

**Exemplo de saída:**
```
============================================================
🧪 TESTE DE LOGIN - ConnectUS
============================================================
Backend URL: http://127.0.0.1:8000
Nickname: roseane
Password: ******

📤 Fazendo POST para /auth/login...

✅ Status Code: 200
📄 Response Body:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 3600
}

🍪 Set-Cookie Header:
connectus_access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; SameSite=Lax

============================================================
🍪 Testando /auth/debug-cookie com cookie recebido...
============================================================
✅ Cookie extraído: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ Status Code: 200
📄 Response Body:
{
  "cookie": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cookie_present": true,
  "cookie_length": 180
}

✅ SUCESSO: Cookie foi recebido corretamente pelo backend!
```

---

## 📊 Exemplos de Logs em Produção (Railway)

### Login Bem-Sucedido
```
2025-01-XX 10:30:15 - root - INFO - [AUTH] login_request method=POST path=/auth/login ip=192.168.1.1
2025-01-XX 10:30:15 - root - INFO - [AUTH] login_request body={"nickname":"roseane","password":"********"}
2025-01-XX 10:30:15 - auth - INFO - [AUTH] login_try ident=roseane
2025-01-XX 10:30:15 - auth - INFO - [AUTH] authenticate_user identifier=roseane
2025-01-XX 10:30:15 - auth - INFO - [AUTH] authenticate_user_found user_id=1 is_active=True
2025-01-XX 10:30:15 - auth - INFO - [AUTH] authenticate_user_success user_id=1
2025-01-XX 10:30:15 - auth - INFO - [AUTH] login_user_found user_id=1 nickname=roseane is_active=True
2025-01-XX 10:30:15 - auth - INFO - [AUTH] login_token_created user_id=1 token_len=180
2025-01-XX 10:30:15 - auth - INFO - [AUTH] login_cookie_set user_id=1 success=True
2025-01-XX 10:30:15 - auth - INFO - [AUTH] login_success user_id=1 nickname=roseane
2025-01-XX 10:30:15 - root - INFO - [AUTH] login_response status=200 duration=0.34s
```

### Login com Credenciais Inválidas
```
2025-01-XX 10:31:20 - root - INFO - [AUTH] login_request method=POST path=/auth/login ip=192.168.1.1
2025-01-XX 10:31:20 - root - INFO - [AUTH] login_request body={"nickname":"usuario_inexistente","password":"********"}
2025-01-XX 10:31:20 - auth - INFO - [AUTH] login_try ident=usuario_inexistente
2025-01-XX 10:31:20 - auth - INFO - [AUTH] authenticate_user identifier=usuario_inexistente
2025-01-XX 10:31:20 - auth - WARNING - [AUTH] authenticate_user_fail reason=user_not_found identifier=usuario_inexistente
2025-01-XX 10:31:20 - auth - WARNING - [AUTH] login_fail reason=user_not_found ident=usuario_inexistente
2025-01-XX 10:31:20 - root - INFO - [AUTH] login_response status=401 duration=0.12s
```

### Login com Senha Incorreta
```
2025-01-XX 10:32:10 - root - INFO - [AUTH] login_request method=POST path=/auth/login ip=192.168.1.1
2025-01-XX 10:32:10 - auth - INFO - [AUTH] login_try ident=roseane
2025-01-XX 10:32:10 - auth - INFO - [AUTH] authenticate_user identifier=roseane
2025-01-XX 10:32:10 - auth - INFO - [AUTH] authenticate_user_found user_id=1 is_active=True
2025-01-XX 10:32:10 - auth - WARNING - [AUTH] authenticate_user_fail reason=invalid_password user_id=1
2025-01-XX 10:32:10 - auth - WARNING - [AUTH] login_fail reason=user_not_found ident=roseane
2025-01-XX 10:32:10 - root - INFO - [AUTH] login_response status=401 duration=0.15s
```

---

## 🧪 Como Usar

### 1. Teste Local

```bash
# Iniciar backend
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Em outro terminal, rodar script de teste
python scripts/test_login.py
```

### 2. Ver Logs em Produção (Railway)

1. Acesse o dashboard do Railway
2. Vá para a aba "Logs"
3. Filtre por `[AUTH]` para ver apenas logs de autenticação
4. Monitore tentativas de login em tempo real

### 3. Testar Endpoint de Debug

```bash
# Com cookie (após login bem-sucedido)
curl -H "Cookie: connectus_access_token=SEU_TOKEN_AQUI" \
  http://127.0.0.1:8000/auth/debug-cookie

# Sem cookie
curl http://127.0.0.1:8000/auth/debug-cookie
```

---

## 📝 Arquivos Modificados

1. `backend/app/main.py`
   - Adicionado logging básico
   - Criado middleware `LogLoginRequestsMiddleware`
   - Middleware adicionado à aplicação

2. `backend/app/routers/auth.py`
   - Logger específico para autenticação
   - Logs detalhados no endpoint de login
   - Endpoint `/auth/debug-cookie` adicionado

3. `backend/app/core/auth.py`
   - Logs na função `authenticate_user()`

4. `backend/scripts/test_login.py`
   - **NOVO** - Script de teste completo

---

## 🔒 Segurança

✅ **Senha truncada nos logs** - Apenas `********` é exibido  
✅ **Token truncado no script** - Apenas primeiros 20 caracteres  
✅ **Endpoint de debug temporário** - Pode ser removido após validação  
✅ **Logs não expõem dados sensíveis** - Apenas informações necessárias para diagnóstico

---

## ✅ Checklist

- [x] Middleware global para logar POST /auth/login
- [x] Logs detalhados no endpoint de login
- [x] Logs na função de autenticação
- [x] Endpoint /auth/debug-cookie
- [x] Configuração de logging básico
- [x] Script de teste test_login.py
- [x] Medição de tempo de resposta
- [x] Log de IP do cliente
- [x] Log de headers principais
- [x] Truncamento de senha nos logs

---

## 💡 Próximos Passos

1. **Monitorar logs em produção** - Verificar padrões de falha
2. **Ajustar nível de log** - Se necessário, mudar para DEBUG em dev
3. **Remover endpoint de debug** - Após validação completa
4. **Adicionar métricas** - Contar tentativas de login por IP/hora

---

**Status:** ✅ Sistema completo de diagnóstico implementado e pronto para uso

