# ConnectUS - Plataforma Social Gamificada Educacional

## 🎯 Visão Geral

O ConnectUS é uma plataforma social gamificada que combina educação, interação social e tecnologia blockchain para criar uma experiência de aprendizado envolvente e recompensadora.

## 🌟 Principais Funcionalidades

### 🎮 Sistema de Gamificação
- **XP e Níveis**: Sistema de pontos de experiência e níveis de progresso
- **Ranking**: Classificação global e por período
- **Missões Verificáveis**: Sistema de missões com verificação QR e ações in-app
- **Tokens VEXA**: Sistema de recompensas com tokens blockchain

### 🤖 Inteligência Artificial VEXA
- **Assistente Educacional**: IA especializada em educação
- **Chat Interativo**: Conversas naturais com contexto educacional
- **Dual Key System**: Sistema robusto de chaves API com fallback automático

### 🌐 Integração Web3
- **MetaMask Integration**: Conexão com carteiras Ethereum
- **VEXA Token (ERC-20)**: Token personalizado na rede Sepolia
- **Mint de Tokens**: Sistema de recompensas blockchain
- **Verificação de Owner**: Controle de acesso baseado em propriedade do contrato

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.13+
- Node.js 18+
- MetaMask instalado
- Conta na rede Sepolia com ETH de teste

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Variáveis de Ambiente

#### Backend (.env)
```env
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=sqlite:///./connectus.db
OPENAI_API_KEY=sk-sua-chave-openai-aqui
OPENAI_API_KEY_TEST=sk-sua-chave-teste-aqui
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
```

#### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_NETWORK_NAME=sepolia
VITE_CHAIN_ID=11155111
VITE_CONTRACT_ADDRESS=0xSEU_CONTRATO_AQUI
VITE_ENABLE_MINT=false
```

## 🌐 Web3 Integration

### Rede Blockchain
- **Rede**: Ethereum Sepolia (Chain ID: 11155111)
- **Carteira**: MetaMask
- **Contrato**: VEXAToken (ERC-20)

### Funcionalidades Web3
- **Conexão de Carteira**: Integração com MetaMask
- **Verificação de Rede**: Validação automática da rede Sepolia
- **Status do Contrato**: Verificação de validade do contrato
- **Mint de Tokens**: Sistema restrito ao owner do contrato
- **Flag de Controle**: VITE_ENABLE_MINT para ativar/desativar mint

### Segurança
- **Verificação de Owner**: Apenas o proprietário do contrato pode fazer mint
- **Validação de Rede**: Força uso da rede Sepolia
- **Flag de Ambiente**: Controle via variável de ambiente

## 🧪 Testes

### Scripts de Verificação
```bash
# Checklist completo do hackathon
node frontend/scripts/hackathon-checklist.js

# Teste de restrições de mint
node frontend/scripts/test-mint-restrictions.js

# Verificação de melhorias UX
node frontend/scripts/test-ux-improvements.js
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

## 🔗 Links Finais

- **dApp Pública**: [Vercel - A ser preenchido]
- **Etherscan**: [Contrato Verificado - A ser preenchido]
- **Vídeo Demo**: [YouTube - A ser preenchido]
- **Repositório**: [GitHub - A ser preenchido]

## 🚨 Troubleshooting

### Problemas Comuns

#### "Rede incorreta"
- **Problema**: MetaMask não está na Sepolia
- **Solução**: Clicar em "Trocar para Sepolia" no NetworkHealth

#### "Sem ETH para gas"
- **Problema**: Saldo insuficiente na Sepolia
- **Solução**: Usar [Sepolia Faucet](https://sepoliafaucet.com/)

#### "onlyOwner: caller is not the owner"
- **Problema**: Apenas owner pode fazer mint
- **Solução**: Normal para demo, use conta que fez deploy

#### "Endereço do Contrato: Não configurado"
- **Problema**: VITE_CONTRACT_ADDRESS não configurado
- **Solução**: Adicionar no frontend/.env

## 📊 Status do Projeto

### ✅ Implementado
- [x] Smart Contract VEXAToken (ERC-20)
- [x] Integração Web3 completa (ethers.js v6)
- [x] Sistema de missões verificáveis
- [x] IA VEXA com dual key system
- [x] Interface responsiva e moderna
- [x] Sistema de gamificação (XP, ranking)
- [x] Autenticação e autorização
- [x] Verificação de owner para mint
- [x] Flags de ambiente para controle
- [x] Scripts de verificação automatizados

### 🚀 Próximos Passos
- [ ] Deploy do contrato na Sepolia Testnet
- [ ] Deploy do frontend no Vercel
- [ ] Teste de integração completa
- [ ] Criação de repositório público

## 🤝 Contribuição

Este é um projeto de hackathon. Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏆 Hackathon

Este projeto foi desenvolvido para o ConnectUS Hackathon, demonstrando integração completa entre:
- **Backend FastAPI** com IA educacional
- **Frontend React** com interface moderna
- **Blockchain Ethereum** com tokens personalizados
- **Sistema de Gamificação** com missões verificáveis

---

**Desenvolvido com ❤️ para o ConnectUS Hackathon**


