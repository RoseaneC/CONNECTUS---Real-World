# 🧪 Como Testar o Impact Score (Debug Dirigido)

**Data:** 27 de Janeiro de 2025  
**Status:** ✅ PRONTO PARA TESTE

---

## 🎯 Objetivo

Garantir que a aba "Impact Score" apareça na Sidebar e funcione com debug completo.

---

## 🚀 Passo a Passo

### 1. Verificar Feature Flag

```bash
# Verificar se flag existe
cat frontend/.env.local | grep VITE_FEATURE_IMPACT_SCORE

# Se não existir, criar:
echo "VITE_FEATURE_IMPACT_SCORE=true" >> frontend/.env.local
```

### 2. Reiniciar Dev Server

```bash
# Parar servidor (Ctrl+C)
# Reiniciar
cd frontend
npm run dev
```

### 3. Abrir Navegador

```
http://localhost:5173
```

### 4. Verificar Console (DevTools)

Você deve ver os logs:

```
[FEATURES] =================================
[FEATURES] VITE_FEATURE_IMPACT_SCORE = true | via .env
[FEATURES] debugImpact param         = false
[FEATURES] Effective FEATURE_IMPACT  = true
[FEATURES] =================================
[DEBUG App] FEATURE_IMPACT = true
[DEBUG Sidebar] FEATURE_IMPACT = true
```

### 5. Verificar Sidebar

- Deve aparecer item "Impact Score"
- Com ícone 📈
- Link para `/impact`

### 6. Testar com Debug Mode (Forçar)

```
http://localhost:5173/?debugImpact=1
```

**Console deve mostrar:**
```
[FEATURES] debugImpact param = true
[FEATURES] Effective FEATURE_IMPACT = true
```

**Sidebar deve mostrar:**
- Item "Impact Score" aparece (mesmo sem flag)

### 7. Testar Rota

- Clicar em "Impact Score"
- OU acessar: `http://localhost:5173/impact`
- Página deve carregar
- Título "Impact Score" visível

---

## 🐛 Troubleshooting

### Problema: Item não aparece

**Solução 1:** Verificar flag

```bash
echo $VITE_FEATURE_IMPACT_SCORE
# Deve retornar: true
```

**Solução 2:** Forçar com debug

```
http://localhost:5173/?debugImpact=1
```

**Solução 3:** Ver logs no console

Deve mostrar `FEATURE_IMPACT = true`

### Problema: Erro de import

```bash
# Verificar se arquivo existe
ls frontend/src/hooks/useFeatures.jsx
```

### Problema: Rota 404

```bash
# Verificar App.jsx tem AppRoutes
grep "AppRoutes" frontend/src/App.jsx
```

---

## ✅ Checklist

- [ ] Feature flag ativa no `.env.local`
- [ ] Dev server reiniciado
- [ ] Logs aparecem no console
- [ ] Item aparece na Sidebar
- [ ] Rota `/impact` funciona
- [ ] Debug mode (`?debugImpact=1`) funciona

---

## 🎉 Resultado Esperado

1. **Console mostra logs `[FEATURES]` e `[DEBUG]`**
2. **Sidebar tem item "Impact Score"**
3. **Rota `/impact` carrega página**
4. **Debug mode força exibição**

---

**🚀 Impact Score com debug completo pronto para testar!**


