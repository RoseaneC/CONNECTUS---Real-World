# Variáveis de Ambiente - ConnectUS

## 📋 Frontend (Vercel)

**IMPORTANTE**: No Vercel, mantenha APENAS variáveis que começam com `VITE_*`. Todas as outras devem ser removidas.

### Variáveis Obrigatórias

```bash
VITE_API_URL=https://connectus-real-world-production.up.railway.app
VITE_WITH_CREDENTIALS=true
```

### Variáveis de Features (Opcionais)

```bash
VITE_FEATURE_MISSIONS_V2=true
VITE_FEATURE_IMPACT_SCORE=true
VITE_FEATURE_GREENUS=true
VITE_FEATURE_RPM=true
VITE_RPM_SUBDOMAIN=demo
VITE_WEB3_ENABLED=true
VITE_WEB3_DEMO_MODE=false
VITE_ENABLE_STAKING_UI=true
```

### Variáveis Web3 (Opcionais)

```bash
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_SEPOLIA_TOKEN_ADDRESS=0x96dcf6a7e553de98fa84df2cabb94a2cad2b2367
VITE_SEPOLIA_TOKENSHOP_ADDRESS=0xf0d54342f02d3a3c7409de472c4be7e0d971a6b0
VITE_ORACLE_PRICE_FEED=
```

### ❌ Variáveis que DEVEM ser REMOVIDAS do Vercel

Estas variáveis são segredos e pertencem APENAS ao backend:

- `OPENAI_API_KEY`
- `JWT_SECRET_KEY`
- `CORS_*`
- `FRONTEND_URL`
- `ENVIRONMENT`
- `DATABASE_URL`
- Qualquer outra que não comece com `VITE_`

---

## 🔒 Backend (Railway)

### Variáveis Obrigatórias

```bash
ENVIRONMENT=production
JWT_SECRET_KEY=<segredo-forte-aleatório>
OPENAI_API_KEY=<sua-chave-openai>
DATABASE_URL=<postgres-url-do-railway>
FRONTEND_URL=https://connectus-real-world.vercel.app
```

### Variáveis CORS

```bash
CORS_ORIGINS=https://connectus-real-world.vercel.app,http://127.0.0.1:5173
ALLOW_CREDENTIALS=true
```

### Variáveis de Features

```bash
AI_ENABLED=true
FEATURE_IMPACT_SCORE=true
FEATURE_GREENUS=true
WEB3_ENABLED=true
```

### Variáveis Web3

```bash
SEPOLIA_CHAIN_ID=11155111
SEPOLIA_TOKEN_ADDRESS=0x96dcf6a7e553de98fa84df2cabb94a2cad2b2367
SEPOLIA_TOKENSHOP_ADDRESS=0xf0d54342f02d3a3c7409de472c4be7e0d971a6b0
ORACLE_PRICE_FEED=
```

### Variáveis Opcionais

```bash
ENABLE_WEB3_DEMO_MODE=1  # Se quiser habilitar modo demo
DEBUG=0  # Desabilitar em produção
```

---

## ✅ Checklist de Verificação

### No Vercel (Frontend)

- [ ] Todas as variáveis começam com `VITE_`
- [ ] `VITE_API_URL` aponta para o backend do Railway
- [ ] `VITE_WITH_CREDENTIALS=true`
- [ ] Nenhum segredo (OPENAI_API_KEY, JWT_SECRET_KEY) presente
- [ ] Variáveis de features configuradas conforme necessário

### No Railway (Backend)

- [ ] `JWT_SECRET_KEY` é um segredo forte e aleatório
- [ ] `OPENAI_API_KEY` está configurada
- [ ] `DATABASE_URL` aponta para o banco PostgreSQL do Railway
- [ ] `FRONTEND_URL` aponta para o domínio do Vercel
- [ ] `CORS_ORIGINS` inclui o domínio do frontend
- [ ] `ALLOW_CREDENTIALS=true`

---

## 🔍 Como Verificar

### Frontend (Console do Browser)

Após o deploy, abra o console e verifique:

```javascript
// Deve aparecer algo como:
[CONNECTUS] BaseURL: https://connectus-real-world-production.up.railway.app/ | withCredentials (env→bool): true
[WEB3_CONFIG] ✅ Configuração válida
[FEATURES] ... Effective FEATURE_IMPACT = true
```

### Backend (Logs do Railway)

Verifique os logs no startup:

```
🌐 CORS configurado para X origin(s) + regex para previews Vercel:
   1. http://127.0.0.1:5173
   2. https://connectus-real-world.vercel.app
```

---

## ⚠️ Notas Importantes

1. **Nunca** coloque segredos no frontend (Vercel)
2. **Sempre** use HTTPS em produção
3. **Cookies cross-site** requerem `Secure=True` e `SameSite=None`
4. **CORS** deve ter `allow_credentials=True` quando usar cookies
5. **Regex de previews** do Vercel: `https://.*\.vercel\.app$`

