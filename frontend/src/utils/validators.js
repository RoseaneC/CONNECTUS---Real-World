// Validação de email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de chave pública Stellar
export const isValidStellarPublicKey = (publicKey) => {
  if (!publicKey) return false;
  
  // Chave pública Stellar deve ter 56 caracteres e começar com 'G'
  const stellarRegex = /^G[A-Z0-9]{55}$/;
  return stellarRegex.test(publicKey);
};

// Validação de conta Stellar
export const isValidStellarAccount = (accountId) => {
  if (!accountId) return false;
  
  // Conta Stellar deve ter 56 caracteres e começar com 'G'
  const accountRegex = /^G[A-Z0-9]{55}$/;
  return accountRegex.test(accountId);
};

// Validação de nickname
export const isValidNickname = (nickname) => {
  if (!nickname) return false;
  
  // Nickname deve ter entre 3 e 20 caracteres, apenas letras, números e underscore
  const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return nicknameRegex.test(nickname);
};

// Validação de nome completo
export const isValidFullName = (fullName) => {
  if (!fullName) return false;
  
  // Nome completo deve ter pelo menos 2 palavras e no máximo 100 caracteres
  const words = fullName.trim().split(/\s+/);
  return words.length >= 2 && fullName.length <= 100;
};

// Validação de idade
export const isValidAge = (age) => {
  if (!age) return false;
  
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= 13 && numAge <= 120;
};

// Validação de conteúdo de post
export const isValidPostContent = (content) => {
  if (!content) return false;
  
  // Conteúdo deve ter entre 1 e 1000 caracteres
  return content.trim().length >= 1 && content.length <= 1000;
};

// Validação de comentário
export const isValidComment = (comment) => {
  if (!comment) return false;
  
  // Comentário deve ter entre 1 e 500 caracteres
  return comment.trim().length >= 1 && comment.length <= 500;
};

// Validação de mensagem de chat
export const isValidChatMessage = (message) => {
  if (!message) return false;
  
  // Mensagem deve ter entre 1 e 1000 caracteres
  return message.trim().length >= 1 && message.length <= 1000;
};

// Validação de nome de sala de chat
export const isValidRoomName = (name) => {
  if (!name) return false;
  
  // Nome deve ter entre 3 e 50 caracteres
  return name.trim().length >= 3 && name.length <= 50;
};

// Validação de quantidade de tokens
export const isValidTokenAmount = (amount) => {
  if (!amount) return false;
  
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 1000000;
};

// Validação de progresso de missão
export const isValidMissionProgress = (progress) => {
  if (progress === null || progress === undefined) return false;
  
  const numProgress = parseInt(progress);
  return !isNaN(numProgress) && numProgress >= 0 && numProgress <= 100;
};

// Validação de URL de imagem
export const isValidImageUrl = (url) => {
  if (!url) return true; // URL opcional
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validação de senha (se necessário no futuro)
export const isValidPassword = (password) => {
  if (!password) return false;
  
  // Senha deve ter pelo menos 8 caracteres
  return password.length >= 8;
};

// Validação de confirmação de senha
export const isValidPasswordConfirmation = (password, confirmation) => {
  return password === confirmation;
};

// Validação de formulário de registro
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  if (!isValidStellarAccount(formData.stellar_account_id)) {
    errors.stellar_account_id = 'Conta Stellar inválida';
  }
  
  if (!isValidStellarPublicKey(formData.public_key)) {
    errors.public_key = 'Chave pública Stellar inválida';
  }
  
  if (!isValidNickname(formData.nickname)) {
    errors.nickname = 'Nickname deve ter entre 3 e 20 caracteres (apenas letras, números e _)';
  }
  
  if (!isValidFullName(formData.full_name)) {
    errors.full_name = 'Nome completo deve ter pelo menos 2 palavras e no máximo 100 caracteres';
  }
  
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Email inválido';
  }
  
  if (!isValidAge(formData.age)) {
    errors.age = 'Idade deve ser entre 13 e 120 anos';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validação de formulário de post
export const validatePostForm = (formData) => {
  const errors = {};
  
  if (!isValidPostContent(formData.content)) {
    errors.content = 'Conteúdo deve ter entre 1 e 1000 caracteres';
  }
  
  if (formData.image_url && !isValidImageUrl(formData.image_url)) {
    errors.image_url = 'URL da imagem inválida';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validação de formulário de comentário
export const validateCommentForm = (formData) => {
  const errors = {};
  
  if (!isValidComment(formData.content)) {
    errors.content = 'Comentário deve ter entre 1 e 500 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};




