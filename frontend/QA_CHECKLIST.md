# ✅ QA Checklist - ConnectUS Frontend

**Guia passo-a-passo para teste manual**  
**Backend deve estar rodando em http://127.0.0.1:8000**

---

## 🔧 Pré-Requisitos

- [ ] Backend rodando (`cd backend && python -m uvicorn app.main:app`)
- [ ] Frontend rodando (`cd frontend && npm run dev`)
- [ ] Navegador aberto em http://localhost:5174
- [ ] Console JavaScript aberto (F12)

---

## 1️⃣ Teste de Login

### Passos:
1. Acesse: http://localhost:5174/login
2. Console (F12) deve estar SEM erros vermelhos
   - ⚠️ Permite avisos do React Router (v7 future flags)

### O que observar:
- [ ] Formulário de login aparece
- [ ] Console limpo (sem "TypeError", "ReferenceError")
- [ ] Campo nickname e password visíveis

### Erro comum:
- ❌ "isAuthenticated is not a function" → Já corrigido
- ❌ "Network Error" → Backend não está rodando

**Status**: [ ] ✅ PASSOU [ ] ❌ FALHOU

**Notas**: _________________________________________

---

## 2️⃣ Login Funcional

### Passos:
1. Preencher nickname: `roseane`
2. Preencher password: `123456`
3. Clicar em "Entrar"
4. Aguardar redirecionamento

### O que observar:
- [ ] Botão "Entrar" muda para "Carregando..."
- [ ] Redireciona para /dashboard
- [ ] Console SEM erro "Failed to load resource"
- [ ] Header mostra nome do usuário

### Erro comum:
- ❌ "401 Unauthorized" → Credenciais incorretas
- ❌ "CORS policy" → Backend sem CORS configurado

**Status**: [ ] ✅ PASSOU [ ] ❌ FALHOU

**Notas**: _________________________________________

---

## 3️⃣ Perfil + Ready Player Me

### Passos:
1. Após login, ir para /profile
2. Verificar seção "Meu Avatar (Ready Player Me)"
3. Clicar em "Criar/Editar meu avatar"
4. Aguardar modal abrir
5. Fechar modal (clicar X)

### O que observar:
- [ ] Avatar PNG aparece OU "sem avatar"
- [ ] Botão "Criar/Editar meu avatar" visível
- [ ] Modal RPM abre (iframe do readyplayer.me)
- [ ] Fechar modal não causa erro
- [ ] Console SEM "Cannot read property..."

### Erro comum:
- ❌ "RPM flag: undefined" → VITE_FEATURE_RPM não configurado
- ❌ Modal não abre → CORS ou iframe bloqueado

**Status**: [ ] ✅ PASSOU [ ] ❌ FALHOU

**Screenshot**: [ ] Adicionar captura de tela

---

## 4️⃣ Timeline (Posts)

### Passos:
1. Abrir /timeline
2. Verificar posts na timeline
3. (Opcional) Criar um post

### O que observar:
- [ ] Timeline carrega sem erro
- [ ] Console (F12) sem "Network Error"
- [ ] Posts aparecem (pode estar vazio)
- [ ] Formulário de criar post funciona

### Erro comum:
- ❌ Timeline vazia → Banquete de dados não populado
- ❌ "401 Not authenticated" → Token expirado

**Status**: [ ] ✅ PASSOU [ ] ❌ FALHOU

**Notas**: _________________________________________

---

## 5️⃣ Missões

### Passos:
1. Ir para /missions OU ver missões no dashboard
2. Abrir uma missão específica
3. Ver sistema de recompensas

### O que observar:
- [ ] Missões listadas
- [ ] Missões do dia aparecem
- [ ] Botão "Validar" funcional (se aplicável)
- [ ] Console sem erros de API

### Erro comum:
- ❌ "OperationalError: no such table: missions" → Schema não criado
- ❌ Missões não aparecem → Dados de seed não rodados

**Status**: [ ] ✅ PASSOU [ ] ❌ FALHOU

---

## 6️⃣ Ranking

### Passos:
1. Abrir /ranking
2. Ver rankings por XP/tokens

### O que observar:
- [ ] Ranking carrega
- [ ] Lista de usuários ordenada
- [ ] Nenhum erro no console

**Status**: [ ] ✅ PASSOU [ ] ❌ FALHOU

---

## 7️⃣ Chat

### Passos:
1. Abrir /chat
2. Ver lista de salas

### O que observar:
- [ ] Salas listadas (pode estar vazio)
- [ ] Interface de chat funcional
- [ ] Console limpo

**Status**: [ ] ✅ PASSOU [ ] ❌ FALHOU

---

## 📊 Resultado Final

### Total de Testes: 7
### Passou: _____ / 7
### Falhou: _____ / 7

### Funcionalidades Críticas:
- [ ] Login funcional
- [ ] RPM modal abre e fecha
- [ ] Timeline carrega
- [ ] Missões aparecem
- [ ] Ranking funciona
- [ ] Chat funciona

---

## 🐛 Bugs Encontrados

| # | Descrição | Severidade | Status |
|---|-----------|------------|--------|
|   |           |            |        |
|   |           |            |        |

---

## ✅ Conclusão

- **Frontend Funcional**: [ ] SIM [ ] NÃO  
- **Regressões Detectadas**: [ ] SIM [ ] NÃO  
- **Pronto para Uso**: [ ] SIM [ ] NÃO

**Testador**: _______________  
**Data**: _______________

---

## 📝 Notas Finais

```
_________________________________________________________
_________________________________________________________
_________________________________________________________
_________________________________________________________
```

