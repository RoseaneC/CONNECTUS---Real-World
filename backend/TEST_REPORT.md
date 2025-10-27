# 📊 ConnectUS Test Report

**Data**: _______________  
**Ambiente**: Windows / Local  
**Backend**: http://127.0.0.1:8000  
**Frontend**: http://localhost:5174

---

## 🔧 Ambiente

### Versões
- Python: _______________
- Node.js: _______________
- Chrome/Firefox: _______________

### Variáveis de Ambiente Verificadas
```bash
# Backend (.env)
# - DATABASE_URL: _______________
# - OPENAI_API_KEY: [configurado]
# - SECRET_KEY: [configurado]

# Frontend (.env.local)
# - VITE_API_URL: http://127.0.0.1:8000
# - VITE_FEATURE_RPM: true
```

---

## 🧪 Smoke Tests (Backend)

Execute: `python scripts/smoke_backend.py`

### Saída:
```
=========================================================
ConnectUS Backend Smoke Tests
=========================================================

[OK]  /public/feature-flags (45ms) - rpm=True
[OK]  /auth/login (120ms) - token obtido
[OK]  /auth/me (50ms) - user: roseane
[OK]  /avatars (55ms) - current: ['glb_url', 'png_url']
[OK]  /missions (60ms) - items: 3
[OK]  /posts/timeline (70ms) - posts: 2

=========================================================
 Resultado: 6/6 testes passaram
=========================================================
```

### Resultado: [ ] PASS [ ] FAIL

---

## ✅ Checklist Manual (Frontend)

### 1. Login/Autenticação
- [ ] Abrir http://localhost:5174/login
- [ ] Console (F12) sem erros vermelhos
- [ ] Login com roseane/123456
- [ ] Redireciona para /dashboard

**Observação**: _____________________________________________

### 2. Perfil + Ready Player Me
- [ ] Abrir /profile
- [ ] Avatar PNG exibido OU "sem avatar"
- [ ] Botão "Editar avatar 3D (RPM)" visível
- [ ] Clicar no botão → modal RPM abre
- [ ] Fechar modal → sem erros no console

**Screenshot**: [ ] Adicionar captura

### 3. Timeline
- [ ] Abrir /timeline
- [ ] Console (F12) sem erros
- [ ] Posts carregados
- [ ] Criar post funciona

**Observação**: _____________________________________________

### 4. Missões
- [ ] Abrir /missions ou dashboard
- [ ] Missões diárias listadas
- [ ] Abrir uma missão específica
- [ ] Sistema de recompensas funciona

**Observação**: _____________________________________________

### 5. Ranking
- [ ] Abrir /ranking
- [ ] Rankings carregados
- [ ] Visualização OK

**Observação**: _____________________________________________

### 6. Chat
- [ ] Abrir /chat
- [ ] Salas listadas (pode estar vazio)
- [ ] Sem erros no console

**Observação**: _____________________________________________

---

## 🎯 Resultado Final

### Backend Smoke Tests
- **Total**: 6 testes
- **Passou**: _______
- **Falhou**: _______

### Frontend Manual
- **Total**: 6 categorias
- **Passou**: _______
- **Falhou**: _______

### GuardRail
- [ ] Bloqueio de arquivos protegidos funcionando
- [ ] Teste de modificação bloqueada: [ ] OK

---

## 📝 Observações

```
_________________________________________________________
_________________________________________________________
_________________________________________________________
_________________________________________________________
_________________________________________________________
_________________________________________________________
```

---

## 📸 Screenshots

### Erros Encontrados:
- [ ] Nenhum erro
- [ ] Incluir prints abaixo

_________________________________________________________
_________________________________________________________

### Funcionalidades Testadas:
- [ ] Login
- [ ] Profile + RPM
- [ ] Timeline
- [ ] Missões
- [ ] Ranking
- [ ] Chat

---

## ✅ Conclusão

- **Status Geral**: [ ] OPERACIONAL [ ] COM PROBLEMAS
- **Pronto para Produção**: [ ] SIM [ ] NÃO

**Assinatura**: _______________  
**Data**: _______________

