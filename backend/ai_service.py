#!/usr/bin/env python3
"""
Serviço de IA Avançado para Connectus
Integração com OpenAI GPT-4 e funcionalidades educativas
"""

import openai
import json
import sqlite3
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import os
from dataclasses import dataclass

# Configurações
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
AI_MODEL = "gpt-4"
MAX_TOKENS = 2000
TEMPERATURE = 0.7

@dataclass
class AIResponse:
    """Resposta da IA"""
    content: str
    category: str
    confidence: float
    suggestions: List[str]
    metadata: Dict[str, Any]

class ConnectusAI:
    """IA Avançada do Connectus"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY)
        self.conversation_history = {}
        self.user_profiles = {}
    
    def get_user_context(self, user_id: int) -> Dict[str, Any]:
        """Obter contexto do usuário do banco"""
        conn = sqlite3.connect("database/connectus.db")
        cursor = conn.cursor()
        
        # Buscar dados do usuário
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return {}
        
        # Buscar histórico de conversas
        cursor.execute("""
            SELECT category, content, created_at 
            FROM ai_conversations 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10
        """, (user_id,))
        conversations = cursor.fetchall()
        
        # Buscar missões completadas
        cursor.execute("""
            SELECT title, description, xp_reward 
            FROM missions 
            WHERE id IN (
                SELECT mission_id FROM user_missions 
                WHERE user_id = ? AND completed = 1
            )
        """, (user_id,))
        completed_missions = cursor.fetchall()
        
        conn.close()
        
        return {
            "user": {
                "id": user[0],
                "nickname": user[1],
                "full_name": user[3],
                "age": user[6],
                "xp": user[7],
                "level": user[8],
                "bio": user[4]
            },
            "recent_conversations": conversations,
            "completed_missions": completed_missions
        }
    
    def categorize_query(self, query: str) -> str:
        """Categorizar a pergunta do usuário"""
        categories = {
            "estudos": ["explicar", "como funciona", "o que é", "conceito", "matéria", "aula", "estudar"],
            "dúvidas": ["dúvida", "não entendi", "confuso", "ajuda", "pergunta", "por que"],
            "curiosidades": ["curioso", "interessante", "fato", "sabia que", "descoberta", "novidade"],
            "exercicios": ["exercício", "problema", "questão", "resolver", "calcular", "fórmula"],
            "resumos": ["resumo", "sintetizar", "resumir", "pontos principais", "conclusão"]
        }
        
        query_lower = query.lower()
        for category, keywords in categories.items():
            if any(keyword in query_lower for keyword in keywords):
                return category
        
        return "geral"
    
    def create_system_prompt(self, user_context: Dict[str, Any], category: str) -> str:
        """Criar prompt do sistema baseado no contexto do usuário"""
        user = user_context.get("user", {})
        
        base_prompt = f"""Você é o Connectus AI, um assistente educacional avançado integrado à plataforma Connectus.

PERFIL DO USUÁRIO:
- Nome: {user.get('full_name', 'Usuário')}
- Nickname: {user.get('nickname', 'user')}
- Idade: {user.get('age', 'N/A')} anos
- Nível: {user.get('level', 1)}
- XP: {user.get('xp', 0)}
- Bio: {user.get('bio', 'N/A')}

CATEGORIA DA CONSULTA: {category.upper()}

INSTRUÇÕES ESPECÍFICAS:"""

        if category == "estudos":
            base_prompt += """
- Explique conceitos de forma didática e clara
- Use exemplos práticos e analogias
- Adapte a linguagem à idade do usuário
- Sugira métodos de estudo personalizados
- Crie conexões entre diferentes tópicos"""
        
        elif category == "dúvidas":
            base_prompt += """
- Seja paciente e encorajador
- Quebre conceitos complexos em partes menores
- Use perguntas socráticas para guiar o entendimento
- Ofereça múltiplas perspectivas
- Sugira recursos adicionais"""
        
        elif category == "curiosidades":
            base_prompt += """
- Apresente fatos interessantes e surpreendentes
- Conecte curiosidades ao perfil do usuário
- Use linguagem envolvente e cativante
- Sugira experimentos ou atividades práticas
- Relacione com o mundo real"""
        
        elif category == "exercicios":
            base_prompt += """
- Resolva exercícios passo a passo
- Explique cada etapa do processo
- Mostre diferentes métodos de resolução
- Identifique possíveis erros comuns
- Sugira exercícios similares para prática"""
        
        elif category == "resumos":
            base_prompt += """
- Crie resumos estruturados e organizados
- Use tópicos e subtópicos
- Destaque pontos principais
- Mantenha linguagem clara e concisa
- Sugira formas de memorização"""

        base_prompt += f"""

CONTEXTO RECENTE:
{self._format_recent_context(user_context)}

ESTILO DE RESPOSTA:
- Seja amigável e acessível
- Use emojis ocasionalmente para tornar mais envolvente
- Forneça exemplos práticos
- Sugira próximos passos ou ações
- Mantenha o foco educacional

IMPORTANTE: Sempre termine com sugestões de próximos passos ou perguntas relacionadas."""
        
        return base_prompt
    
    def _format_recent_context(self, user_context: Dict[str, Any]) -> str:
        """Formatar contexto recente"""
        context = []
        
        # Conversas recentes
        conversations = user_context.get("recent_conversations", [])
        if conversations:
            context.append("CONVERSAS RECENTES:")
            for conv in conversations[:3]:  # Últimas 3 conversas
                context.append(f"- {conv[0]}: {conv[1][:100]}...")
        
        # Missões completadas
        missions = user_context.get("completed_missions", [])
        if missions:
            context.append("MISSÕES COMPLETADAS:")
            for mission in missions[:3]:  # Últimas 3 missões
                context.append(f"- {mission[0]}: +{mission[2]} XP")
        
        return "\n".join(context) if context else "Nenhum contexto recente disponível."
    
    async def chat(self, user_id: int, query: str) -> AIResponse:
        """Chat principal com IA"""
        try:
            # Obter contexto do usuário
            user_context = self.get_user_context(user_id)
            
            # Categorizar pergunta
            category = self.categorize_query(query)
            
            # Criar prompt do sistema
            system_prompt = self.create_system_prompt(user_context, category)
            
            # Preparar mensagens
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ]
            
            # Adicionar histórico de conversa se existir
            if user_id in self.conversation_history:
                recent_history = self.conversation_history[user_id][-5:]  # Últimas 5 mensagens
                messages = [{"role": "system", "content": system_prompt}] + recent_history + [{"role": "user", "content": query}]
            
            # Chamar OpenAI
            response = self.client.chat.completions.create(
                model=AI_MODEL,
                messages=messages,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE
            )
            
            content = response.choices[0].message.content
            
            # Gerar sugestões
            suggestions = self._generate_suggestions(category, query)
            
            # Criar resposta
            ai_response = AIResponse(
                content=content,
                category=category,
                confidence=0.9,  # Simulado
                suggestions=suggestions,
                metadata={
                    "tokens_used": response.usage.total_tokens,
                    "model": AI_MODEL,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            )
            
            # Salvar conversa
            self._save_conversation(user_id, query, content, category)
            
            # Atualizar histórico em memória
            if user_id not in self.conversation_history:
                self.conversation_history[user_id] = []
            
            self.conversation_history[user_id].extend([
                {"role": "user", "content": query},
                {"role": "assistant", "content": content}
            ])
            
            # Manter apenas últimas 10 mensagens
            if len(self.conversation_history[user_id]) > 10:
                self.conversation_history[user_id] = self.conversation_history[user_id][-10:]
            
            return ai_response
            
        except Exception as e:
            print(f"❌ Erro na IA: {e}")
            return AIResponse(
                content="Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente em alguns instantes.",
                category="erro",
                confidence=0.0,
                suggestions=["Tentar novamente", "Verificar conexão", "Contatar suporte"],
                metadata={"error": str(e)}
            )
    
    def _generate_suggestions(self, category: str, query: str) -> List[str]:
        """Gerar sugestões baseadas na categoria e pergunta"""
        suggestions_map = {
            "estudos": [
                "Explicar mais detalhadamente",
                "Dar exemplos práticos",
                "Criar um resumo",
                "Sugerir exercícios"
            ],
            "dúvidas": [
                "Explicar de outra forma",
                "Mostrar passo a passo",
                "Dar mais exemplos",
                "Sugerir recursos"
            ],
            "curiosidades": [
                "Mais curiosidades sobre o tema",
                "Fatos relacionados",
                "Experimentos práticos",
                "História do assunto"
            ],
            "exercicios": [
                "Resolver outro exercício",
                "Explicar método alternativo",
                "Mostrar erros comuns",
                "Sugerir prática"
            ],
            "resumos": [
                "Criar mapa mental",
                "Fazer flashcards",
                "Explicar pontos principais",
                "Sugerir memorização"
            ]
        }
        
        return suggestions_map.get(category, [
            "Fazer pergunta relacionada",
            "Pedir explicação mais detalhada",
            "Sugerir tópico relacionado",
            "Criar exercício prático"
        ])
    
    def _save_conversation(self, user_id: int, query: str, response: str, category: str):
        """Salvar conversa no banco de dados"""
        try:
            conn = sqlite3.connect("database/connectus.db")
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO ai_conversations (user_id, query, response, category, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                user_id,
                query,
                response,
                category,
                datetime.now(timezone.utc).isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"❌ Erro ao salvar conversa: {e}")
    
    async def explain_concept(self, user_id: int, concept: str, level: str = "intermediário") -> AIResponse:
        """Explicar conceito específico"""
        query = f"Explique o conceito '{concept}' de forma {level} com exemplos práticos"
        return await self.chat(user_id, query)
    
    async def solve_exercise(self, user_id: int, exercise: str) -> AIResponse:
        """Resolver exercício específico"""
        query = f"Resolva este exercício passo a passo: {exercise}"
        return await self.chat(user_id, query)
    
    async def create_summary(self, user_id: int, text: str) -> AIResponse:
        """Criar resumo de texto"""
        query = f"Crie um resumo estruturado deste texto: {text}"
        return await self.chat(user_id, query)
    
    async def generate_quiz(self, user_id: int, topic: str, difficulty: str = "médio") -> AIResponse:
        """Gerar quiz sobre tópico"""
        query = f"Crie um quiz de {difficulty} sobre {topic} com 5 perguntas e respostas"
        return await self.chat(user_id, query)
    
    async def get_curiosities(self, user_id: int, topic: str = None) -> AIResponse:
        """Obter curiosidades sobre tópico"""
        if topic:
            query = f"Me conte curiosidades interessantes sobre {topic}"
        else:
            query = "Me conte uma curiosidade científica interessante e surpreendente"
        return await self.chat(user_id, query)

# Instância global da IA
connectus_ai = ConnectusAI()


