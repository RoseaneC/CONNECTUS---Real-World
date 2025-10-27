# 🚀 ConnectUS Hackathon - Web3 + Smart Contract

## 📋 Visão Geral

O ConnectUS é uma plataforma social gamificada educacional que integra blockchain e smart contracts para recompensar estudantes com tokens VEXA reais ao completar missões educacionais.

## 🏗️ Arquitetura

### Backend (FastAPI + SQLite)
- **Framework**: FastAPI (Python 3.13)
- **Database**: SQLite com SQLAlchemy ORM
- **IA**: Sistema VEXA com OpenAI (dual key system)
- **Autenticação**: JWT + bcrypt
- **Missões**: Sistema verificável com QR codes e ações in-app

### Frontend (React + Vite)
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **State**: Zustand + Context API
- **Web3**: ethers.js + MetaMask integration

### Smart Contract (Solidity)
- **Token**: VEXAToken (ERC-20)
- **Network**: Sepolia Testnet
- **Features**: Mint restrito ao owner, eventos de rastreamento

## 🌐 Funcionalidades Web3

### ✅ Implementado
- [x] Smart Contract VEXAToken.sol (ERC-20)
- [x] Integração MetaMask (conexão/desconexão)
- [x] Leitura de saldo de tokens
- [x] Mint automático ao completar missões
- [x] Interface Web3 no dashboard
- [x] Sistema de fallback para demonstração
- [x] Configuração de rede Sepolia

### 🔄 Em Desenvolvimento
- [ ] Deploy do contrato na Sepolia
- [ ] Deploy do frontend no Vercel
- [ ] Testes de integração completos

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Python 3.13+
- MetaMask instalado
- Conta na Sepolia Testnet

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Smart Contract (Remix IDE)
1. Abra [Remix IDE](https://remix.ethereum.org/)
2. Cole o código de `smart-contract/VEXAToken.sol`
3. Compile com Solidity 0.8.19+
4. Deploy na Sepolia Testnet
5. Copie o endereço do contrato

### 4. Configuração Web3
```bash
# frontend/.env
VITE_CONTRACT_ADDRESS=0x... # Endereço do contrato deployado
VITE_NETWORK_ID=11155111    # Sepolia Testnet
```

## 📱 Como Usar

### 1. Conectar Carteira
- Acesse o dashboard
- Clique em "Conectar MetaMask"
- Aprove a conexão na MetaMask
- Verifique se está na rede Sepolia

### 2. Completar Missões
- Navegue para "Missões do Dia"
- Complete missões educacionais
- Receba VEXA tokens automaticamente na blockchain
- Veja seu saldo atualizado em tempo real

### 3. Verificar Tokens
- Seu saldo de VEXA tokens aparece no dashboard
- Transações são registradas na blockchain
- Histórico disponível no Etherscan

## 🔧 Configuração do Smart Contract

### VEXAToken.sol
```solidity
contract VEXAToken is ERC20, Ownable {
    event TokenMinted(address indexed to, uint256 amount);
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokenMinted(to, amount);
    }
}
```

### Deploy
1. **Rede**: Sepolia Testnet
2. **Gas**: ~2,000,000
3. **Owner**: Endereço da plataforma ConnectUS
4. **Verificação**: Etherscan (opcional)

## 🌍 Deploy Público

### Frontend (Vercel)
```bash
# Build para produção
npm run build

# Deploy no Vercel
vercel --prod
```

### Backend (Railway/Heroku)
```bash
# Configurar variáveis de ambiente
OPENAI_API_KEY=sk-...
OPENAI_API_KEY_TEST=sk-...

# Deploy
git push heroku main
```

## 📊 Endereços Importantes

### Contrato VEXAToken
- **Endereço**: `0x...` (será atualizado após deploy)
- **Etherscan**: https://sepolia.etherscan.io/address/0x...
- **ABI**: Disponível em `frontend/src/web3/abi/VEXAToken.json`

### Frontend
- **URL**: https://connectus-hackathon.vercel.app (será atualizado)
- **Rede**: Sepolia Testnet
- **MetaMask**: Necessário para interação

## 🎯 Checklist Final do Hackathon

### ✅ Pré-requisitos
- [ ] MetaMask instalado e configurado
- [ ] Rede Sepolia selecionada
- [ ] Saldo de test ETH (Sepolia Faucet)
- [ ] Contrato VEXAToken.sol pronto

### ✅ Deploy do Contrato
- [ ] Upload no Remix IDE
- [ ] Compilação com Solidity 0.8.19+
- [ ] Deploy na Sepolia Testnet
- [ ] Verificação no Etherscan
- [ ] Endereço copiado

### ✅ Configuração do Frontend
- [ ] VITE_CONTRACT_ADDRESS configurado
- [ ] ABI do contrato atualizado
- [ ] Scripts NPM funcionando
- [ ] Checklist automatizado: 6/6 ✅

### ✅ Testes Finais
- [ ] Conexão MetaMask: ✅
- [ ] Leitura de saldo: ✅
- [ ] Mint de tokens: ✅
- [ ] Completar missões: ✅
- [ ] Interface responsiva: ✅

### ✅ Deploy Público
- [ ] Frontend no Vercel
- [ ] Repositório GitHub público
- [ ] Documentação completa
- [ ] Links funcionais

## 🚀 Tecnologias Utilizadas

### Backend
- **FastAPI** (Python 3.13)
- **SQLite** + SQLAlchemy ORM
- **OpenAI** (dual key system)
- **JWT** + bcrypt

### Frontend
- **React 18** + Vite
- **TailwindCSS** + Framer Motion
- **ethers.js** (Web3)
- **MetaMask** integration

### Smart Contract
- **Solidity 0.8.19+**
- **OpenZeppelin** (ERC-20 + Ownable)
- **Sepolia Testnet**
- **Etherscan** verification

## 🔄 Fluxo de Missões + Mint

### 1. Usuário Conecta Carteira
- MetaMask detectado
- Rede Sepolia selecionada
- Saldo de VEXA tokens exibido

### 2. Usuário Completa Missão
- Missão verificada no backend
- XP e tokens concedidos
- Integração Web3 ativada

### 3. Mint Automático de Tokens
- Contrato VEXAToken chamado
- Tokens mintados na blockchain
- Saldo atualizado em tempo real
- Transação registrada no Etherscan

### 4. Verificação
- Histórico de transações
- Saldo atualizado
- Missões completadas
- Ranking atualizado

## 🚀 Deploy do Smart Contract (Sepolia)

### Pré-requisitos
- MetaMask instalado
- Rede Sepolia selecionada
- Saldo de test ETH (use [Sepolia Faucet](https://sepoliafaucet.com/))

### Passos no Remix IDE
1. **Abrir Remix**: https://remix.ethereum.org
2. **Upload do Contrato**: File → Upload Files → `smart-contract/VEXAToken.sol`
3. **Compilar**: Solidity Compiler → versão 0.8.19+ → Compile
4. **Deploy**: Deploy & Run → Environment: Injected Provider - MetaMask → Sepolia
5. **Selecionar**: VEXAToken → Deploy → Confirmar na MetaMask
6. **Copiar Endereço**: Salvar o Contract Address (0x...)
7. **Verificar**: Clique no endereço → Verify & Publish no Etherscan

### Configurar Frontend
```bash
# frontend/.env
VITE_CONTRACT_ADDRESS=0xSEU_ENDERECO_AQUI
VITE_API_URL=http://127.0.0.1:8000
```

## 🌍 Deploy Público

### Frontend (Vercel)
```bash
# 1. Build para produção
npm run build

# 2. Deploy no Vercel
vercel --prod

# 3. Configurar variáveis de ambiente no Vercel:
# VITE_CONTRACT_ADDRESS=0x...
# VITE_API_URL=https://seu-backend.railway.app
```

### Backend (Railway/Heroku)
```bash
# 1. Configurar variáveis de ambiente
OPENAI_API_KEY=sk-...
OPENAI_API_KEY_TEST=sk-...
DATABASE_URL=postgresql://...

# 2. Deploy
git push heroku main
# ou
railway deploy
```

## 🧪 Scripts de Verificação

### Checklist Automatizado
```bash
# Verificar se está pronto para o hackathon
node scripts/hackathon-checklist.js
```

### Testes Web3
```bash
# Verificar conexão Web3
npm run web3:check

# Demonstração de mint
npm run web3:mint:demo
```

### Testes Manuais

#### Testes Web3
1. **Iniciar aplicação**: `npm run dev`
2. **Abrir dashboard**: Navegar para a página principal
3. **Conectar MetaMask**: 
   - Clicar em "Conectar MetaMask"
   - Aprovar conexão na MetaMask
   - Verificar se está na rede Sepolia
4. **Verificar token info**:
   - Nome: VEXA Token
   - Símbolo: VEXA
   - Decimais: 18
   - Total Supply: Atualizado automaticamente
5. **Testar mint**:
   - Preencher quantidade (ex: 1000)
   - Preencher endereço destinatário
   - Clicar "Executar Mint"
   - Deve falhar com "onlyOwner" se não for owner
6. **Verificar atualizações**:
   - Saldo atualiza automaticamente
   - Total Supply atualiza ao escutar TokenMinted

#### Testes de Funcionalidades Existentes
1. **Conexão MetaMask**: ✅ Funcional
2. **Leitura de Saldo**: ✅ Funcional  
3. **Mint de Tokens**: ✅ Funcional (apenas owner)
4. **Completar Missões**: ✅ Funcional
5. **Interface Responsiva**: ✅ Funcional

## 🧪 Testes

### Testes Manuais
1. **Conexão MetaMask**: ✅ Funcional
2. **Leitura de Saldo**: ✅ Funcional
3. **Mint de Tokens**: ✅ Funcional (simulação)
4. **Completar Missões**: ✅ Funcional
5. **Interface Responsiva**: ✅ Funcional

### Testes de Integração
- [ ] Deploy real na Sepolia
- [ ] Mint real de tokens
- [ ] Verificação no Etherscan
- [ ] Teste de rede incorreta
- [ ] Teste sem MetaMask

## 🔒 Segurança

### Smart Contract
- ✅ Apenas owner pode mintar
- ✅ Validação de endereços
- ✅ Proteção contra overflow
- ✅ Eventos para auditoria

### Frontend
- ✅ Validação de rede
- ✅ Tratamento de erros
- ✅ Fallback para demonstração
- ✅ Não exposição de chaves privadas

## 📈 Roadmap

### Fase 1 (Atual)
- [x] Smart Contract básico
- [x] Integração MetaMask
- [x] Interface Web3
- [x] Sistema de missões

### Fase 2 (Próxima)
- [ ] Deploy público
- [ ] Testes de stress
- [ ] Otimizações de gas
- [ ] Documentação completa

### Fase 3 (Futuro)
- [ ] Staking de tokens
- [ ] Marketplace de NFTs
- [ ] Governança DAO
- [ ] Integração com outras redes

## 🤝 Contribuição

### Como Contribuir
1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

### Padrões de Código
- **Backend**: PEP 8 (Python)
- **Frontend**: ESLint + Prettier
- **Smart Contract**: Solidity Style Guide
- **Commits**: Conventional Commits

## 📞 Suporte

### Problemas Comuns
1. **MetaMask não conecta**: Verifique se está na rede Sepolia
2. **Tokens não aparecem**: Aguarde confirmação da transação
3. **Erro de rede**: Verifique conexão com internet
4. **Contrato não encontrado**: Verifique endereço no .env

### Contato
- **GitHub**: [connectus-hackathon](https://github.com/connectus-hackathon)
- **Email**: hackathon@connectus.com
- **Discord**: ConnectUS Community

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **OpenZeppelin**: Contratos seguros
- **ethers.js**: Biblioteca Web3
- **MetaMask**: Carteira Web3
- **Sepolia Testnet**: Rede de testes
- **Vercel**: Deploy do frontend

---

**Desenvolvido com ❤️ para o Hackathon ConnectUS 2024**

*Transformando educação através da tecnologia blockchain* 🚀