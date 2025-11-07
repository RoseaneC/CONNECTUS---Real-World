# 🎮 ConnectUS Play - Guia de Implementação

**Data**: 26/10/2025  
**Módulo**: Singleplayer Demo (3D Interactive Experience)  
**Status**: ✅ IMPLEMENTADO

---

## 📋 Resumo

O **ConnectUS Play** é um novo módulo 3D singleplayer integrado com o sistema de avatar Ready Player Me e o Web3 Demo Mode. Permite aos usuários explorar um mundo 3D, interagir com pontos de missão e ganhar VEXA Coins.

---

## 🎯 Funcionalidades

### ✅ Implementado
- [x] **Página 3D** (`/play`) - Rota isolada
- [x] **Carregamento de Avatar** - Via `user.avatar_glb_url`
- [x] **Controles WASD** - Movimento com teclado
- [x] **Camera Orbital** - Controles de câmera com mouse
- [x] **Pontos de Missão** - 3 objetos 3D interativos
- [x] **Mint de Coins** - Integração com `/wallet/demo/mint`
- [x] **HUD Overlay** - Saldo e XP em tempo real
- [x] **Cenário Básico** - Chão, iluminação, skybox

### ⏳ Futuro
- [ ] Avatares de NPCs
- [ ] Diálogo com VEXA IA
- [ ] Mais tipos de missões
- [ ] Leaderboard multiplayer

---

## 📁 Arquivos Criados

### Frontend
```
frontend/src/
├── pages/
│   └── PlayPage.jsx              ✅ Criado
├── components/play/
│   ├── SceneContainer.jsx        ✅ Criado
│   ├── MissionPoints.jsx         ✅ Criado
│   └── HUDOverlay.jsx            ✅ Criado
└── hooks/
    └── usePlayerControls.js      ✅ Criado
```

### Modificados (Apenas Adições)
```
frontend/src/App.jsx
  - Linha 24: import PlayPage
  - Linha 123-127: Rota /play adicionada
```

---

## 🧩 Componentes

### 1. PlayPage.jsx (Página Principal)
```javascript
// Gerencia o canvas 3D e HUD
// Redireciona para login se não autenticado
// Renderiza cenário e controles
```

### 2. SceneContainer.jsx (Cena 3D)
```javascript
// Carrega avatar do usuário via GLB
// Aplica controles WASD
// Renderiza pontos de missão
// Gerencia iluminação
```

### 3. MissionPoints.jsx (Pontos de Missão)
```javascript
// 3 objetos 3D (esferas em pilares)
// Clique para completar missão
// Chama POST /wallet/demo/mint
// Feedback visual de status
```

### 4. HUDOverlay.jsx (Interface)
```javascript
// Exibe saldo VEXA atualizado
// Mostra XP (mock)
// Botão "Voltar ao Dashboard"
// Instruções de controles
```

### 5. usePlayerControls.js (Hook)
```javascript
// Detecta teclas WASD
// Retorna estado de movimento
// Limpa listeners no unmount
```

---

## 🚀 Como Usar

### 1. Instalar Dependências (se necessário)
```bash
cd frontend
npm install @react-three/fiber @react-three/drei three
```

### 2. Iniciar Frontend
```bash
npm run dev
```

### 3. Acessar
```
http://localhost:5174/play
```

### 4. Controles
- **W / S** - Mover para frente/trás
- **A / D** - Mover para esquerda/direita
- **Mouse** - Rotacionar câmera
- **Scroll** - Zoom in/out
- **Clique** - Interagir com missões

### 5. Completar Missões
- Clique nos objetos amarelos/vermelhos flutuantes
- Cada missão dá +10/15/20 VEXA Coins
- Missões completadas ficam verdes

---

## 🎨 Cenário 3D

### Elementos Visuais
- **Chão**: Plano cinza com sombras
- **Luz**: Direcional + Hemisférica + Ambiente
- **Skybox**: Céu procedural com sol
- **Objetos**: 3 pilares com esferas coloridas
- **Avatar**: Carregado dinamicamente (Ready Player Me)

### Cores
- **Vermelho** (#EF4444): Missão não completada
- **Verde** (#10B981): Missão completada
- **Amarelo** (#FCD34D): Globo emissivo
- **Azul** (#3B82F6): Pilar de missão

---

## 🔗 Integração com APIs

### Backend Endpoints Usados
```javascript
// GET /wallet/demo/status
// Busca saldo atual do usuário

// POST /wallet/demo/mint
// Minta tokens quando missão completada
// Body: { amount: 10/15/20 }
```

### Headers
```javascript
// Autorização via JWT (injetado pelo api.js)
// Content-Type: application/json
```

---

## ⚠️ GuardRails

### Nenhum Arquivo Crítico Alterado ✅
- ✅ AuthContext.jsx
- ✅ api.js
- ✅ ProfilePage.jsx
- ✅ ProtectedRoute.jsx
- ✅ useFeatureFlags.js
- ✅ avatarService.js
- ✅ auth.py
- ✅ avatars.py

### Mudanças Aditivas Apenas
- ✅ Rota `/play` adicionada sem alterar rotas existentes
- ✅ Componentes isolados em `components/play/`
- ✅ Hook isolado em `hooks/`

---

## 🧪 Como Testar

### 1. Acesse a rota
```
http://localhost:5174/play
```

### 2. Deve aparecer:
- Cenário 3D com chão cinza
- Avatar do usuário (se tiver GLB)
- 3 objetos flutuantes (pontos de missão)
- HUD no canto superior direito
- Botão "Voltar ao Dashboard"

### 3. Interaja:
- Use WASD para mover
- Mouse para rotacionar câmera
- Clique em um ponto de missão
- Veja notificação de +VEXA Coins
- Saldo deve atualizar no HUD

### 4. Console do Navegador
- Deve mostrar logs de missões completadas
- Sem erros de CORS ou 404
- Sem warnings de React Three Fiber

---

## 🐛 Troubleshooting

### Avatar não aparece
```
Problema: avatar_glb_url está null
Solução: Criar avatar no /profile usando Ready Player Me
```

### Missão não completa
```
Problema: 404 ou 401
Solução: Verificar se backend está rodando e JWT válido
```

### Movimento não funciona
```
Problema: usePlayerControls não detecta teclas
Solução: Verificar console por erros, reiniciar página
```

### HUD não atualiza
```
Problema: Polling de saldo falha
Solução: Verificar network tab, backend acessível
```

---

## 📊 Performance

### Otimizações
- Lazy loading de avatar GLB
- Shadows desabilitadas (exceto chão)
- Atualização de HUD a cada 5s
- Suspense para assets 3D

### Limitações Conhecidas
- Avatar GLB grande pode demorar para carregar
- Múltiplas missões simultâneas podem travar
- Sem cache de cenário (re-render a cada visita)

---

## 🎯 Próximos Passos

### Curto Prazo
1. Adicionar NPCs para diálogo
2. Implementar diálogo com VEXA IA
3. Mais variações de missões
4. Sistema de checkpoint/progresso

### Médio Prazo
1. Multiplayer local (WebRTC)
2. Mais tipos de cenários
3. Animations do avatar
4. Efeitos de partículas

### Longo Prazo
1. Modo multi-jogador online
2. Editor de missões
3. Importar cenários 3D externos
4. Integração com blockchain real

---

## 📝 Notas de Implementação

### Bibliotecas Usadas
- `@react-three/fiber` - React renderer para Three.js
- `@react-three/drei` - Helpers para R3F
- `three` - Biblioteca 3D
- `api.js` - Cliente HTTP existente

### Decisões Técnicas
- Canvas fullscreen sem layout wrapper (melhor performance)
- HUD posicionado manualmente (independente do layout)
- Avatar carregado via useGLTF (drei)
- Missões em array estático (fácil expansão)

### Compatibilidade
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ⚠️ Safari (pode ter problemas com Three.js)
- ❌ IE11 (não suportado)

---

## ✅ Checklist de Implementação

- [x] PlayPage.jsx criado
- [x] SceneContainer.jsx criado
- [x] MissionPoints.jsx criado
- [x] HUDOverlay.jsx criado
- [x] usePlayerControls.js criado
- [x] Rota `/play` adicionada no App.jsx
- [x] Importações corretas
- [x] Integração com API
- [x] GuardRails respeitados
- [x] Nenhum arquivo crítico alterado

---

**Documentado por**: Cursor GuardRail System  
**Última atualização**: 26/10/2025 23:50  
**Status**: ✅ PRONTO PARA TESTE








