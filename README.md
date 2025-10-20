# 🌐 CONNECTUS – Sistema de Gamificação Social

## 🚀 Projeto Funcional e Estável
Versão estável antes da integração com **Ready Player Me**  
✅ IA VEXA totalmente funcional  
✅ Timeline, Ranking, Perfil e Missões operando 100%  
✅ Backend e Frontend integrados com sucesso  

---

## 🧠 Tecnologias Utilizadas

### Frontend
- **Framework:** React + Vite  
- **Estilo:** Tailwind CSS  
- **Autenticação:** Context API + JWT  
- **Comunicação:** Axios + CORS configurado  

### Backend
- **Framework:** FastAPI (Python)  
- **ORM:** SQLAlchemy  
- **Banco de Dados:** SQLite  
- **Autenticação:** JWT + Refresh Tokens  
- **IA Integrada:** OpenAI API (VEXA IA)  

---

## ✨ Melhorias Implementadas

### 🔧 Hardening & UX Polish
- **Rotas Flexíveis:** aceita `/` e sem `/` (evita redirects 307)
- **Autenticação Inteligente:** 401 (não autenticado) vs 403 (sem permissão)
- **Endpoints Tolerantes:** `/ai/*` e `/ranking` retornam 200 com dados vazios quando anônimo
- **DeprecationWarnings:** corrigidos (`regex` → `pattern`)
- **Testes Atualizados:** cobertura completa dos novos endpoints
- **CORS:** liberado para `http://localhost:5173` e `http://127.0.0.1:5173`

---

## 🎯 Endpoints Principais

### 🤖 AI Router (`/ai`)
- `GET /ai/history` → histórico de conversas  
- `GET /ai/favorites` → conversas favoritas  
- `GET /ai/stats` → estatísticas de uso  
- `POST /ai/chat-public` → interação pública com a IA (VEXA)

### 🏆 Ranking Router (`/ranking`)
- Ranking geral e por período (XP, tokens, missões)

### 🗞️ Posts Router (`/posts`)
- Criação, exclusão e timeline social
- Corrigida serialização de `created_at` e `author`

### 🎯 Missions Router (`/missions`)
- Listagem e progresso de missões

### 👤 Profile Router (`/profile` e `/avatars`)
- Atualização de perfil e avatar (pronto para integração com Ready Player Me)

---

## 📋 Como Executar o Projeto

### 🐍 1. Backend (FastAPI)

```bash
# Navegar até o diretório backend
cd backend

# Ativar ambiente virtual (se existir)
.venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
copy env.example .env
# Editar .env com suas chaves e configurações

# Executar servidor
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
