# Connectus Frontend

Frontend da plataforma Connectus - uma rede social gamificada para jovens com integração Stellar.

## 🚀 Tecnologias

- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS
- **Framer Motion** - Animações
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **React Hot Toast** - Notificações
- **Zustand** - Gerenciamento de estado
- **Stellar SDK** - Integração com blockchain

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI
│   ├── navigation/     # Componentes de navegação
│   └── PrivateRoute.jsx # Rota protegida
├── context/            # Contextos React
│   └── AuthContext.jsx # Contexto de autenticação
├── hooks/              # Hooks personalizados
│   ├── useAuth.js      # Hook de autenticação
│   ├── useUser.js      # Hook de usuário
│   ├── usePosts.js     # Hook de posts
│   ├── useMissions.js  # Hook de missões
│   ├── useChat.js      # Hook de chat
│   └── useRanking.js   # Hook de ranking
├── services/           # Serviços de API
│   ├── api.js          # Cliente Axios
│   ├── userService.js  # Serviço de usuários
│   ├── postService.js  # Serviço de posts
│   ├── missionService.js # Serviço de missões
│   ├── chatService.js  # Serviço de chat
│   ├── rankingService.js # Serviço de ranking
│   └── stellarService.js # Serviço Stellar
├── utils/              # Utilitários
│   ├── formatters.js   # Formatação de dados
│   └── validators.js   # Validações
├── pages/              # Páginas da aplicação
├── layouts/            # Layouts
└── App.jsx             # Componente principal
```

## 🛠️ Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp env.example .env
```

3. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Build para produção:**
```bash
npm run build
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Backend

Certifique-se de que o backend está rodando em `http://127.0.0.1:8000`.

## 📱 Funcionalidades

### ✅ Implementadas

- **Autenticação JWT** com Stellar
- **Timeline de posts** com interações
- **Sistema de missões** gamificado
- **Chat em tempo real**
- **Ranking de usuários**
- **Perfil do usuário**
- **Busca de posts**
- **Notificações toast**
- **Design responsivo**

### 🔄 Em Desenvolvimento

- **WebSocket para chat**
- **Upload de imagens**
- **Sistema de conquistas**
- **Notificações push**

## 🎨 Design System

### Cores
- **Primária:** Azul (#3B82F6)
- **Secundária:** Roxo (#8B5CF6)
- **Sucesso:** Verde (#10B981)
- **Erro:** Vermelho (#EF4444)
- **Aviso:** Amarelo (#F59E0B)

### Componentes
- **Cards** com efeitos hover
- **Botões** com animações
- **Modais** responsivos
- **Formulários** validados
- **Loading states** animados

## 🔐 Autenticação

O sistema usa JWT para autenticação com integração Stellar:

1. **Login:** Chave pública Stellar
2. **Registro:** Dados do usuário + Stellar
3. **Token:** Armazenado no localStorage
4. **Headers:** Authorization Bearer automático

## 📡 API Integration

Todos os serviços estão integrados com o backend:

- **Users:** Perfil, saldo, transações
- **Posts:** Timeline, criar, curtir, comentar
- **Missions:** Listar, atribuir, completar
- **Chat:** Salas, mensagens, busca
- **Ranking:** XP, tokens, missões

## 🚀 Deploy

### Vercel
```bash
npm run build
# Upload da pasta dist/
```

### Netlify
```bash
npm run build
# Deploy automático
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Linter ESLint
- `npm run type-check` - Verificação de tipos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato:
- **Email:** suporte@connectus.com
- **Discord:** Connectus Community
- **GitHub Issues:** [Issues](https://github.com/connectus/issues)

---

**Connectus** - Conectando jovens através da gamificação e blockchain! 🚀





