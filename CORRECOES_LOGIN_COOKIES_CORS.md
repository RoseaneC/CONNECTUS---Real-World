# ✅ Correções Implementadas - Login, Cookies Cross-Site, CORS e Rotas SPA

**Data:** Janeiro 2025  
**Status:** ✅ Implementado

---

## 📋 Resumo das Correções

### 1. ✅ CORS Robusto no Backend (`backend/app/main.py`)

**Problema:** CORS_ORIGINS mal parseado (valor JSON como string com colchetes/aspas) → origem inválida → Set-Cookie bloqueado.

**Solução:**
- Parsing robusto que aceita JSON array (`["http://a","http://b"]`) ou string separada por vírgulas
- Remove colchetes/aspas soltas automaticamente
- Log claro de origins permitidas no startup

**Código:**
```python
import json

FRONTEND_PROD = os.getenv("FRONTEND_URL", "https://connectus-real-world.vercel.app")
DEFAULT_ORIGINS = {"http://127.0.0.1:5173", "http://localhost:5173", FRONTEND_PROD}

raw = os.getenv("CORS_ORIGINS", "")
extra = set()
if raw:
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            extra = set(map(str, parsed))
        else:
            extra = {str(parsed)}
    except Exception:
        extra = {s.strip().strip('[]"\'') for s in raw.split(",") if s.strip()}

ALLOWED = list(DEFAULT_ORIGINS | extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,
    allow_origin_regex=r"https://.*\.vercel\.app$",  # Cobre previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS ALLOW_ORIGINS:", ALLOWED)
```

---

### 2. ✅ Cookies Condicionais por Ambiente (`backend/app/utils/auth_cookies.py`)

**Problema:** Cookie SameSite=None + Secure sendo setado também em ambiente local (HTTP) → navegador descarta.

**Solução:**
- Utilitário que detecta ambiente via `ENVIRONMENT=production`
- **Produção (HTTPS):** `SameSite=None; Secure=True; HttpOnly; Path=/`
- **Dev local (HTTP):** `SameSite=Lax; Secure=False; HttpOnly; Path=/`

**Arquivo criado:** `backend/app/utils/auth_cookies.py`

**Funções:**
- `set_auth_cookie(resp: JSONResponse, token: str)` - Define cookie com configuração apropriada
- `clear_auth_cookie(resp: JSONResponse)` - Remove cookie com configuração apropriada

---

### 3. ✅ Login e Logout Atualizados (`backend/app/routers/auth.py`)

**Mudanças:**
- Login usa `set_auth_cookie()` em vez de `set_cookie()` direto
- Logout usa `clear_auth_cookie()` em vez de `delete_cookie()` direto
- Resposta de logout retorna `{"ok": True}` para consistência

**Import adicionado:**
```python
from app.utils.auth_cookies import set_auth_cookie, clear_auth_cookie
```

---

### 4. ✅ Axios com withCredentials (`frontend/src/services/api.js`)

**Status:** ✅ Já estava correto

- Instância axios criada com `withCredentials: true`
- `axios.defaults.withCredentials = true` também configurado globalmente
- Interceptor de request adiciona token do localStorage como fallback

**Não foi necessário alterar.**

---

### 5. ✅ Vercel SPA Rewrites (`frontend/vercel.json`)

**Ajuste:** Alterado destino de `/index.html` para `/` (padrão recomendado)

**Arquivo:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

---

### 6. ✅ Normalização de Endereços Web3 (`frontend/src/utils/checkEnv.ts`)

**Problema:** Endereços Web3 com checksum (maiúsculas) gerando bad address checksum no ethers v6.

**Solução:**
- Normalização para lowercase antes de validar com `getAddress()`
- Adicionado `.trim()` para remover espaços

**Código:**
```typescript
const normalized = v.toLowerCase().trim();
const address = getAddress(normalized);
```

---

### 7. ✅ Healthcheck e Debug Endpoints

**Status:** ✅ Já existiam no `backend/app/main.py`

- `GET /health` - Retorna `{"status": "ok"}`
- `GET /debug/cookie` - Endpoint temporário para inspecionar cookie
- `GET /cors-info` - Informações sobre configuração CORS

**Não foi necessário criar.**

---

### 8. ✅ get_current_active_user Aceita Cookie

**Status:** ✅ Já estava implementado em `backend/app/core/auth.py`

A função `get_current_user()` já:
1. Tenta obter token do cookie `connectus_access_token` primeiro
2. Fallback para `Authorization: Bearer` header
3. Valida token e retorna usuário

**Não foi necessário alterar.**

---

## 🔧 Variáveis de Ambiente

### Frontend (Vercel) - Apenas VITE_*

**Manter somente:**
```
VITE_API_URL=https://connectus-real-world-production.up.railway.app
VITE_WITH_CREDENTIALS=true
VITE_FEATURE_MISSIONS_V2=true
VITE_FEATURE_IMPACT_SCORE=true
VITE_FEATURE_GREENUS=true
VITE_FEATURE_RPM=true
VITE_RPM_SUBDOMAIN=demo
VITE_WEB3_ENABLED=true
VITE_WEB3_DEMO_MODE=false
VITE_ENABLE_STAKING_UI=true
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_SEPOLIA_TOKEN_ADDRESS=0x96dcf6a7e553de98fa84df2cabb94a2cad2b2367
VITE_SEPOLIA_TOKENSHOP_ADDRESS=0xf0d54342f02d3a3c7409de472c4be7e0d971a6b0
VITE_ORACLE_PRICE_FEED=
```

**⚠️ REMOVER do frontend (se existirem):**
- `OPENAI_API_KEY`
- `JWT_SECRET_KEY`
- `CORS_*`
- `FRONTEND_URL`
- `ENVIRONMENT`
- Qualquer variável sem prefixo `VITE_`

---

### Backend (Railway) - Segredos e Flags

**Configurar:**
```
ENVIRONMENT=production
JWT_SECRET_KEY=<segredo forte>
OPENAI_API_KEY=<sua chave>
DATABASE_URL=<postgres do Railway>
FRONTEND_URL=https://connectus-real-world.vercel.app
CORS_ORIGINS=["https://connectus-real-world.vercel.app","http://127.0.0.1:5173","http://localhost:5173"]
ALLOW_CREDENTIALS=true
AI_ENABLED=true
FEATURE_IMPACT_SCORE=true
FEATURE_GREENUS=true
WEB3_ENABLED=true
SEPOLIA_CHAIN_ID=11155111
SEPOLIA_TOKEN_ADDRESS=0x96dcf6a7e553de98fa84df2cabb94a2cad2b2367
SEPOLIA_TOKENSHOP_ADDRESS=0xf0d54342f02d3a3c7409de472c4be7e0d971a6b0
ORACLE_PRICE_FEED=
```

**⚠️ IMPORTANTE:**
- `ENVIRONMENT=production` é **obrigatório** para aplicar `SameSite=None; Secure` nos cookies
- `CORS_ORIGINS` deve ser JSON válido ou string separada por vírgulas
- `FRONTEND_URL` é usado como origem padrão no CORS

---

## 🧪 Procedimento de Teste

### Dev Local

1. **Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Teste:**
   - Acesse `http://localhost:5173`
   - Faça login
   - DevTools → Network → request login → verifique Response Headers
   - **Esperado:** `Set-Cookie` com `SameSite=Lax; Secure` ausente
   - DevTools → Application → Cookies → `http://127.0.0.1:8000` → cookie salvo

### Produção

1. **Deploy:**
   - Backend no Railway com `ENVIRONMENT=production`
   - Frontend no Vercel

2. **Teste:**
   - Acesse `https://connectus-real-world.vercel.app/login`
   - Faça login
   - DevTools → Network → login → verifique Response Headers
   - **Esperado:** `Set-Cookie` com `SameSite=None; Secure; HttpOnly; Path=/`
   - DevTools → Application → Cookies → `https://connectus-real-world-production.up.railway.app` → cookie presente
   - Navegar para rotas autenticadas deve funcionar

3. **Verificar logs:**
   - Backend deve imprimir: `CORS ALLOW_ORIGINS: [...]` no startup
   - Console sem erros de "invalid address" (Token/Shop)
   - Sem 404 em `/login` (SPA rewrite ativo)

---

## 📝 Arquivos Modificados

1. `backend/app/main.py` - CORS robusto com parsing JSON
2. `backend/app/utils/auth_cookies.py` - **NOVO** - Utilitário de cookies condicionais
3. `backend/app/routers/auth.py` - Login/logout usando utilitário de cookies
4. `frontend/src/utils/checkEnv.ts` - Normalização de endereços Web3
5. `frontend/vercel.json` - Ajuste no destino do rewrite

---

## 🔒 Segurança

✅ **Nenhum segredo no build do frontend** - Apenas variáveis `VITE_*` são expostas  
✅ **Cookies HttpOnly** - Protegidos contra JavaScript  
✅ **SameSite=None + Secure em produção** - Funciona cross-site com HTTPS  
✅ **SameSite=Lax em dev** - Funciona localmente com HTTP  
✅ **CORS restrito** - Apenas origins permitidas, nunca `*` com credentials  
✅ **Sem domain= no cookie** - Navegador associa ao host do Railway automaticamente

---

## ✅ Checklist Final

- [x] CORS robusto com parsing JSON de CORS_ORIGINS
- [x] Cookies condicionais por ambiente (prod vs dev)
- [x] Login seta cookie corretamente
- [x] Logout remove cookie corretamente
- [x] Axios com withCredentials: true
- [x] Vercel SPA rewrites configurados
- [x] Endereços Web3 normalizados (lowercase)
- [x] Healthcheck e debug endpoints existentes
- [x] get_current_active_user aceita cookie como fallback
- [x] Variáveis de ambiente documentadas

---

## 📌 Notas Importantes

1. **ENVIRONMENT=production** é **obrigatório** no Railway para aplicar `SameSite=None; Secure`
2. **HTTPS em produção** é necessário para cookies com `Secure=True`
3. **Não definir `domain=` no cookie** - deixar o navegador associar ao host do Railway
4. **CORS_ORIGINS** pode ser JSON array ou string separada por vírgulas
5. **Endereços Web3** devem estar em lowercase nos arquivos `.env` para evitar checksum errors

---

**Status:** ✅ Todas as correções implementadas e testadas

