# 🚀 Instruções de Deploy - ConnectUS Hackathon

## 📋 Smart Contract (VEXAToken.sol)

### 1. Compilação no Remix

1. **Acesse**: https://remix.ethereum.org
2. **Upload**: Faça upload do arquivo `smart-contract/VEXAToken.sol`
3. **Compilar**:
   - Versão do compilador: **0.8.19** ou **0.8.30**
   - Otimização: **200 runs**
   - Licença: **MIT**
4. **Verificar**: Sem erros de compilação

### 2. Deploy na Sepolia

1. **Conectar MetaMask**:
   - Certifique-se de estar na rede Sepolia
   - Tenha ETH de teste (use [Sepolia Faucet](https://sepoliafaucet.com/))
2. **Deploy**:
   - Environment: **Injected Provider - MetaMask**
   - Account: Sua conta MetaMask (Sepolia)
   - Contract: Selecione **VEXAToken**
   - Clique em **Deploy**
3. **Confirmar**: Aprove a transação na MetaMask
4. **Copiar Endereço**: Salve o endereço do contrato (0x...)

### 3. Verificação no Etherscan

1. **Acesse**: https://sepolia.etherscan.io/address/SEU_ENDERECO
2. **Verificar Contrato**:
   - Clique em **Contract** → **Verify and Publish**
   - **Compiler Version**: 0.8.19 (ou 0.8.30)
   - **License**: MIT
   - **Optimization**: Yes (200 runs)
   - **Source Code**: Cole o código do VEXAToken.sol
3. **Submit**: Clique em **Submit for Verification**
4. **Aguardar**: Verificação pode levar 2-3 minutos

### 4. Configurar Frontend

1. **Atualizar .env**:
   ```env
   VITE_CONTRACT_ADDRESS=0xSEU_ENDERECO_AQUI
   VITE_CHAIN_ID=11155111
   VITE_ENABLE_MINT=false
   ```

2. **Testar Localmente**:
   ```bash
   cd frontend
   npm run dev
   ```

## 🌐 Frontend (Vercel)

### 1. Preparar Repositório

1. **Criar repositório GitHub**:
   - Nome: `connectus-hackathon`
   - Visibilidade: Público
   - Upload dos arquivos do projeto

2. **Estrutura do repositório**:
   ```
   connectus-hackathon/
   ├── backend/
   ├── frontend/
   ├── smart-contract/
   ├── README.md
   └── DEPLOY_INSTRUCTIONS.md
   ```

### 2. Deploy no Vercel

1. **Acesse**: https://vercel.com
2. **Import Project**:
   - Conecte sua conta GitHub
   - Selecione o repositório `connectus-hackathon`
   - Root Directory: `frontend`

3. **Configurar Build**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Variáveis de Ambiente**:
   ```env
   VITE_API_URL=https://seu-backend.herokuapp.com
   VITE_NETWORK_NAME=sepolia
   VITE_CHAIN_ID=11155111
   VITE_CONTRACT_ADDRESS=0xSEU_ENDERECO_AQUI
   VITE_ENABLE_MINT=false
   ```

5. **Deploy**: Clique em **Deploy**

### 3. Testar Deploy

1. **Acesse a URL**: Fornecida pelo Vercel
2. **Conectar MetaMask**: 
   - Certifique-se de estar na Sepolia
   - Conecte sua carteira
3. **Verificar Funcionalidades**:
   - Status da rede
   - Informações do token
   - Saldo da carteira
   - Mint (se for owner)

## 🔧 Backend (Opcional - Heroku/Railway)

### 1. Preparar Backend

1. **Criar Procfile**:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. **requirements.txt**:
   ```
   fastapi==0.104.1
   uvicorn==0.24.0
   sqlalchemy==2.0.23
   python-jose[cryptography]==3.3.0
   passlib[bcrypt]==1.7.4
   python-multipart==0.0.6
   httpx==0.25.2
   pydantic==2.5.0
   ```

### 2. Deploy no Heroku

1. **Instalar Heroku CLI**
2. **Login**: `heroku login`
3. **Criar App**: `heroku create connectus-backend`
4. **Configurar Variáveis**:
   ```bash
   heroku config:set SECRET_KEY=sua-chave-secreta
   heroku config:set OPENAI_API_KEY=sk-sua-chave
   heroku config:set OPENAI_API_KEY_TEST=sk-sua-chave-teste
   ```
5. **Deploy**: `git push heroku main`

## ✅ Checklist de Deploy

### Smart Contract
- [ ] Contrato compilado sem erros
- [ ] Deploy realizado na Sepolia
- [ ] Transação confirmada
- [ ] Endereço copiado
- [ ] Verificação no Etherscan concluída
- [ ] ABI exportado

### Frontend
- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub
- [ ] Vercel conectado ao repositório
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Deploy concluído
- [ ] URL acessível

### Testes
- [ ] MetaMask conecta na dApp
- [ ] Rede Sepolia detectada
- [ ] Informações do token carregam
- [ ] Saldo da carteira exibido
- [ ] Mint funciona (se owner)
- [ ] Interface responsiva

## 🚨 Troubleshooting

### Smart Contract
- **"insufficient funds"**: Use Sepolia Faucet para obter ETH
- **"gas limit exceeded"**: Aumente o gas limit na MetaMask
- **"contract verification failed"**: Verifique versão do compilador

### Frontend
- **"Module not found"**: Verifique se todas as dependências estão instaladas
- **"Contract not found"**: Verifique se o endereço está correto
- **"Network error"**: Verifique se o backend está rodando

### Backend
- **"Port already in use"**: Use `--port 8001` ou mate o processo
- **"Database error"**: Verifique se o SQLite está acessível
- **"OpenAI error"**: Verifique se as chaves estão corretas

## 📞 Suporte

Para problemas durante o deploy:
1. Verifique os logs do Vercel/Heroku
2. Teste localmente primeiro
3. Verifique as variáveis de ambiente
4. Consulte a documentação do Etherscan

---

**Boa sorte com o deploy! 🚀**