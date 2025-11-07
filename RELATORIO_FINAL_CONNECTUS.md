# 📊 Relatório Final (Atualizado) — Projeto ConnectUS

**Data**: 02/11/2025  
**Versão**: 1.1.0  
**Status**: ✅ Operacional (Impact Score + Web3 Demo + i18n)

---

## 📋 Sumário Executivo

O ConnectUS é uma plataforma social gamificada para incentivar estudos e impacto social, com Backend em FastAPI/SQLAlchemy/SQLite e Frontend em React 18/Vite/Tailwind.

Desde o último relatório, entregamos:
- ✅ Impact Score end‑to‑end (models, CRUD, rotas JWT, rate‑limit, logs, testes Pytest e inclusão no app)  
- ✅ Correção global de SQLAlchemy (`metadata` → atributo ORM seguro `meta`, mantendo coluna "metadata" e API pública com `metadata`)  
- ✅ Frontend `/impact` sempre disponível (rota + item de Sidebar), UX com cards explicativos e formulário acessível  
- ✅ i18n PT/EN com `I18nProvider`, toggle no Header e strings centralizadas  
- ✅ Acessibilidade mínima (foco visível, tamanhos base, aria/labels)  
- ✅ Web3 em modo demo com guards contra `VITE_CONTRACT_ADDRESS` inválido e microcopy inclusiva  
- ✅ Seed de demonstração (Dashboard/Ranking/Timeline) protegido por flag  
- ✅ E2E Playwright básico para a aba Impact Score (sidebar + navegação)

---

## 🏗️ Arquitetura

### Backend (FastAPI + SQLite)
- Porta: 8000  
- Base URL: `http://127.0.0.1:8000`  
- ORM: SQLAlchemy (SQLite)

### Frontend (React + Vite)
- Porta (dev): 5173 (se ocupada, 5174)  
- URL: `http://localhost:5173`  
- Build Tool: Vite 5

---

## 📁 Estrutura do Projeto (arquivos relevantes)

```
CONNECTUS/
├── backend/
│   └── app/
│       ├── models/
│       │   └── impact.py             # ImpactEvent, ImpactScore (meta → coluna "metadata")
│       ├── schemas/
│       │   └── impact.py             # Pydantic (inputs extra=forbid; outputs from_attributes)
│       ├── crud/
│       │   └── impact.py             # create_event, recalc_score, list_events, get_score
│       ├── routers/
│       │   └── impact.py             # /impact/event, /impact/events/{id}, /impact/score/{id}, /impact/attest
│       ├── utils/
│       │   └── rate_limit.py         # rate limit leve (10 req/min)
│       └── main.py                   # include_router(impact)
└── frontend/
    └── src/
        ├── App.jsx                   # /impact sempre registrado (protegido)
        ├── components/
        │   ├── navigation/
        │   │   └── Sidebar.jsx       # item "Impact Score" sempre visível
        │   ├── wallet/StakePanel.jsx # microcopy inclusiva
        │   └── wallet/WalletPanel.jsx# microcopy inclusiva
        ├── i18n/
        │   ├── useI18n.jsx           # provider + hook (persistência em localStorage)
        │   └── t.js                  # dicionário PT/EN
        ├── pages/
        │   ├── ImpactScore.jsx       # cards, formulário, toasts i18n, banner demo
        │   ├── MissionsPage.jsx      # seção "Como validar" (QR), i18n
        │   ├── Vexa.jsx              # demo friendly; badges e guards de conexão
        │   └── WalletDemo.jsx        # títulos/subtítulos atualizados
        ├── web3/
        │   ├── provider/ethers.js    # guard para CONTRACT_ADDRESS inválido
        │   ├── tokenService.js       # valida endereço antes de instanciar Contract
        │   └── components/NetworkHealth.jsx # microcopy e status "demo"
        ├── utils/
        │   └── demoSeed.ts           # seed controlada por flag
        └── main.jsx                  # App envolto por <I18nProvider>
```

---

## ✅ Funcionalidades Implementadas (Atual)

### 1) Impact Score (BE+FE)
- Modelagem: `ImpactEvent` (com `meta` → coluna "metadata"), `ImpactScore` (score e breakdown)  
- CRUD: criação de evento (peso default por tipo), recálculo de score, listagem paginada, obtenção de score  
- Rotas (JWT):
  - `POST /impact/event` → cria evento e retorna `{ event, score }`
  - `GET /impact/events/{user_id}` → lista eventos com paginação
  - `GET /impact/score/{user_id}` → retorna score atual (gera 0/breakdown vazio se não existir)
  - `POST /impact/attest` → mock de attestation (hash demo)
- Segurança: autorização (self/admin), `HTTPException` com detalhes claros  
- Pydantic: inputs `extra="forbid"`, outputs `from_attributes=True`  
- Rate limit leve: 10 req/min (por usuário/endpoint) nos POST sensíveis  
- Logs: pontos‑chave na criação e no recálculo  
- Testes Pytest (happy path): criar eventos, score esperado, paginação, attestation mock

### 2) Correção SQLAlchemy: `metadata` → `meta` (ORM)
- Atributo Python `meta = Column("metadata", JSON, ...)`  
- API pública segue usando `metadata` (compatível com frontend)  
- Ajuste aplicado consistentemente em modelos/CRUD/routers tocados

### 3) Frontend `/impact` e Sidebar
- Rota `/impact` sempre registrada e protegida (sem depender de flag)  
- Sidebar autenticada: item “Impact Score” sempre visível (sem flag), tooltip nos itens especiais  
- Página Impact: 4 cards explicativos (Missão, Voto, Pares, Doação), formulário "Registrar ação", tooltips, toasts i18n, banner demo

### 4) i18n + Acessibilidade
- `I18nProvider` e `t.js` com PT/EN; toggle no Header; persistência em `localStorage`  
- Estilo global `:focus-visible` e tamanhos mínimos; aria/labels e ícones decorativos com `aria-hidden`

### 5) Web3 (modo demo, sem on‑chain real)
- Guards contra `VITE_CONTRACT_ADDRESS` inválido/"demo" em `ethers.js` e `tokenService.js`  
- `NetworkHealth` e páginas com microcopy clara (ex.: "Contrato não configurado (demo)")  
- `Vexa.jsx`: títulos/subtítulos, badges de rede/status, botões e tooltips revisados

### 6) Seed de Demonstração (UI)
- `demoSeed.ts`: Dashboard, Ranking, Timeline (posts de impacto como doação de sangue, reciclagem etc.)  
- Ativo apenas quando `VITE_DEMO_SEED=true` (ou flag equivalente) e quando a API retornar vazio/erro  
- Banner discreto “dados de demonstração”

### 7) E2E (Playwright)
- Checagem da aba “Impact Score” na sidebar e navegação para `/impact`

---

## 🔧 Configuração de Ambiente

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=sqlite:///./connectus.db

# JWT
JWT_SECRET_KEY=troque-em-producao
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (`frontend/.env.local`)
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_WITH_CREDENTIALS=true

# Demo/Flags
VITE_DEMO_SEED=true
VITE_WEB3_DEMO_MODE=true
VITE_CONTRACT_ADDRESS=demo
```

---

## ▶️ Como Rodar

### Backend
```powershell
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```powershell
cd frontend
npm run dev
# Acesse http://localhost:5173
```

### Testes
- Backend (Pytest): `cd backend && pytest -q`  
- Frontend (Playwright): `cd frontend && npm run test:e2e`

---

## 🔌 Endpoints Relevantes

### Impact
- `POST /impact/event`  
- `GET /impact/events/{user_id}`  
- `GET /impact/score/{user_id}`  
- `POST /impact/attest` (mock)

### IA (existente)
- `POST /ai/chat`  
- `POST /ai/complete`

---

## 🗄️ Banco de Dados (novas tabelas)

### `impact_events`
```sql
CREATE TABLE impact_events (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 0.0,
  metadata JSON NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX ix_impact_events_user_time ON impact_events(user_id, timestamp);
CREATE INDEX ix_impact_events_type ON impact_events(type);
```

### `impact_scores`
```sql
CREATE TABLE impact_scores (
  user_id INTEGER PRIMARY KEY,
  score REAL NOT NULL DEFAULT 0.0,
  breakdown JSON NULL,
  updated_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 🔐 Segurança
- JWT obrigatório nas rotas Impact; autorização (self/admin)  
- Pydantic inputs `extra="forbid"` e outputs `from_attributes=True`  
- Rate‑limit leve nos POST sensíveis  
- Logs de criação/recalculo 

---

## 🐛 Problemas Conhecidos
- Web3 real desativado neste ambiente (modo demo); requer endereço válido para on‑chain  
- Certifique‑se de rodar o backend a partir de `backend/` para evitar `ModuleNotFoundError: app`

---

## 📈 Melhorias Futuras
- CI/CD e testes adicionais (incl. vitest no FE)  
- Integração Web3 real (ethers) atrás de flag e UX segura  
- Documentação Swagger mais detalhada e observabilidade

---

## 📝 Histórico Recente
- Impact Score (BE+FE) implementado e testado  
- `/impact` sempre ativo e item fixo na Sidebar  
- i18n PT/EN + acessibilidade (foco visível)  
- Web3 demo com guards e microcopy 
- Seed de demonstração (Dashboard/Ranking/Timeline)

---

## 🎯 Status Final
- ✅ Operacional para demo com Impact Score e Web3 em modo simulado  
- ✅ Sem regressões nos módulos originais (auth, missões, timeline etc.)

---

## 📞 Informações
**Projeto**: ConnectUS  
**Versão**: 1.1.0  
**Atualizado em**: 02/11/2025





