# ✅ Checklist Pós-Deploy - ConnectUS

## 🔍 Verificação de Cookies Cross-Site

### 1. Teste de Login

1. Abra o DevTools (F12) → **Network**
2. Faça login na aplicação
3. Procure pela requisição `POST /auth/login`
4. Verifique o **Response Headers**:
   ```
   Set-Cookie: connectus_access_token=...; Path=/; Secure; SameSite=None; HttpOnly
   ```
5. ✅ O cookie deve ter:
   - `Secure` (obrigatório em HTTPS)
   - `SameSite=None` (obrigatório para cross-site)
   - `HttpOnly` (segurança)

### 2. Verificação de Cookie Salvo

1. DevTools → **Application** → **Cookies**
2. Selecione o domínio do Railway: `connectus-real-world-production.up.railway.app`
3. ✅ Deve aparecer o cookie `connectus_access_token`
4. Verifique os atributos:
   - ✅ HttpOnly: ✓
   - ✅ Secure: ✓
   - ✅ SameSite: None

### 3. Teste de Sessão Mantida

1. Após login, navegue para outra rota (ex: `/dashboard`, `/missions`)
2. Abra DevTools → **Network**
3. Verifique requisições para `/auth/me` ou outras rotas autenticadas
4. ✅ As requisições devem ter sucesso (200 OK)
5. ✅ O cookie deve ser enviado automaticamente (verifique em **Request Headers** → `Cookie`)

### 4. Teste de Logout

1. Faça logout
2. Verifique a requisição `POST /auth/logout`
3. ✅ O cookie deve ser deletado (verifique em **Response Headers**)

---

## 🌐 Verificação de CORS

### 1. Verificar Headers CORS

1. DevTools → **Network**
2. Faça qualquer requisição ao backend
3. Verifique **Response Headers**:
   ```
   Access-Control-Allow-Origin: https://connectus-real-world.vercel.app
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: *
   Access-Control-Allow-Headers: *
   ```
4. ✅ `Access-Control-Allow-Credentials` deve ser `true`
5. ✅ `Access-Control-Allow-Origin` deve ser o domínio do frontend (não `*`)

### 2. Teste com Preview do Vercel

1. Crie um preview deployment no Vercel
2. Acesse o preview (ex: `https://connectus-real-world-git-branch.vercel.app`)
3. Tente fazer login
4. ✅ Deve funcionar (o regex `https://.*\.vercel\.app$` cobre previews)

---

## 🔧 Verificação de Variáveis de Ambiente

### Frontend (Vercel)

1. Vercel Dashboard → Projeto → **Settings** → **Environment Variables**
2. ✅ Verifique que TODAS as variáveis começam com `VITE_`
3. ✅ Remova qualquer variável que não comece com `VITE_` (especialmente segredos)
4. ✅ `VITE_API_URL` deve apontar para o Railway
5. ✅ `VITE_WITH_CREDENTIALS=true`

### Backend (Railway)

1. Railway Dashboard → Projeto → **Variables**
2. ✅ `JWT_SECRET_KEY` está configurado (não vazio)
3. ✅ `OPENAI_API_KEY` está configurado
4. ✅ `DATABASE_URL` aponta para o PostgreSQL
5. ✅ `FRONTEND_URL` aponta para o Vercel
6. ✅ `CORS_ORIGINS` inclui o domínio do frontend
7. ✅ `ALLOW_CREDENTIALS=true`

---

## 🧪 Testes de Endpoints

### 1. Health Check

```bash
curl https://connectus-real-world-production.up.railway.app/health
```

✅ Deve retornar: `{"status": "ok"}`

### 2. Debug Cookie (Temporário)

```bash
curl -v https://connectus-real-world-production.up.railway.app/debug/cookie \
  -H "Cookie: connectus_access_token=seu_token_aqui"
```

✅ Deve retornar informações sobre o cookie

**⚠️ IMPORTANTE**: Remova este endpoint após validação!

### 3. Login

```bash
curl -X POST https://connectus-real-world-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://connectus-real-world.vercel.app" \
  -d '{"nickname": "teste", "password": "senha"}' \
  -v
```

✅ Verifique o header `Set-Cookie` na resposta

---

## 🐛 Troubleshooting

### Cookie não aparece no DevTools

**Possíveis causas:**
1. ❌ Request não é HTTPS
2. ❌ Cookie não tem `Secure=True`
3. ❌ Cookie não tem `SameSite=None`
4. ❌ Domínios não correspondem

**Solução:**
- Verifique que está usando HTTPS
- Confirme que o cookie tem `Secure` e `SameSite=None`
- Verifique CORS está configurado corretamente

### Erro de CORS

**Possíveis causas:**
1. ❌ Origin não está na lista de permitidos
2. ❌ `allow_credentials` não está `True`
3. ❌ Regex de previews não está funcionando

**Solução:**
- Verifique `CORS_ORIGINS` no Railway
- Confirme `allow_origin_regex` no código
- Verifique logs do backend no startup

### Sessão não mantém após login

**Possíveis causas:**
1. ❌ Cookie não está sendo enviado
2. ❌ `withCredentials` não está `true` no Axios
3. ❌ Token não está sendo lido do cookie no backend

**Solução:**
- Verifique `withCredentials: true` no `api.js`
- Confirme que `get_current_user` lê do cookie
- Verifique logs do backend

### Erro "Invalid address" no Web3

**Causa:** Endereços em maiúsculas (checksum)

**Solução:**
- Já corrigido: endereços agora em minúsculas
- Verifique variáveis `VITE_SEPOLIA_*` no Vercel

---

## 📝 Logs Úteis

### Frontend (Console)

```javascript
[CONNECTUS] BaseURL: https://connectus-real-world-production.up.railway.app/ | withCredentials (env→bool): true
[WEB3_CONFIG] ✅ Configuração válida
[FEATURES] ... Effective FEATURE_IMPACT = true
[FEATURES] ... Effective FEATURE_GREEN = true
```

### Backend (Railway Logs)

```
🌐 CORS configurado para X origin(s) + regex para previews Vercel:
   1. http://127.0.0.1:5173
   2. https://connectus-real-world.vercel.app
🚀 Servidor iniciando em: http://127.0.0.1:8000
✅ Banco de dados inicializado com sucesso!
```

---

## ✅ Critérios de Aceite Final

- [ ] Cookie `connectus_access_token` aparece no DevTools após login
- [ ] Cookie tem `Secure`, `SameSite=None`, `HttpOnly`
- [ ] Sessão mantém após navegação (rota `/me` funciona)
- [ ] Logout remove o cookie
- [ ] CORS permite requisições do frontend
- [ ] Preview deployments do Vercel funcionam
- [ ] Nenhum segredo no build do frontend
- [ ] Sem erros de Web3 no console
- [ ] Rotas SPA não retornam 404 (rewrites funcionando)

---

## 🎯 Próximos Passos

1. ✅ Validar todos os itens acima
2. ✅ Remover endpoint `/debug/cookie` após validação
3. ✅ Monitorar logs por 24h
4. ✅ Testar em diferentes browsers
5. ✅ Documentar qualquer problema encontrado

