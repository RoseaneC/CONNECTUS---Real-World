// Formatação de datas
export const formatDate = (dateString) => {
  if (!dateString) return 'Data não disponível';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

// Formatação de data relativa (ex: "há 2 horas")
export const formatRelativeDate = (dateString) => {
  if (!dateString) return 'Data não disponível';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    console.error('Erro ao formatar data relativa:', error);
    return 'Data inválida';
  }
};

// Formatação de tokens
export const formatTokens = (tokens) => {
  if (!tokens) return '0.00';
  
  try {
    const numTokens = parseFloat(tokens);
    if (isNaN(numTokens)) return '0.00';
    
    return numTokens.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  } catch (error) {
    console.error('Erro ao formatar tokens:', error);
    return '0.00';
  }
};

// Formatação de XP
export const formatXP = (xp) => {
  if (!xp) return '0';
  
  try {
    const numXP = parseInt(xp);
    if (isNaN(numXP)) return '0';
    
    return numXP.toLocaleString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar XP:', error);
    return '0';
  }
};

// Formatação de nível
export const formatLevel = (level) => {
  if (!level) return '1';
  
  try {
    const numLevel = parseInt(level);
    if (isNaN(numLevel)) return '1';
    
    return `Nível ${numLevel}`;
  } catch (error) {
    console.error('Erro ao formatar nível:', error);
    return 'Nível 1';
  }
};

// Formatação de porcentagem
export const formatPercentage = (value, total) => {
  if (!value || !total) return '0%';
  
  try {
    const percentage = (parseFloat(value) / parseFloat(total)) * 100;
    return `${percentage.toFixed(1)}%`;
  } catch (error) {
    console.error('Erro ao formatar porcentagem:', error);
    return '0%';
  }
};

// Formatação de ranking
export const formatRank = (rank) => {
  if (!rank) return 'N/A';
  
  try {
    const numRank = parseInt(rank);
    if (isNaN(numRank)) return 'N/A';
    
    if (numRank === 1) return '🥇 1º';
    if (numRank === 2) return '🥈 2º';
    if (numRank === 3) return '🥉 3º';
    
    return `${numRank}º`;
  } catch (error) {
    console.error('Erro ao formatar ranking:', error);
    return 'N/A';
  }
};

// Formatação de texto (truncar)
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Formatação de nome de usuário
export const formatUsername = (username) => {
  if (!username) return 'Usuário';
  
  return `@${username}`;
};

// Formatação de categoria de missão
export const formatMissionCategory = (category) => {
  const categories = {
    'school': 'Escola',
    'study': 'Estudos',
    'environment': 'Meio Ambiente',
    'community': 'Comunidade',
    'health': 'Saúde',
    'sports': 'Esportes',
    'arts': 'Artes',
    'technology': 'Tecnologia'
  };
  
  return categories[category] || category;
};

// Formatação de dificuldade de missão
export const formatMissionDifficulty = (difficulty) => {
  const difficulties = {
    'easy': 'Fácil',
    'medium': 'Médio',
    'hard': 'Difícil'
  };
  
  return difficulties[difficulty] || difficulty;
};

// Formatação de status de missão
export const formatMissionStatus = (isCompleted, progress) => {
  if (isCompleted) return 'Concluída';
  if (progress > 0) return `Em progresso (${progress}%)`;
  return 'Não iniciada';
};








