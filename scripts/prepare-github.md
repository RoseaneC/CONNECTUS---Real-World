# 📦 Preparação para GitHub - ConnectUS Hackathon

## 🎯 Objetivo
Preparar o repositório para submissão pública no GitHub, garantindo que todos os arquivos necessários estejam incluídos e segredos excluídos.

## 📋 Checklist de Preparação

### ✅ Arquivos Essenciais
- [x] `README.md` - Documentação principal
- [x] `README_HACKATHON.md` - Versão otimizada para hackathon
- [x] `DEPLOY_INSTRUCTIONS.md` - Instruções de deploy
- [x] `HACKATHON_FINAL.md` - Checklist de submissão
- [x] `backend/` - Código fonte do backend
- [x] `frontend/` - Código fonte do frontend
- [x] `smart-contract/` - Contrato VEXAToken.sol
- [x] `.gitignore` - Exclusões de arquivos sensíveis

### ✅ Arquivos de Configuração
- [x] `frontend/env.example` - Variáveis de ambiente frontend
- [x] `backend/env.example` - Variáveis de ambiente backend
- [x] `frontend/package.json` - Dependências frontend
- [x] `backend/requirements.txt` - Dependências backend
- [x] `frontend/vite.config.js` - Configuração Vite
- [x] `backend/pyproject.toml` - Configuração Python

### ✅ Scripts de Verificação
- [x] `frontend/scripts/hackathon-checklist.js` - Checklist principal
- [x] `frontend/scripts/test-mint-restrictions.js` - Teste de restrições
- [x] `frontend/scripts/test-ux-improvements.js` - Teste de UX
- [x] `frontend/scripts/web3-check.js` - Verificação Web3
- [x] `frontend/scripts/web3-mint-demo.js` - Demo de mint

## 🚀 Comandos para GitHub

### 1. Inicializar Repositório
```bash
# Na raiz do projeto
git init
git add .
git commit -m "feat: hackathon submission - ConnectUS Web3 platform"
```

### 2. Criar Repositório no GitHub
1. Acesse https://github.com/new
2. Nome: `connectus-hackathon`
3. Descrição: `ConnectUS - Gamified Educational Platform with Web3 Integration`
4. Visibilidade: **Público**
5. Não inicializar com README (já temos)

### 3. Conectar e Fazer Push
```bash
# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/connectus-hackathon.git

# Fazer push inicial
git branch -M main
git push -u origin main
```

### 4. Verificar Upload
- [ ] Todos os arquivos foram enviados
- [ ] README.md está visível
- [ ] Estrutura de pastas está correta
- [ ] Nenhum arquivo sensível foi incluído

## 🔒 Segurança - Arquivos Excluídos

### ❌ NUNCA Incluir
- `.env` (qualquer um)
- `node_modules/`
- `dist/`
- `__pycache__/`
- `*.db`
- `*.sqlite`
- `*.log`
- `.DS_Store`
- `Thumbs.db`
- Chaves privadas
- Senhas
- Tokens de acesso

### ✅ Sempre Incluir
- `.env.example`
- `package.json`
- `requirements.txt`
- `README.md`
- Código fonte
- Scripts de teste
- Documentação

## 📝 Estrutura Final do Repositório

```
connectus-hackathon/
├── README.md
├── README_HACKATHON.md
├── DEPLOY_INSTRUCTIONS.md
├── HACKATHON_FINAL.md
├── .gitignore
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── env.example
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── env.example
│   ├── scripts/
│   └── ...
├── smart-contract/
│   ├── VEXAToken.sol
│   └── VEXAToken.json
└── scripts/
    └── prepare-github.md
```

## 🧪 Testes Finais

### Antes do Push
```bash
# Verificar se não há arquivos sensíveis
git status
git diff --cached

# Executar testes
cd frontend
npm run build
node scripts/hackathon-checklist.js
```

### Após o Push
1. **Acessar repositório**: Verificar se está público
2. **Testar clone**: `git clone https://github.com/SEU_USUARIO/connectus-hackathon.git`
3. **Verificar README**: Deve estar visível na página principal
4. **Testar build**: Seguir instruções do README

## 📞 Suporte

Se encontrar problemas:
1. Verificar `.gitignore` está correto
2. Verificar se todos os arquivos necessários estão incluídos
3. Verificar se nenhum arquivo sensível foi incluído
4. Testar clone em diretório limpo

---

**Boa sorte com a submissão! 🚀**









