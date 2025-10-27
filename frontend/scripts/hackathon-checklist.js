/**
 * Checklist automatizado para verificar se o projeto está pronto para o hackathon
 * 
 * Uso: node scripts/hackathon-checklist.js
 * 
 * Verifica:
 * - Configuração do contrato
 * - Conexão Web3
 * - Build do frontend
 * - Variáveis de ambiente
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const checks = {
  contractAddress: false,
  abiFile: false,
  envFile: false,
  buildSuccess: false,
  web3Dependencies: false,
  scripts: false
};

let totalChecks = 0;
let passedChecks = 0;

function logCheck(name, passed, message) {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`✅ ${name}: ${message}`);
  } else {
    console.log(`❌ ${name}: ${message}`);
  }
}

async function runChecklist() {
  console.log('🔍 CONNECTUS HACKATHON - CHECKLIST FINAL');
  console.log('=' .repeat(50));
  console.log('📅 Data:', new Date().toLocaleString());
  console.log('🎯 Objetivo: Verificar prontidão para submissão');
  console.log('');
  
  // 1. Verificar endereço do contrato
  try {
    const envPath = join(projectRoot, '.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      const hasContractAddress = envContent.includes('VITE_CONTRACT_ADDRESS=') && 
                                !envContent.includes('VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000') &&
                                envContent.match(/VITE_CONTRACT_ADDRESS=0x[a-fA-F0-9]{40}/);
      checks.contractAddress = hasContractAddress;
      logCheck('Endereço do Contrato', hasContractAddress, 
        hasContractAddress ? 'Configurado com endereço válido' : 'Não configurado ou endereço inválido');
    } else {
      logCheck('Arquivo .env', false, 'Arquivo .env não encontrado');
    }
  } catch (error) {
    logCheck('Endereço do Contrato', false, 'Erro ao verificar: ' + error.message);
  }

  // 2. Verificar ABI do contrato
  try {
    const abiPath = join(projectRoot, 'src', 'web3', 'abi', 'VEXAToken.json');
    const abiExists = existsSync(abiPath);
    checks.abiFile = abiExists;
    logCheck('ABI do Contrato', abiExists, 
      abiExists ? 'Arquivo encontrado' : 'Arquivo VEXAToken.json não encontrado');
  } catch (error) {
    logCheck('ABI do Contrato', false, 'Erro ao verificar: ' + error.message);
  }

  // 3. Verificar arquivo .env
  try {
    const envPath = join(projectRoot, '.env');
    const envExists = existsSync(envPath);
    checks.envFile = envExists;
    logCheck('Arquivo .env', envExists, 
      envExists ? 'Existe' : 'Não encontrado');
  } catch (error) {
    logCheck('Arquivo .env', false, 'Erro ao verificar: ' + error.message);
  }

  // 4. Verificar build do frontend
  try {
    const distPath = join(projectRoot, 'dist');
    const distExists = existsSync(distPath);
    checks.buildSuccess = distExists;
    logCheck('Build do Frontend', distExists, 
      distExists ? 'Pasta dist encontrada' : 'Execute npm run build primeiro');
  } catch (error) {
    logCheck('Build do Frontend', false, 'Erro ao verificar: ' + error.message);
  }

  // 5. Verificar dependências Web3
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const hasEthers = packageJson.dependencies && packageJson.dependencies.ethers;
    checks.web3Dependencies = hasEthers;
    logCheck('Dependências Web3', hasEthers, 
      hasEthers ? 'ethers.js instalado' : 'Execute npm install ethers');
  } catch (error) {
    logCheck('Dependências Web3', false, 'Erro ao verificar: ' + error.message);
  }

  // 6. Verificar scripts NPM
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const hasWeb3Scripts = packageJson.scripts && 
                          packageJson.scripts['web3:check'] && 
                          packageJson.scripts['web3:mint:demo'];
    checks.scripts = hasWeb3Scripts;
    logCheck('Scripts NPM', hasWeb3Scripts, 
      hasWeb3Scripts ? 'Scripts Web3 configurados' : 'Scripts Web3 não encontrados');
  } catch (error) {
    logCheck('Scripts NPM', false, 'Erro ao verificar: ' + error.message);
  }

  // Resultado final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESULTADO FINAL:');
  console.log(`✅ Aprovados: ${passedChecks}/${totalChecks}`);
  console.log(`❌ Falharam: ${totalChecks - passedChecks}/${totalChecks}`);
  
  const percentage = Math.round((passedChecks / totalChecks) * 100);
  console.log(`📈 Progresso: ${percentage}%`);
  
  if (percentage === 100) {
    console.log('\n🎉 PROJETO PRONTO PARA O HACKATHON!');
    console.log('🚀 Pode fazer deploy e apresentar!');
  } else if (percentage >= 80) {
    console.log('\n⚠️  QUASE PRONTO! Corrija os itens em vermelho.');
  } else {
    console.log('\n🔧 AINDA PRECISA DE AJUSTES! Veja os itens em vermelho.');
  }

  // Instruções específicas
  console.log('\n📋 PRÓXIMOS PASSOS:');
  
  if (!checks.contractAddress) {
    console.log('1. Deploy do contrato no Remix e configure VITE_CONTRACT_ADDRESS');
  }
  if (!checks.abiFile) {
    console.log('2. Baixe o ABI do contrato verificado e coloque em src/web3/abi/');
  }
  if (!checks.buildSuccess) {
    console.log('3. Execute: npm run build');
  }
  if (!checks.web3Dependencies) {
    console.log('4. Execute: npm install ethers');
  }
  
  console.log('5. Deploy no Vercel');
  console.log('6. Criar repositório GitHub público');
  console.log('7. Testar fluxo completo: conectar → completar missão → mint');

  return percentage === 100;
}

// Executar checklist
runChecklist().then(isReady => {
  process.exit(isReady ? 0 : 1);
});
