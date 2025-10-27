# 🎯 GUIA FINAL - 1 PASSO E MEIO PARA 100%

## ✅ STATUS: 83% PRONTO → 100% EM 5 MINUTOS

### **PASSO 1: Deploy do Contrato (3 minutos)**

#### 1.1 Abrir Remix IDE
- URL: https://remix.ethereum.org
- MetaMask conectado na **Sepolia Testnet**
- Saldo de test ETH (use [Sepolia Faucet](https://sepoliafaucet.com/))

#### 1.2 Upload do Contrato
- **File** → **Upload Files** → Selecione `smart-contract/VEXAToken.sol`
- Aguarde upload completo

#### 1.3 Compilar
- **Solidity Compiler** → Versão: **0.8.19** (ou superior)
- **Compile** → Aguarde "Compilation successful"
- ✅ Verificar: Sem erros de compilação

#### 1.4 Deploy
- **Deploy & Run** → Environment: **Injected Provider - MetaMask**
- **Account**: Sua conta MetaMask (Sepolia)
- **Contract**: Selecione **VEXAToken**
- **Deploy** → Confirmar na MetaMask
- ⏳ Aguardar confirmação da transação

#### 1.5 Copiar Endereço
- Após deploy, copie o **Contract Address** (0x...)
- **IMPORTANTE**: Salve este endereço!

#### 1.6 Verificar no Etherscan (OBRIGATÓRIO)
- Acesse: https://sepolia.etherscan.io/address/SEU_ENDERECO
- **Contract** → **Verify and Publish**
- **Compiler Version**: v0.8.19+
- **License**: MIT License (MIT)
- **Source Code**: Cole o código do VEXAToken.sol
- **Submit for Verification**
- ⏳ Aguardar verificação (2-3 minutos)

### **PASSO 2: Configurar Frontend (1 minuto)**

#### 2.1 Criar/Editar .env
```bash
# frontend/.env
VITE_CONTRACT_ADDRESS=0xSEU_ENDERECO_AQUI
VITE_API_URL=http://127.0.0.1:8000
```

#### 2.2 Reiniciar Frontend
```bash
cd frontend
npm run dev
```

### **PASSO 3: Validar (30 segundos)**

#### 3.1 Checklist Automatizado
```bash
# Na raiz do projeto
node frontend/scripts/hackathon-checklist.js
```

**ESPERADO**: ✅ Aprovados: 6/6

#### 3.2 Testes Web3
```bash
# Em outro terminal
cd frontend
npm run web3:check
```

**ESPERADO**: ✅ Saldo de VEXA tokens exibido

## 🎉 RESULTADO FINAL

Após completar os passos acima:

- ✅ **Contrato verificado** na Sepolia
- ✅ **Frontend configurado** com endereço real
- ✅ **Checklist**: 6/6 aprovados
- ✅ **Web3 funcionando** perfeitamente
- ✅ **Projeto 100% pronto** para o hackathon!

## 🚨 TROUBLESHOOTING RÁPIDO

### "Endereço do Contrato: Não configurado"
- ❌ **Problema**: `VITE_CONTRACT_ADDRESS` não configurado
- ✅ **Solução**: Adicionar no `frontend/.env`

### "Ownable: caller is not the owner"
- ❌ **Problema**: Apenas owner pode fazer mint
- ✅ **Solução**: Normal para demo, use conta que fez deploy

### "insufficient funds for gas"
- ❌ **Problema**: Saldo insuficiente
- ✅ **Solução**: Use [Sepolia Faucet](https://sepoliafaucet.com/)

### Saldo não atualiza
- ❌ **Problema**: Rede incorreta
- ✅ **Solução**: Verificar se MetaMask está na Sepolia

## 📤 O QUE ME MANDAR DEPOIS

1. **Endereço do contrato** (0x...)
2. **Link do Etherscan** (verificado)
3. **Print do checklist** ("Aprovados: 6/6")

## 🏆 PRONTO!

Com esses 3 itens, o projeto estará **100% pronto** para o hackathon!

**Boa sorte! 🚀**


