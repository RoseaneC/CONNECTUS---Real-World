# Missões Diárias v2 (missions-v2)

## Visão Geral

Módulo isolado e seguro de Missões Diárias com recompensas de XP e Tokens. Implementado de forma aditiva, sem alterar módulos existentes.

## Arquitetura

### Backend

#### Modelos (`backend/app/models/missions_v2.py`)

**Tabela `daily_missions`**
- `id`: Integer, PK, autoincrement
- `code`: String(64), unique, index (ex: "CHECKIN", "LIKE_POST", "INVITE_FRIEND")
- `title`: String(120), not null
- `description`: String(255), not null
- `xp_reward`: Integer, not null, default=0
- `token_reward`: Integer, not null, default=0
- `icon`: String(64), nullable (ex: "calendar-check", "heart")
- `is_active`: Boolean, default=True
- `created_at`: DateTime (utcnow)

**Tabela `user_mission_progress`**
- `id`: Integer, PK, autoincrement
- `user_id`: Integer, index (FK lógica para users.id)
- `mission_id`: Integer, index
- `date`: String(10) (YYYY-MM-DD)
- `status`: String(20) ("pending" | "completed")
- `completed_at`: DateTime, nullable
- **UniqueConstraint(user_id, mission_id, date)** → garante idempotência diária

#### Seed (`backend/app/db/seed_missions_v2.py`)

Insere 3 missões ativas se a tabela estiver vazia:
1. **CHECKIN**: Check-in diário (10 XP, 2 Tokens)
2. **LIKE_POST**: Curtir um post (15 XP, 3 Tokens)
3. **INVITE_FRIEND**: Convidar um amigo (30 XP, 5 Tokens)

#### Service (`backend/app/services/missions_v2_service.py`)

**Funções principais:**
- `today_str_tz()`: Retorna data atual em `YYYY-MM-DD` (timezone America/Sao_Paulo)
- `get_daily_missions(session)`: Lista missões ativas
- `get_user_progress_map(session, user_id, date)`: Progresso do usuário no dia
- `complete_mission(session, user, mission_code)`: Completa missão de forma idempotente

**Idempotência:**
- Garantida por `UniqueConstraint(user_id, mission_id, date)`
- Tratamento de `IntegrityError` para race conditions
- Retorna `alreadyCompleted=True` se já completada no dia

#### Router (`backend/app/routers/missions_v2.py`)

**Rotas:**
- `GET /missions/daily`: Lista missões diárias e progresso do usuário
  - Query opcional: `date` (YYYY-MM-DD), default = hoje
  - Resposta: `{ date, missions[], summary{total, completed, successRate} }`
  
- `POST /missions/complete`: Completa uma missão
  - Body: `{ code: "CHECKIN" }`
  - Resposta: `{ ok, code, completed, alreadyCompleted, rewards{xp, tokens}, userTotals{xp, tokens} }`

**Segurança:**
- Todas as rotas protegidas com `Depends(get_current_active_user)`
- Validação e sanitização de `code` (strip/upper)

### Frontend

#### Integração (`frontend/src/pages/MissionsPage.jsx`)

**Feature Flag:**
- `VITE_FEATURE_MISSIONS_V2=true` → usa missões v2
- `VITE_FEATURE_MISSIONS_V2=false` → comportamento padrão

**Funcionalidades:**
- Carrega missões via `GET /missions/daily`
- Exibe cards com título, descrição, XP, Tokens, ícone
- Badge "Completa" se `completed==true`
- Botão "Concluir" (desabilitado se completada)
- Toast de sucesso com recompensas
- Atualização de counters (Total/Completadas/Taxa de Sucesso)
- Fallback "Missões em breve" em caso de erro

## Contratos de API

### GET /missions/daily

**Request:**
```http
GET /missions/daily?date=2025-11-08
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "date": "2025-11-08",
  "missions": [
    {
      "code": "CHECKIN",
      "title": "Check-in diário",
      "description": "Entre hoje e garanta sua streak!",
      "xp_reward": 10,
      "token_reward": 2,
      "completed": false,
      "icon": "calendar-check"
    }
  ],
  "summary": {
    "total": 3,
    "completed": 1,
    "successRate": 33
  }
}
```

### POST /missions/complete

**Request:**
```http
POST /missions/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "CHECKIN"
}
```

**Response 200:**
```json
{
  "ok": true,
  "code": "CHECKIN",
  "completed": true,
  "alreadyCompleted": false,
  "rewards": {
    "xp": 10,
    "tokens": 2
  },
  "userTotals": {
    "xp": 150,
    "tokens": 25.0
  }
}
```

**Response 404:**
```json
{
  "detail": "Missão 'INVALID' não encontrada ou inativa"
}
```

## Regras de Idempotência

1. **Constraint única**: `(user_id, mission_id, date)` garante uma única conclusão por dia
2. **Race condition**: Tratamento de `IntegrityError` retorna `alreadyCompleted=True`
3. **Recompensas**: Aplicadas apenas na primeira conclusão do dia
4. **Reset diário**: Baseado em `date` (YYYY-MM-DD) em timezone America/Sao_Paulo

## Como Ligar/Desligar

### Backend

O módulo está sempre ativo no backend. As rotas estão disponíveis independentemente da flag do frontend.

### Frontend

**Ligar:**
```bash
# .env ou variável de ambiente
VITE_FEATURE_MISSIONS_V2=true
```

**Desligar:**
```bash
VITE_FEATURE_MISSIONS_V2=false
# ou não definir a variável
```

## Observações de Segurança

1. **Autenticação obrigatória**: Todas as rotas requerem `get_current_active_user`
2. **Sanitização**: Código da missão é sanitizado (strip/upper) antes de processar
3. **Transações**: Operações de conclusão são transacionais
4. **Logs**: Erros são logados sem vazar informações sensíveis
5. **Validação**: Validação de formato de data e existência de missão

## Testes Manuais

### Backend

1. `GET /missions/daily` (logado) → retorna 3 missões seed
2. `POST /missions/complete` com `"CHECKIN"`:
   - 1ª vez → `alreadyCompleted=false`, recompensa aplicada
   - 2ª vez (mesmo dia) → `alreadyCompleted=true`, sem aplicar novamente
3. Dia seguinte (alterar `date` no GET) → missão surge pendente (reset diário)

### Frontend

1. Com `VITE_FEATURE_MISSIONS_V2=true`:
   - Carrega cards com XP/Tokens
   - Concluir missão atualiza cards e counters
   - Toast de sucesso
2. Com `VITE_FEATURE_MISSIONS_V2=false`:
   - Tela permanece como antes (comportamento padrão)

## Estrutura de Arquivos

```
backend/
  app/
    models/
      missions_v2.py          # Modelos DailyMission e UserMissionProgress
    db/
      seed_missions_v2.py      # Seed de 3 missões iniciais
    services/
      missions_v2_service.py  # Lógica de negócio (data, progresso, conclusão)
    routers/
      missions_v2.py          # Rotas GET /daily e POST /complete
    main.py                    # Registro do router e seed no startup

frontend/
  src/
    pages/
      MissionsPage.jsx         # Integração com flag VITE_FEATURE_MISSIONS_V2

docs/
  missions_v2.md              # Esta documentação
```

## Dependências

- **Backend**: FastAPI, SQLAlchemy, zoneinfo (Python 3.9+)
- **Frontend**: React, Axios, react-hot-toast
- **Banco**: SQLite (Railway)

## Próximos Passos

- [ ] Adicionar mais missões via seed ou admin
- [ ] Implementar notificações push para missões diárias
- [ ] Adicionar histórico de conclusões
- [ ] Implementar streaks (dias consecutivos)
- [ ] Dashboard de estatísticas de missões

