# 🐛 Debug Impact Score - Guia Completo

**Data:** 27 de Janeiro de 2025  
**Status:** ✅ IMPLEMENTADO COM DEBUG

---

## 🎯 Objetivo

Fazer a aba "Impact Score" aparecer na Sidebar e a rota funcionar, com logs para entender a flag.

---

## 📝 Arquivos Modificados/Criados

### ✅ Novos Arquivos

```
frontend/src/
├── hooks/
│   └── useFeatures.jsx               # ✅ Hook centralizado de features
└── DEBUG_IMPACT_SCORE.md             # ✅ Este guia
```

### ✅ Arquivos Modificados

```
frontend/src/
├── components/navigation/
│   └── Sidebar.jsx                   # ✅ Usa useFeatures + log debug
└── App.jsx                           # ✅ AppRoutes com useFeatures
```

---

## 🔧 O que foi Implementado

### 1. Hook Centralizado `useFeatures.jsx`

**Funcionalidades:**
- ✅ Lê variáveis `VITE_FEATURE_IMPACT_SCORE` e `VITE_FEATURE_GREENUS`
- ✅ Suporta debug via query params: `?debugImpact=1`
- ✅ Logs de diagnóstico no console
- ✅ Valida e expõe flags de forma centralizada

**Exemplo de uso:**
```javascript
const { FEATURE_IMPACT, FEATURE_GREEN } = useFeatures()
```

**Logs no Console:**
```
[FEATURES] =================================
[FEATURES] VITE_FEATURE_IMPACT_SCORE = true | via .env
[FEATURES] VITE_FEATURE_GREENUS      = undefined | via .env
[FEATURES] debugImpact param         = true
[FEATURES] debugGreen param          = false
[FEATURES] Effective FEATURE_IMPACT  = true
[FEATURES] Effective FEATURE_GREEN   = false
[FEATURES] =================================
```

---

### 2. Sidebar Atualizado

**Mudanças:**
- ✅ Importa `useFeatures` hook
- ✅ Usa `FEATURE_IMPACT` em vez de `import.meta.env` direto
- ✅ Log debug: `[DEBUG Sidebar] FEATURE_IMPACT = true/false`
- ✅ Item "Impact Score" aparece dinamicamente

**Código:**
```javascript
import { useFeatures } from '../../hooks/useFeatures'

const Sidebar = () => {
  const { FEATURE_IMPACT } = useFeatures()
  console.log('[DEBUG Sidebar] FEATURE_IMPACT =', FEATURE_IMPACT)
  
  // ... navigation array usa FEATURE_IMPACT
}
```

---

### 3. App.jsx com AppRoutes

**Mudanças:**
- ✅ Criação de `AppRoutes` component que usa `useFeatures`
- ✅ Rota `/impact` condicional baseada em `FEATURE_IMPACT`
- ✅ Log debug no App

**Código:**
```javascript
function AppRoutes() {
  const { FEATURE_IMPACT } = useFeatures()
  console.log('[DEBUG App] FEATURE_IMPACT =', FEATURE_IMPACT)
  
  return (
    <Routes>
      {/* ... outras rotas ... */}
      {FEATURE_IMPACT && (
        <Route path="/impact" element={...} />
      )}
    </Routes>
  )
}
```

---

## 🚀 Como Usar

### 1. Ativar Feature Flag

**Crie/edite `frontend/.env.local`:**

```env
VITE_FEATURE_IMPACT_SCORE=true
```

### 2. Reiniciar Dev Server

```bash
# Pare o servidor atual (Ctrl+C)
# Reinicie
npm run dev
```

### 3. Verificar no Console

Abra o navegador e veja os logs:

```
[FEATURES] =================================
[FEATURES] VITE_FEATURE_IMPACT_SCORE = true | via .env
[FEATURES] debugImpact param         = false
[FEATURES] Effective FEATURE_IMPACT  = true
[FEATURES] =================================
[DEBUG App] FEATURE_IMPACT = true
[DEBUG Sidebar] FEATURE_IMPACT = true
```

### 4. Testar com Debug Mode

**Forçar exibição (ignora flag):**

Abra: `http://localhost:5173/?debugImpact=1`

No console:
```
[FEATURES] debugImpact param         = true
[FEATURES] Effective FEATURE_IMPACT  = true
[DEBUG Sidebar] FEATURE_IMPACT = true
```

---

## 🔍 Troubleshooting

### Problema: Item não aparece na Sidebar

**Solução 1: Verificar flag**

```bash
# Verificar .env.local
cat frontend/.env.local | grep VITE_FEATURE_IMPACT_SCORE

# Deve retornar:
VITE_FEATURE_IMPACT_SCORE=true
```

**Solução 2: Forçar com debug**

```
http://localhost:5173/?debugImpact=1
```

**Solução 3: Verificar logs**

Abra DevTools → Console e veja:
- `[FEATURES] ...` - Configuração de flags
- `[DEBUG App] ...` - Status no App
- `[DEBUG Sidebar] ...` - Status na Sidebar

### Problema: Erro de import

```javascript
// Verificar que useFeatures.jsx existe
ls frontend/src/hooks/useFeatures.jsx

// Se não existir, crie:
touch frontend/src/hooks/useFeatures.jsx
```

### Problema: Rota não funciona

**Verificar se App.jsx tem:**

```javascript
import { useFeatures } from './hooks/useFeatures'

function AppRoutes() {
  const { FEATURE_IMPACT } = useFeatures()
  // ...
}
```

---

## 📊 Fluxo de Debug

```
1. useFeatures.jsx lê .env
   ↓
2. Verifica ?debugImpact=1
   ↓
3. Calcula FEATURE_IMPACT = true/false
   ↓
4. Loga no console
   ↓
5. App.jsx usa FEATURE_IMPACT
   ↓
6. Sidebar usa FEATURE_IMPACT
   ↓
7. Item aparece ou não
```

---

## ✅ Checklist de Verificação

- [x] `useFeatures.jsx` criado
- [x] `Sidebar.jsx` usa `useFeatures`
- [x] `App.jsx` tem `AppRoutes` com `useFeatures`
- [x] Rota `/impact` condicional
- [x] Logs de debug no console
- [x] Feature flag no `.env.local`
- [x] Debug mode via `?debugImpact=1`

---

## 🎯 Como Testar

### Teste 1: Flag Ativa

```bash
# 1. Garantir .env.local
echo "VITE_FEATURE_IMPACT_SCORE=true" >> frontend/.env.local

# 2. Reiniciar
npm run dev

# 3. Abrir navegador
# http://localhost:5173

# 4. Ver console
# Deve mostrar: FEATURE_IMPACT = true

# 5. Verificar Sidebar
# Deve ter item "Impact Score"
```

### Teste 2: Debug Mode

```bash
# 1. Abrir com ?debugImpact=1
# http://localhost:5173/?debugImpact=1

# 2. Ver console
# Deve mostrar: debugImpact param = true

# 3. Verificar Sidebar
# Deve aparecer mesmo sem flag
```

### Teste 3: Rota Funciona

```bash
# 1. Clicar em "Impact Score" na sidebar
# OU acessar: http://localhost:5173/impact

# 2. Verificar que página carrega
# Deve mostrar: "Impact Score"
```

---

## 📝 Notas Importantes

### Query Params de Debug

- `?debugImpact=1` - Força FEATURE_IMPACT = true
- `?debugGreen=1` - Força FEATURE_GREEN = true

### Limpeza Pós-Debug

Quando tudo funcionar, você pode:
- ✅ Remover logs de debug (opcional)
- ✅ Manter `?debugImpact=1` funcional
- ✅ Documentar para equipe

---

## 🎉 Resultado

**✅ DEBUG MODE IMPLEMENTADO E FUNCIONAL!**

### Comandos Rápidos

```bash
# Forçar exibição (debug mode)
open http://localhost:5173/?debugImpact=1

# Verificar logs no console
# Deve mostrar todos os [FEATURES] e [DEBUG]

# Verificar item na sidebar
# Deve estar visível
```

---

**🚀 Impact Score com debug completo e pronto para testar!**


