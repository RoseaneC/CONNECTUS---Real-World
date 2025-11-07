### Guia de Deploy: ConnectUS (Backend FastAPI + Frontend React)

---

#### 1. Pré-requisitos locais
- Python 3.10+ e Node.js 18+ instalados.
- Conta no **GitHub** (obrigatório).
- Conta no **Vercel** (obrigatório para frontend).
- Conta no **Railway** (obrigatório para backend - necessário para WebSockets, IA e SQLite).
- Ambiente limpo (dependências removidas do versionamento e `.gitignore` atualizado).

#### 2. Estrutura do projeto
```
CONNECTUS/
  backend/        # FastAPI + scripts
  frontend/       # React + Vite
  scripts/
  smart-contract/
  .gitignore
  README.md
  ...
```
Mantenha `backend`, `frontend`, `scripts`, `smart-contract` e documentação relevante. Assegure que ambientes virtuais, `node_modules`, `dist/`, `.env`, `.db` etc. estejam ignorados.

---

### 3. Subir para o GitHub

1. **Instalação de dependências locais (opcional para teste)**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate         # PowerShell
   pip install -r requirements.txt
   cd ../frontend
   npm install
   cd ..
   ```

2. **Inicializar (ou atualizar) Git**
   ```bash
   git status -sb
   git branch -M main              # renomeie se estiver em outra branch
   git remote remove origin        # apenas se já houver um remoto antigo
   git remote add origin https://github.com/RoseaneC/CONNECTUS---Real-Word.git
   ```

3. **Selecionar arquivos relevantes**
   ```bash
   git add backend frontend scripts smart-contract .gitignore *.md
   git status -sb                  # revisão final
   git commit -m "feat: initial import"
   git push -u origin main
   ```

---

### 4. Deploy do Backend (FastAPI)

Você tem duas opções principais:

#### 4.1 Opção A: Vercel (Serverless Functions) ⚠️ **NÃO RECOMENDADO PARA ESTE PROJETO**

**⚠️ ATENÇÃO:** O ConnectUS usa **WebSockets** para chat e missões em tempo real. O Vercel não suporta bem conexões WebSocket persistentes no modelo serverless.

**Vantagens:**
- Tudo em uma plataforma (frontend + backend)
- Deploy automático integrado
- Gratuito para projetos pequenos/médios

**Limitações (CRÍTICAS para ConnectUS):**
- ❌ **WebSockets não funcionam bem** (timeout, cold starts)
- ❌ **Timeout de 10s** (Hobby) ou 60s (Pro) - insuficiente para processamento de IA
- ❌ **Cold starts** causam latência em requisições de chat/IA
- ❌ **SQLite não persiste** adequadamente no modelo serverless
- ❌ Requer refatoração completa para serverless functions

**Quando usar:** Apenas se você remover WebSockets e simplificar drasticamente o backend.

**Como configurar no Vercel:**

1. Crie um arquivo `vercel.json` na raiz do projeto:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/main.py"
    }
  ]
}
```

2. Ou use a estrutura de API do Vercel:
   - Crie `api/` na raiz e mova endpoints como serverless functions
   - Mais trabalhoso, mas melhor performance

3. Configure variáveis de ambiente no Vercel (Settings → Environment Variables)

**Recomendação:** Use Vercel apenas se seu backend for leve e não precisar de conexões longas.

#### 4.2 Opção B: Railway ✅ **RECOMENDADO PARA CONNECTUS**

**✅ RECOMENDADO** porque o ConnectUS precisa de:
- ✅ **WebSockets funcionando perfeitamente** (chat e missões em tempo real)
- ✅ **Processamento de IA sem timeout** (chat com OpenAI pode levar >10s)
- ✅ **SQLite persistente** (banco de dados local)
- ✅ **Múltiplos routers** (auth, missions, chat, wallet, staking, etc.)

**Vantagens:**
- Servidor Python tradicional (sem limitações de timeout)
- Suporte nativo a WebSockets e conexões persistentes
- Suporte nativo a FastAPI/Uvicorn
- Banco de dados gerenciado disponível (Postgres opcional)
- Armazenamento persistente para SQLite
- Logs em tempo real

**Como configurar:**
1. Crie uma conta em [railway.app](https://railway.app/) e clique em “New Project”.
2. Escolha “Deploy from GitHub” e conecte ao repositório `CONNECTUS---Real-Word`.
3. Selecione a pasta `backend` como raiz do serviço:
   - Settings → Deployments → “Root Directory”: `backend`
4. Configure o Python Build:
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Python Version**: 3.10 (ou compatível)
5. Variáveis de ambiente:
   - Use `backend/env.example` como base (`DATABASE_URL`, `OPENAI_API_KEY`, etc.).
   - No Railway, vá em “Variables” e replique as chaves.
6. Banco de dados:
   - Se usar SQLite (`connectus.db`), opte por um Postgres/SQLite gerenciado ou adote armazenamento persistente.
7. Faça o deploy e copie a URL pública (ex.: `https://connectus-backend.up.railway.app`).

#### 4.3 Teste do backend
```bash
curl https://<sua-url>/docs
```
Verifique se a documentação Swagger carrega.

---

### 5. Ajustar variáveis do frontend para produção

No repositório GitHub (ou diretamente na Vercel), garanta um `.env.production` ou use variáveis de ambiente:

```
VITE_API_URL=https://<url-backend>
VITE_WITH_CREDENTIALS=true
VITE_FEATURE_RPM=true
VITE_RPM_SUBDOMAIN=demo
VITE_WEB3_DEMO_MODE=false
VITE_ENABLE_STAKING_UI=true
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_SEPOLIA_TOKEN_ADDRESS=0x96DcF6a7E553DE98fA84Df2CABb94A2CAD2b2367
VITE_SEPOLIA_TOKENSHOP_ADDRESS=0xF0D54342F02D3A3C7409DE472C4bE7E0D971A6B0
VITE_WEB3_ENABLED=true
```

---

### 6. Deploy do Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com/), crie um projeto novo.
2. Importe do GitHub, selecione `CONNECTUS---Real-Word`.
3. Defina **Root Directory** como `frontend`.
4. Configure o build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Adicione variáveis de ambiente (Settings → Environment Variables) com os prefixos `VITE_...` conforme acima.
6. Deploy automático após cada push na branch `main`.

#### 6.1 Testar
- Acesse a URL gerada (ex.: `https://connectus-frontend.vercel.app`).
- Verifique chamadas ao backend com DevTools → Network.
- Se ocorrer CORS, ajuste no backend:
  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://connectus-frontend.vercel.app"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

---

### 7. Pós-deploy e automações

- **CI/CD**: configure GitHub Actions para executar testes (`backend/tests`, `frontend/tests-e2e`) antes de cada push.
- **Sincronização de variáveis**: 
  - Se usar Railway: configure variáveis no painel do Railway.
  - Se usar Vercel: utilize CLI (`vercel env pull`) ou interface web.
- **Monitoramento**: 
  - Railway: logs em tempo real no painel.
  - Vercel: logs disponíveis na aba "Logs" de cada deployment.

---

### 8. Checklist Final
- [ ] `git status` limpo antes do push.
- [ ] Backend deployado (Vercel ou Railway) e respondendo em `/docs` ou `/health`.
- [ ] Frontend carrega e consome API corretamente.
- [ ] Variáveis de ambiente configuradas nos dois ambientes.
- [ ] CORS configurado no backend para permitir requisições do frontend.
- [ ] Documentação de deploy incluída no repositório (este arquivo pode ser commitado).

**Resumo das opções:**
- **Tudo no Vercel:** ❌ **NÃO FUNCIONA** para ConnectUS (WebSockets, processamento de IA, SQLite).
- **Vercel (frontend) + Railway (backend):** ✅ **RECOMENDADO** - Suporta todas as funcionalidades do ConnectUS (WebSockets, IA, banco de dados).

Seguindo este roteiro, a aplicação ficará acessível com backend FastAPI e frontend React, mantendo um fluxo de deploy confiável.

