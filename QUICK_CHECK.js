/**
 * Verificação rápida do status do projeto
 * 
 * Uso: node QUICK_CHECK.js
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 CONNECTUS HACKATHON - VERIFICAÇÃO RÁPIDA');
console.log('=' .repeat(50));

// Verificar arquivos essenciais
const checks = [
  {
    name: 'Smart Contract',
    path: 'smart-contract/VEXAToken.sol',
    status: existsSync(join(__dirname, 'smart-contract/VEXAToken.sol'))
  },
  {
    name: 'ABI do Contrato',
    path: 'frontend/src/web3/abi/VEXAToken.json',
    status: existsSync(join(__dirname, 'frontend/src/web3/abi/VEXAToken.json'))
  },
  {
    name: 'Scripts Web3',
    path: 'frontend/scripts/web3-check.js',
    status: existsSync(join(__dirname, 'frontend/scripts/web3-check.js'))
  },
  {
    name: 'Checklist Automatizado',
    path: 'frontend/scripts/hackathon-checklist.js',
    status: existsSync(join(__dirname, 'frontend/scripts/hackathon-checklist.js'))
  },
  {
    name: 'Documentação',
    path: 'README.md',
    status: existsSync(join(__dirname, 'README.md'))
  }
];

let passed = 0;
let total = checks.length;

checks.forEach(check => {
  if (check.status) {
    console.log(`✅ ${check.name}: OK`);
    passed++;
  } else {
    console.log(`❌ ${check.name}: FALTANDO`);
  }
});

console.log('\n' + '=' .repeat(50));
console.log(`📊 STATUS: ${passed}/${total} arquivos essenciais`);
console.log(`📈 Progresso: ${Math.round((passed/total) * 100)}%`);

if (passed === total) {
  console.log('\n🎉 PROJETO ESTRUTURALMENTE PRONTO!');
  console.log('🚀 Falta apenas:');
  console.log('   1. Deploy do contrato no Remix');
  console.log('   2. Configurar VITE_CONTRACT_ADDRESS');
  console.log('   3. Executar checklist final');
} else {
  console.log('\n⚠️  AINDA FALTAM ARQUIVOS ESSENCIAIS');
  console.log('🔧 Verifique os itens em vermelho');
}

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Deploy no Remix: https://remix.ethereum.org');
console.log('2. Configurar .env com endereço do contrato');
console.log('3. Executar: node frontend/scripts/hackathon-checklist.js');
console.log('4. Esperado: 6/6 aprovados');









