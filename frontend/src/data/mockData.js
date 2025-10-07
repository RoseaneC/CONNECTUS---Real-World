// Dados mockados para o frontend funcionar sem backend
export const mockData = {
  // Dados do usuário
  user: {
    id: 1,
    nickname: "UsuarioTeste",
    full_name: "Usuário Teste",
    email: "teste@exemplo.com",
    age: 20,
    xp: 1250,
    tokens_earned: 45.50,
    tokens_available: 32.75,
    tokens_in_yield: 12.75,
    missions_completed: 8,
    level: 5,
    is_minor: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    last_login: "2024-01-15T14:30:00Z"
  },

  // Posts da timeline
  posts: [
    {
      id: 1,
      content: "Acabei de completar a missão de reciclagem! 🌱",
      image_url: null,
      author_id: 1,
      author_nickname: "joao_silva",
      author_avatar: "J",
      likes_count: 12,
      comments_count: 3,
      is_liked: false,
      created_at: "2024-01-15T14:30:00Z"
    },
    {
      id: 2,
      content: "Estudando para o vestibular! 📚 #foco #estudos",
      image_url: null,
      author_id: 2,
      author_nickname: "maria_santos",
      author_avatar: "M",
      likes_count: 8,
      comments_count: 1,
      is_liked: true,
      created_at: "2024-01-15T13:45:00Z"
    },
    {
      id: 3,
      content: "Nova missão disponível: Cuidar do território! Vamos juntos! 💪",
      image_url: null,
      author_id: 3,
      author_nickname: "pedro_costa",
      author_avatar: "P",
      likes_count: 15,
      comments_count: 5,
      is_liked: false,
      created_at: "2024-01-15T12:20:00Z"
    }
  ],

  // Missões
  missions: [
    {
      id: 1,
      title: "Ir à escola",
      description: "Vá à escola hoje e registre sua presença",
      category: "school",
      xp_reward: 50,
      token_reward: 2.0,
      difficulty: "easy",
      is_completed: false,
      progress: 0,
      deadline: null
    },
    {
      id: 2,
      title: "Estudar 1h30",
      description: "Dedique 1 hora e 30 minutos aos estudos",
      category: "study",
      xp_reward: 75,
      token_reward: 3.0,
      difficulty: "medium",
      is_completed: false,
      progress: 60,
      deadline: null
    },
    {
      id: 3,
      title: "Reciclar latinhas",
      description: "Colete e recicle 10 latinhas de alumínio",
      category: "environment",
      xp_reward: 100,
      token_reward: 5.0,
      difficulty: "medium",
      is_completed: true,
      progress: 100,
      deadline: null
    },
    {
      id: 4,
      title: "Cuidar do território",
      description: "Divulgue oportunidades de estudo na sua comunidade",
      category: "community",
      xp_reward: 150,
      token_reward: 8.0,
      difficulty: "hard",
      is_completed: false,
      progress: 25,
      deadline: null
    }
  ],

  // Ranking
  ranking: [
    {
      position: 1,
      name: "João Silva",
      nickname: "joao_silva",
      level: 12,
      xp: 2450,
      tokens: 125.50,
      missions: 45,
      score: 2850
    },
    {
      position: 2,
      name: "Maria Santos",
      nickname: "maria_santos",
      level: 10,
      xp: 2100,
      tokens: 98.75,
      missions: 38,
      score: 2450
    },
    {
      position: 3,
      name: "Pedro Costa",
      nickname: "pedro_costa",
      level: 9,
      xp: 1850,
      tokens: 87.25,
      missions: 35,
      score: 2150
    },
    {
      position: 4,
      name: "Ana Oliveira",
      nickname: "ana_oliveira",
      level: 8,
      xp: 1650,
      tokens: 76.50,
      missions: 32,
      score: 1950
    },
    {
      position: 5,
      name: "Carlos Lima",
      nickname: "carlos_lima",
      level: 7,
      xp: 1450,
      tokens: 65.25,
      missions: 28,
      score: 1750
    }
  ],

  // Salas de chat
  chatRooms: [
    {
      id: 1,
      name: "Geral",
      description: "Chat geral da comunidade",
      members_count: 156,
      is_private: false
    },
    {
      id: 2,
      name: "Missões",
      description: "Discussões sobre missões e conquistas",
      members_count: 89,
      is_private: false
    },
    {
      id: 3,
      name: "Dúvidas",
      description: "Tire suas dúvidas aqui",
      members_count: 45,
      is_private: false
    },
    {
      id: 4,
      name: "Suporte",
      description: "Suporte técnico",
      members_count: 12,
      is_private: false
    }
  ],

  // Mensagens de chat
  chatMessages: [
    {
      id: 1,
      content: "Pessoal, acabei de completar a missão de reciclagem! 🌱",
      user_id: 1,
      user_nickname: "joao_silva",
      user_avatar: "J",
      user_level: 5,
      room_id: 1,
      timestamp: "14:30",
      is_own: false
    },
    {
      id: 2,
      content: "Parabéns! Eu também estou trabalhando nessa missão.",
      user_id: 2,
      user_nickname: "maria_santos",
      user_avatar: "M",
      user_level: 8,
      room_id: 1,
      timestamp: "14:32",
      is_own: false
    },
    {
      id: 3,
      content: "Consegui 15 latinhas hoje! A meta era 10 😊",
      user_id: 3,
      user_nickname: "usuario_atual",
      user_avatar: "U",
      user_level: 3,
      room_id: 1,
      timestamp: "14:35",
      is_own: true
    }
  ],

  // Notificações
  notifications: [
    {
      id: 1,
      title: "Nova missão disponível!",
      message: "Missão 'Cuidar do território' está disponível",
      time: "Há 2 horas",
      read: false
    },
    {
      id: 2,
      title: "Você subiu de nível!",
      message: "Parabéns! Você alcançou o nível 5",
      time: "Ontem",
      read: false
    },
    {
      id: 3,
      title: "Novo post curtido",
      message: "Seu post sobre reciclagem foi curtido",
      time: "2 dias atrás",
      read: true
    }
  ]
}

export default mockData


