#!/usr/bin/env python3
"""
Rotas de IA para Connectus
Integração completa com o sistema existente
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import sqlite3

from ai_service import connectus_ai, AIResponse
# Função movida para evitar importação circular
def get_user_from_token(request):
    """Obter usuário a partir do token JWT"""
    import jwt
    from datetime import datetime, timezone
    
    SECRET_KEY = "connectus-secret-key-2024"
    ALGORITHM = "HS256"
    
    authorization = request.headers.get("Authorization")
    
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        
        import sqlite3
        conn = sqlite3.connect("database/connectus.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return dict(user)
        return None
        
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

# Router para IA
ai_router = APIRouter(prefix="/ai", tags=["IA"])

# Modelos Pydantic
class ChatRequest(BaseModel):
    message: str
    category: Optional[str] = None

class ChatResponse(BaseModel):
    content: str
    category: str
    confidence: float
    suggestions: List[str]
    metadata: Dict[str, Any]
    timestamp: str

class ExplainRequest(BaseModel):
    concept: str
    level: str = "intermediário"

class ExerciseRequest(BaseModel):
    exercise: str
    subject: Optional[str] = None

class SummaryRequest(BaseModel):
    text: str
    length: str = "médio"

class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "médio"
    questions: int = 5

class CuriosityRequest(BaseModel):
    topic: Optional[str] = None
    type: str = "geral"

# Função para obter usuário autenticado
async def get_current_user(request):
    """Obter usuário atual autenticado"""
    user = get_user_from_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação inválido"
        )
    return user

@ai_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Chat principal com IA"""
    try:
        user_id = current_user["id"]
        
        # Usar categoria fornecida ou detectar automaticamente
        category = request.category or "geral"
        
        # Chamar IA
        ai_response = await connectus_ai.chat(user_id, request.message)
        
        return ChatResponse(
            content=ai_response.content,
            category=ai_response.category,
            confidence=ai_response.confidence,
            suggestions=ai_response.suggestions,
            metadata=ai_response.metadata,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        print(f"❌ Erro no chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor de IA"
        )

@ai_router.post("/explain", response_model=ChatResponse)
async def explain_concept(
    request: ExplainRequest,
    current_user: dict = Depends(get_current_user)
):
    """Explicar conceito específico"""
    try:
        user_id = current_user["id"]
        ai_response = await connectus_ai.explain_concept(
            user_id, 
            request.concept, 
            request.level
        )
        
        return ChatResponse(
            content=ai_response.content,
            category=ai_response.category,
            confidence=ai_response.confidence,
            suggestions=ai_response.suggestions,
            metadata=ai_response.metadata,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        print(f"❌ Erro ao explicar conceito: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao explicar conceito"
        )

@ai_router.post("/solve", response_model=ChatResponse)
async def solve_exercise(
    request: ExerciseRequest,
    current_user: dict = Depends(get_current_user)
):
    """Resolver exercício"""
    try:
        user_id = current_user["id"]
        ai_response = await connectus_ai.solve_exercise(user_id, request.exercise)
        
        return ChatResponse(
            content=ai_response.content,
            category=ai_response.category,
            confidence=ai_response.confidence,
            suggestions=ai_response.suggestions,
            metadata=ai_response.metadata,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        print(f"❌ Erro ao resolver exercício: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao resolver exercício"
        )

@ai_router.post("/summarize", response_model=ChatResponse)
async def create_summary(
    request: SummaryRequest,
    current_user: dict = Depends(get_current_user)
):
    """Criar resumo de texto"""
    try:
        user_id = current_user["id"]
        ai_response = await connectus_ai.create_summary(user_id, request.text)
        
        return ChatResponse(
            content=ai_response.content,
            category=ai_response.category,
            confidence=ai_response.confidence,
            suggestions=ai_response.suggestions,
            metadata=ai_response.metadata,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        print(f"❌ Erro ao criar resumo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar resumo"
        )

@ai_router.post("/quiz", response_model=ChatResponse)
async def generate_quiz(
    request: QuizRequest,
    current_user: dict = Depends(get_current_user)
):
    """Gerar quiz sobre tópico"""
    try:
        user_id = current_user["id"]
        ai_response = await connectus_ai.generate_quiz(
            user_id, 
            request.topic, 
            request.difficulty
        )
        
        return ChatResponse(
            content=ai_response.content,
            category=ai_response.category,
            confidence=ai_response.confidence,
            suggestions=ai_response.suggestions,
            metadata=ai_response.metadata,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        print(f"❌ Erro ao gerar quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao gerar quiz"
        )

@ai_router.post("/curiosities", response_model=ChatResponse)
async def get_curiosities(
    request: CuriosityRequest,
    current_user: dict = Depends(get_current_user)
):
    """Obter curiosidades"""
    try:
        user_id = current_user["id"]
        ai_response = await connectus_ai.get_curiosities(user_id, request.topic)
        
        return ChatResponse(
            content=ai_response.content,
            category=ai_response.category,
            confidence=ai_response.confidence,
            suggestions=ai_response.suggestions,
            metadata=ai_response.metadata,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        print(f"❌ Erro ao obter curiosidades: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao obter curiosidades"
        )

@ai_router.get("/history")
async def get_chat_history(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Obter histórico de conversas com IA"""
    try:
        user_id = current_user["id"]
        
        conn = sqlite3.connect("database/connectus.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, query, response, category, created_at
            FROM ai_conversations 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        """, (user_id, limit, offset))
        
        conversations = cursor.fetchall()
        conn.close()
        
        return {
            "conversations": [
                {
                    "id": conv[0],
                    "query": conv[1],
                    "response": conv[2],
                    "category": conv[3],
                    "created_at": conv[4]
                }
                for conv in conversations
            ],
            "total": len(conversations)
        }
        
    except Exception as e:
        print(f"❌ Erro ao obter histórico: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao obter histórico"
        )

@ai_router.get("/favorites")
async def get_favorites(
    current_user: dict = Depends(get_current_user)
):
    """Obter conversas favoritas"""
    try:
        user_id = current_user["id"]
        
        conn = sqlite3.connect("database/connectus.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT af.id, af.conversation_id, ac.query, ac.response, af.created_at
            FROM ai_favorites af
            JOIN ai_conversations ac ON af.conversation_id = ac.id
            WHERE af.user_id = ?
            ORDER BY af.created_at DESC
        """, (user_id,))
        
        favorites = cursor.fetchall()
        conn.close()
        
        return {
            "favorites": [
                {
                    "id": fav[0],
                    "conversation_id": fav[1],
                    "query": fav[2],
                    "response": fav[3],
                    "created_at": fav[4]
                }
                for fav in favorites
            ]
        }
        
    except Exception as e:
        print(f"❌ Erro ao obter favoritos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao obter favoritos"
        )

@ai_router.post("/favorites/{conversation_id}")
async def add_to_favorites(
    conversation_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Adicionar conversa aos favoritos"""
    try:
        user_id = current_user["id"]
        
        conn = sqlite3.connect("database/connectus.db")
        cursor = conn.cursor()
        
        # Verificar se a conversa existe e pertence ao usuário
        cursor.execute("""
            SELECT id FROM ai_conversations 
            WHERE id = ? AND user_id = ?
        """, (conversation_id, user_id))
        
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversa não encontrada"
            )
        
        # Adicionar aos favoritos
        cursor.execute("""
            INSERT OR IGNORE INTO ai_favorites (user_id, conversation_id, created_at)
            VALUES (?, ?, ?)
        """, (user_id, conversation_id, datetime.now(timezone.utc).isoformat()))
        
        conn.commit()
        conn.close()
        
        return {"message": "Conversa adicionada aos favoritos"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao adicionar favorito: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao adicionar favorito"
        )

@ai_router.delete("/favorites/{favorite_id}")
async def remove_from_favorites(
    favorite_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Remover conversa dos favoritos"""
    try:
        user_id = current_user["id"]
        
        conn = sqlite3.connect("database/connectus.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM ai_favorites 
            WHERE id = ? AND user_id = ?
        """, (favorite_id, user_id))
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorito não encontrado"
            )
        
        conn.commit()
        conn.close()
        
        return {"message": "Favorito removido"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao remover favorito: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao remover favorito"
        )

@ai_router.get("/stats")
async def get_ai_stats(
    current_user: dict = Depends(get_current_user)
):
    """Obter estatísticas de uso da IA"""
    try:
        user_id = current_user["id"]
        
        conn = sqlite3.connect("database/connectus.db")
        cursor = conn.cursor()
        
        # Total de conversas
        cursor.execute("SELECT COUNT(*) FROM ai_conversations WHERE user_id = ?", (user_id,))
        total_conversations = cursor.fetchone()[0]
        
        # Conversas por categoria
        cursor.execute("""
            SELECT category, COUNT(*) 
            FROM ai_conversations 
            WHERE user_id = ? 
            GROUP BY category
        """, (user_id,))
        conversations_by_category = dict(cursor.fetchall())
        
        # Total de favoritos
        cursor.execute("SELECT COUNT(*) FROM ai_favorites WHERE user_id = ?", (user_id,))
        total_favorites = cursor.fetchone()[0]
        
        # Conversas recentes (últimos 7 dias)
        cursor.execute("""
            SELECT COUNT(*) FROM ai_conversations 
            WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
        """, (user_id,))
        recent_conversations = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_conversations": total_conversations,
            "conversations_by_category": conversations_by_category,
            "total_favorites": total_favorites,
            "recent_conversations": recent_conversations
        }
        
    except Exception as e:
        print(f"❌ Erro ao obter estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao obter estatísticas"
        )
