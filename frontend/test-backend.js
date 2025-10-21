// Script para testar todas as funcionalidades do backend Connectus
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000';

// Configurar axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variáveis para armazenar dados de teste
let testUser = null;
let testToken = null;
let testPost = null;
let testMission = null;
let testRoom = null;

// Função para fazer log dos resultados
function logTest(testName, success, message = '') {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}: ${message}`);
}

// Teste 1: Verificar se o backend está rodando
async function testBackendConnection() {
  try {
    const response = await api.get('/');
    logTest('Backend Connection', true, `Status: ${response.status}, Message: ${response.data.message}`);
    return true;
  } catch (error) {
    logTest('Backend Connection', false, error.message);
    return false;
  }
}

// Teste 2: Registro de usuário
async function testUserRegistration() {
  try {
    const userData = {
      stellar_account_id: 'G' + Math.random().toString(36).substr(2, 55),
      public_key: 'G' + Math.random().toString(36).substr(2, 55),
      full_name: 'Usuário Teste',
      nickname: 'teste' + Math.floor(Math.random() * 1000),
      email: 'teste' + Math.floor(Math.random() * 1000) + '@example.com',
      birth_date: '2000-01-01',
      school_name: 'Escola Teste',
      grade: '9º ano'
    };

    const response = await api.post('/auth/register', userData);
    testUser = response.data.user;
    testToken = response.data.access_token;
    
    // Configurar token para próximas requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${testToken}`;
    
    logTest('User Registration', true, `Usuário criado: ${testUser.nickname}`);
    return true;
  } catch (error) {
    logTest('User Registration', false, error.response?.data?.detail || error.message);
    return false;
  }
}

// Teste 3: Login de usuário
async function testUserLogin() {
  try {
    const response = await api.get('/auth/me');
    logTest('User Login', true, `Usuário logado: ${response.data.nickname}`);
    return true;
  } catch (error) {
    logTest('User Login', false, error.response?.data?.detail || error.message);
    return false;
  }
}

// Teste 4: Timeline de Posts
async function testPostsTimeline() {
  try {
    // Criar um post
    const postData = {
      content: 'Post de teste criado via script',
      image_url: null
    };
    
    const createResponse = await api.post('/posts/', postData);
    testPost = createResponse.data;
    logTest('Create Post', true, `Post criado com ID: ${testPost.id}`);
    
    // Buscar timeline
    const timelineResponse = await api.get('/posts/timeline');
    logTest('Posts Timeline', true, `Timeline retornou ${timelineResponse.data.length} posts`);
    
    // Buscar meus posts
    const myPostsResponse = await api.get('/posts/my-posts');
    logTest('My Posts', true, `Meus posts: ${myPostsResponse.data.length} posts`);
    
    return true;
  } catch (error) {
    logTest('Posts Timeline', false, error.response?.data?.detail || error.message);
    return false;
  }
}

// Teste 5: Sistema de Missões
async function testMissions() {
  try {
    // Buscar todas as missões
    const missionsResponse = await api.get('/missions/');
    logTest('Get All Missions', true, `Encontradas ${missionsResponse.data.length} missões`);
    
    // Buscar minhas missões
    const myMissionsResponse = await api.get('/missions/my-missions');
    logTest('My Missions', true, `Minhas missões: ${myMissionsResponse.data.length} missões`);
    
    // Buscar missões diárias
    const dailyMissionsResponse = await api.get('/missions/daily');
    logTest('Daily Missions', true, `Missões diárias: ${dailyMissionsResponse.data.length} missões`);
    
    // Buscar estatísticas de missões
    const statsResponse = await api.get('/missions/stats');
    logTest('Mission Stats', true, `Estatísticas carregadas`);
    
    return true;
  } catch (error) {
    logTest('Missions System', false, error.response?.data?.detail || error.message);
    return false;
  }
}

// Teste 6: Sistema de Chat
async function testChat() {
  try {
    // Buscar salas de chat
    const roomsResponse = await api.get('/chat/rooms');
    logTest('Get Chat Rooms', true, `Encontradas ${roomsResponse.data.length} salas`);
    
    // Buscar minhas mensagens
    const myMessagesResponse = await api.get('/chat/my-messages');
    logTest('My Messages', true, `Minhas mensagens: ${myMessagesResponse.data.length} mensagens`);
    
    return true;
  } catch (error) {
    logTest('Chat System', false, error.response?.data?.detail || error.message);
    return false;
  }
}

// Teste 7: Sistema de Ranking
async function testRanking() {
  try {
    // Buscar ranking geral
    const overallResponse = await api.get('/ranking/overall');
    logTest('Overall Ranking', true, `Ranking geral: ${overallResponse.data.length} usuários`);
    
    // Buscar ranking de XP
    const xpResponse = await api.get('/ranking/xp');
    logTest('XP Ranking', true, `Ranking XP: ${xpResponse.data.length} usuários`);
    
    // Buscar ranking de tokens
    const tokensResponse = await api.get('/ranking/tokens');
    logTest('Tokens Ranking', true, `Ranking tokens: ${tokensResponse.data.length} usuários`);
    
    // Buscar ranking de missões
    const missionsResponse = await api.get('/ranking/missions');
    logTest('Missions Ranking', true, `Ranking missões: ${missionsResponse.data.length} usuários`);
    
    // Buscar minha posição
    const myPositionResponse = await api.get('/ranking/my-position');
    logTest('My Position', true, `Minha posição: ${myPositionResponse.data.position || 'N/A'}`);
    
    return true;
  } catch (error) {
    logTest('Ranking System', false, error.response?.data?.detail || error.message);
    return false;
  }
}

// Teste 8: Perfil do usuário
async function testUserProfile() {
  try {
    // Buscar perfil
    const profileResponse = await api.get('/users/profile');
    logTest('User Profile', true, `Perfil carregado: ${profileResponse.data.nickname}`);
    
    // Buscar saldo
    const balanceResponse = await api.get('/users/balance');
    logTest('User Balance', true, `Saldo: ${balanceResponse.data.tokens_available} tokens`);
    
    // Buscar transações
    const transactionsResponse = await api.get('/users/transactions');
    logTest('User Transactions', true, `Transações: ${transactionsResponse.data.transactions.length} registros`);
    
    // Buscar estatísticas
    const statsResponse = await api.get('/users/stats');
    logTest('User Stats', true, `Estatísticas carregadas`);
    
    return true;
  } catch (error) {
    logTest('User Profile', false, error.response?.data?.detail || error.message);
    return false;
  }
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes do backend Connectus...\n');
  
  const tests = [
    { name: 'Backend Connection', fn: testBackendConnection },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Posts Timeline', fn: testPostsTimeline },
    { name: 'Missions System', fn: testMissions },
    { name: 'Chat System', fn: testChat },
    { name: 'Ranking System', fn: testRanking }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passedTests++;
    } catch (error) {
      console.log(`❌ ${test.name}: Erro inesperado - ${error.message}`);
    }
    console.log(''); // Linha em branco entre testes
  }
  
  console.log('📊 Resumo dos Testes:');
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Todos os testes passaram! O backend está funcionando perfeitamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima para detalhes.');
  }
}

// Executar os testes
runAllTests().catch(console.error);






