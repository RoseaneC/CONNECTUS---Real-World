const AVATAR_BASE = 'https://api.dicebear.com/7.x/thumbs/svg?seed=';

export const isDemo =
  import.meta.env.VITE_DEMO_SEED === 'true' ||
  import.meta.env.VITE_WEB3_DEMO_MODE === 'true';

export type DemoRankingUser = {
  id: string;
  name: string;
  nickname: string;
  level: number;
  xp: number;
  tokens: number;
  missions: number;
  position: number;
  avatarUrl?: string;
};

const now = Date.now();

export const demoRankingTop5: DemoRankingUser[] = [
  {
    id: 'u1',
    name: 'Ana Souza',
    nickname: 'ana.souza',
    level: 7,
    xp: 1280,
    tokens: 420,
    missions: 18,
    position: 1,
    avatarUrl: `${AVATAR_BASE}Ana%20Souza`,
  },
  {
    id: 'u2',
    name: 'Bruno Lima',
    nickname: 'bruno.lima',
    level: 6,
    xp: 1105,
    tokens: 365,
    missions: 16,
    position: 2,
    avatarUrl: `${AVATAR_BASE}Bruno%20Lima`,
  },
  {
    id: 'u3',
    name: 'Carla Dias',
    nickname: 'carla.dias',
    level: 6,
    xp: 1040,
    tokens: 330,
    missions: 15,
    position: 3,
    avatarUrl: `${AVATAR_BASE}Carla%20Dias`,
  },
  {
    id: 'u4',
    name: 'Diego Neri',
    nickname: 'diego.neri',
    level: 5,
    xp: 980,
    tokens: 290,
    missions: 14,
    position: 4,
    avatarUrl: `${AVATAR_BASE}Diego%20Neri`,
  },
  {
    id: 'u5',
    name: 'Elisa Cruz',
    nickname: 'elisa.cruz',
    level: 5,
    xp: 905,
    tokens: 250,
    missions: 12,
    position: 5,
    avatarUrl: `${AVATAR_BASE}Elisa%20Cruz`,
  },
];

export const demoDashboardCards = {
  totalXP: 120,
  tokensDisponiveis: 35,
  missoesCompletas: 3,
  nivelAtual: 2,
};

export type DemoTimelineEntry = {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  category?: string;
};

export const demoTimeline: DemoTimelineEntry[] = [
  {
    id: 'p1',
    authorId: 'u1',
    text: 'Completei a missão de Matemática e ajudei 2 colegas 💪',
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    likes: 34,
    comments: 5,
    shares: 2,
    category: 'Educação',
  },
  {
    id: 'p2',
    authorId: 'u3',
    text: 'Participei do mutirão de limpeza da escola 🧹',
    createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    likes: 28,
    comments: 3,
    shares: 1,
    category: 'Comunidade',
  },
  {
    id: 'p3',
    authorId: 'u2',
    text: 'Respondi 3 dúvidas no fórum de estudo 📚',
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 22,
    comments: 4,
    shares: 1,
    category: 'Mentoria',
  },
  {
    id: 'p4',
    authorId: 'u1',
    text: 'Hoje eu doei sangue no Hemorio 🩸 #Saúde #Solidariedade',
    createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
    likes: 42,
    comments: 6,
    shares: 3,
    category: 'Saúde',
  },
  {
    id: 'p5',
    authorId: 'u4',
    text: 'Reciclei 10 garrafas PET no ecoponto da escola ♻️ #MeioAmbiente #Reciclagem',
    createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    likes: 31,
    comments: 4,
    shares: 2,
    category: 'Meio Ambiente',
  },
  {
    id: 'p6',
    authorId: 'u3',
    text: 'Plantei 5 mudas de árvore no pátio da escola 🌱 #Clima',
    createdAt: new Date(now - 28 * 60 * 60 * 1000).toISOString(),
    likes: 27,
    comments: 3,
    shares: 1,
    category: 'Meio Ambiente',
  },
];

export const demoMyRankingPosition = 15;

export const getDemoUser = (id: string): DemoRankingUser | undefined =>
  demoRankingTop5.find((user) => user.id === id);


