# Connectus Backend

Backend da plataforma Connectus - plataforma social gamificada para incentivar estudos e impacto social.

## Configuração Local

### 1. Ambiente Virtual

```bash
# Ativar ambiente virtual
.venv\Scripts\activate

# Ou no Windows PowerShell
venv\Scripts\Activate.ps1
```

### 2. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
copy env.example .env

# Editar .env com suas configurações
# Para ativar a VEXA (IA), adicione:
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
```

### 4. Configurar VEXA (OpenAI) - Opcional

Para ativar a assistente VEXA, configure as variáveis de ambiente:

```bash
# No arquivo .env ou export direto
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini
```

**Sem a chave da OpenAI**: A VEXA retornará mensagem de indisponibilidade, mas o sistema continuará funcionando normalmente.

### 5. Executar o Servidor

```bash
# Opção 1: Usando o script run.py
python run.py

# Opção 2: Usando uvicorn diretamente
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 6. Verificar Funcionamento

- **API:** http://127.0.0.1:8000
- **Documentação:** http://127.0.0.1:8000/docs
- **Health Check:** http://127.0.0.1:8000/health

## Características da API

### Rotas Flexíveis
- **Rotas aceitam `/` e sem `/`**: Evita redirects 307 desnecessários
- Exemplo: `/missions` e `/missions/` funcionam igualmente

### Autenticação Inteligente
- **401**: Usuário não autenticado
- **403**: Usuário autenticado mas sem permissão
- **Endpoints tolerantes**: `/ai/*` e `/ranking` retornam 200 com dados vazios quando anônimo

### Endpoints Principais
- **AI Router** (`/ai`): Histórico, favoritos, estatísticas e chat público
- **Ranking Router** (`/ranking`): Rankings gerais e por período
- **Posts Router** (`/posts`): Timeline, criação e interações
- **Missions Router** (`/missions`): Missões disponíveis e do usuário

## Estrutura do Projeto

```
backend/
├── app/                    # Pacote principal da aplicação
│   ├── core/              # Configurações e utilitários
│   ├── models/            # Modelos do banco de dados
│   ├── routers/           # Rotas da API
│   ├── schemas/           # Schemas Pydantic
│   ├── services/          # Lógica de negócio
│   └── main.py           # Aplicação FastAPI
├── requirements.txt       # Dependências Python
├── run.py                # Script de execução
└── README.md             # Este arquivo
```

## Tecnologias

- **FastAPI** - Framework web moderno
- **SQLAlchemy** - ORM para banco de dados
- **Uvicorn** - Servidor ASGI
- **Pydantic** - Validação de dados
- **JWT** - Autenticação
- **OpenAI** - Integração com IA

## Troubleshooting

### ModuleNotFoundError

Se encontrar erros de módulo não encontrado:

1. Verifique se está no diretório `backend/`
2. Ative o ambiente virtual
3. Execute: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`

### CORS Issues

O CORS está configurado para aceitar requisições de:
- http://localhost:5173
- http://127.0.0.1:5173

### Banco de Dados

Por padrão, o projeto usa SQLite (`connectus.db`). As tabelas são criadas automaticamente na primeira execução.
