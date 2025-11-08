# Variáveis de Ambiente para Vercel (Frontend)

Este documento lista todas as variáveis de ambiente que devem ser configuradas no Vercel para o frontend do ConnectUS.

## 📋 Como Configurar no Vercel

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável abaixo
4. **IMPORTANTE**: Configure valores diferentes para **Development**, **Preview** e **Production** quando necessário

---

## 🔴 OBRIGATÓRIAS (Essenciais)

### API Backend
```env
# Production (use sua URL do Railway)
VITE_API_URL=https://connectus-real-world-production.up.railway.app

# Development (opcional, para testes locais)
VITE_API_URL=http://127.0.0.1:8000
```

### Credenciais CORS
```env
VITE_WITH_CREDENTIALS=true
```

---

## 🟡 RECOMENDADAS (Funcionalidades Core)

### Ready Player Me (Avatares)
```env
VITE_FEATURE_RPM=true
VITE_RPM_SUBDOMAIN=demo
```

### Feature Flags Principais
```env
VITE_FEATURE_MISSIONS_V2=true
VITE_FEATURE_IMPACT_SCORE=true
VITE_FEATURE_GREENUS=true
```

### Web3 Configuration
```env
VITE_WEB3_ENABLED=true
VITE_WEB3_DEMO_MODE=false
VITE_ENABLE_STAKING_UI=true
```

### Sepolia Network (Web3)
```env
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_SEPOLIA_TOKEN_ADDRESS=0x96DcF6a7E553DE98fA84Df2CABb94A2CAD2b2367
VITE_SEPOLIA_TOKENSHOP_ADDRESS=0xF0D54342F02D3A3C7409DE472C4bE7E0D971A6B0
```

---

## 🟢 OPCIONAIS (Funcionalidades Adicionais)

### Feature Flags Opcionais
```env
VITE_FEATURE_QR=false
VITE_FEATURE_GEO=false
VITE_ENABLE_MINT=false
VITE_DEMO_SEED=false
```

### Chainlink (Opcional - para Web3 avançado)
```env
VITE_CHAINLINK_FEED_ADDRESS=0x...
```

### API Base URL (Alternativa ao VITE_API_URL)
```env
VITE_API_BASE_URL=https://connectus-real-world-production.up.railway.app
```

---

## 📝 Configuração Completa Recomendada

### Para PRODUCTION no Vercel:

```env
# API
VITE_API_URL=https://connectus-real-world-production.up.railway.app
VITE_WITH_CREDENTIALS=true

# Ready Player Me
VITE_FEATURE_RPM=true
VITE_RPM_SUBDOMAIN=demo

# Feature Flags
VITE_FEATURE_MISSIONS_V2=true
VITE_FEATURE_IMPACT_SCORE=true
VITE_FEATURE_GREENUS=true
VITE_FEATURE_QR=false
VITE_FEATURE_GEO=false

# Web3
VITE_WEB3_ENABLED=true
VITE_WEB3_DEMO_MODE=false
VITE_ENABLE_STAKING_UI=true
VITE_ENABLE_MINT=false
VITE_DEMO_SEED=false

# Sepolia Network
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_SEPOLIA_TOKEN_ADDRESS=0x96DcF6a7E553DE98fA84Df2CABb94A2CAD2b2367
VITE_SEPOLIA_TOKENSHOP_ADDRESS=0xF0D54342F02D3A3C7409DE472C4bE7E0D971A6B0
```

### Para DEVELOPMENT (local):

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_WITH_CREDENTIALS=true
VITE_FEATURE_RPM=true
VITE_RPM_SUBDOMAIN=demo
VITE_FEATURE_MISSIONS_V2=true
VITE_FEATURE_IMPACT_SCORE=true
VITE_FEATURE_GREENUS=true
VITE_WEB3_ENABLED=true
VITE_WEB3_DEMO_MODE=false
VITE_ENABLE_STAKING_UI=true
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_SEPOLIA_TOKEN_ADDRESS=0x96DcF6a7E553DE98fA84Df2CABb94A2CAD2b2367
VITE_SEPOLIA_TOKENSHOP_ADDRESS=0xF0D54342F02D3A3C7409DE472C4bE7E0D971A6B0
```

---

## ⚠️ IMPORTANTE

1. **Todas as variáveis devem começar com `VITE_`** para serem expostas no build do Vite
2. **Valores booleanos**: Use strings `"true"` ou `"false"` (não valores booleanos reais)
3. **URLs**: Sempre use `https://` em produção (nunca `http://`)
4. **CORS**: Certifique-se de que o backend está configurado para aceitar a origem do Vercel
5. **Rebuild**: Após adicionar/modificar variáveis, você precisa fazer um novo deploy

---

## 🔍 Verificação

Após configurar as variáveis, você pode verificar se estão corretas:

1. **No console do navegador** (F12):
   - Procure por logs `[CONFIG]` e `[FEATURES]`
   - Verifique se não há erros de variáveis faltando

2. **Endpoint de diagnóstico**:
   - Acesse `https://seu-backend.up.railway.app/cors-info` para verificar CORS

3. **Teste de funcionalidades**:
   - Tente fazer login/registro
   - Verifique se as features estão habilitadas conforme esperado

---

## 📚 Referências

- [Documentação do Vite - Variáveis de Ambiente](https://vitejs.dev/guide/env-and-mode.html)
- [Documentação do Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

