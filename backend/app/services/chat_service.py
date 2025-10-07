from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime
from ..models.chat import ChatRoom, ChatMessage
from ..models.user import User
from ..schemas.chat import ChatRoomCreate, ChatMessageCreate
import re
import logging

logger = logging.getLogger(__name__)


class ChatService:
    """Serviço para gerenciamento de chat"""
    
    def __init__(self, db: Session):
        self.db = db
        # Lista de palavras ofensivas (simplificada)
        self.offensive_words = [
            "idiota", "burro", "estúpido", "imbecil", "retardado",
            "merda", "porra", "caralho", "foda", "fdp", "otário"
        ]
    
    def create_room(self, room_data: ChatRoomCreate) -> Optional[ChatRoom]:
        """Cria uma nova sala de chat"""
        try:
            db_room = ChatRoom(**room_data.dict())
            self.db.add(db_room)
            self.db.commit()
            self.db.refresh(db_room)
            
            logger.info(f"Sala de chat criada: {db_room.name} (ID: {db_room.id})")
            return db_room
            
        except Exception as e:
            logger.error(f"Erro ao criar sala de chat: {e}")
            self.db.rollback()
            return None
    
    def get_room_by_id(self, room_id: int) -> Optional[ChatRoom]:
        """Obtém sala por ID"""
        return self.db.query(ChatRoom).filter(
            and_(ChatRoom.id == room_id, ChatRoom.is_active == True)
        ).first()
    
    def get_all_rooms(self) -> List[ChatRoom]:
        """Obtém todas as salas ativas"""
        return self.db.query(ChatRoom).filter(
            ChatRoom.is_active == True
        ).order_by(desc(ChatRoom.created_at)).all()
    
    def get_public_rooms(self) -> List[ChatRoom]:
        """Obtém salas públicas"""
        return self.db.query(ChatRoom).filter(
            and_(ChatRoom.is_active == True, ChatRoom.is_private == False)
        ).order_by(desc(ChatRoom.created_at)).all()
    
    def create_message(self, user_id: int, message_data: ChatMessageCreate) -> Optional[ChatMessage]:
        """Cria uma nova mensagem"""
        try:
            # Verificar se a sala existe
            room = self.get_room_by_id(message_data.room_id)
            if not room:
                return None
            
            # Filtrar conteúdo ofensivo
            filtered_content, is_filtered, filter_reason = self._filter_message(message_data.content)
            
            db_message = ChatMessage(
                user_id=user_id,
                room_id=message_data.room_id,
                content=filtered_content,
                is_filtered=is_filtered,
                filter_reason=filter_reason
            )
            
            self.db.add(db_message)
            self.db.commit()
            self.db.refresh(db_message)
            
            logger.info(f"Mensagem criada na sala {message_data.room_id} por usuário {user_id}")
            return db_message
            
        except Exception as e:
            logger.error(f"Erro ao criar mensagem: {e}")
            self.db.rollback()
            return None
    
    def get_room_messages(self, room_id: int, limit: int = 50, offset: int = 0) -> List[ChatMessage]:
        """Obtém mensagens de uma sala"""
        return self.db.query(ChatMessage).filter(
            and_(ChatMessage.room_id == room_id, ChatMessage.is_active == True)
        ).order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit).all()
    
    def get_recent_messages(self, room_id: int, limit: int = 20) -> List[ChatMessage]:
        """Obtém mensagens recentes de uma sala"""
        return self.db.query(ChatMessage).filter(
            and_(ChatMessage.room_id == room_id, ChatMessage.is_active == True)
        ).order_by(desc(ChatMessage.created_at)).limit(limit).all()
    
    def delete_message(self, message_id: int, user_id: int) -> bool:
        """Deleta uma mensagem (soft delete)"""
        try:
            message = self.db.query(ChatMessage).filter(
                and_(ChatMessage.id == message_id, ChatMessage.user_id == user_id)
            ).first()
            
            if not message:
                return False
            
            message.is_active = False
            self.db.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao deletar mensagem: {e}")
            self.db.rollback()
            return False
    
    def get_user_messages(self, user_id: int, limit: int = 50, offset: int = 0) -> List[dict]:
        """Obtém mensagens do usuário"""
        messages = self.db.query(ChatMessage).filter(
            and_(ChatMessage.user_id == user_id, ChatMessage.is_active == True)
        ).order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit).all()
        
        # Converter para formato esperado pelo schema
        return [self._message_to_dict(message) for message in messages]
    
    def search_messages(self, room_id: int, query: str, limit: int = 20) -> List[ChatMessage]:
        """Busca mensagens em uma sala"""
        return self.db.query(ChatMessage).filter(
            and_(
                ChatMessage.room_id == room_id,
                ChatMessage.content.ilike(f"%{query}%"),
                ChatMessage.is_active == True
            )
        ).order_by(desc(ChatMessage.created_at)).limit(limit).all()
    
    def get_room_stats(self, room_id: int) -> dict:
        """Obtém estatísticas de uma sala"""
        room = self.get_room_by_id(room_id)
        if not room:
            return {}
        
        message_count = self.db.query(ChatMessage).filter(
            and_(ChatMessage.room_id == room_id, ChatMessage.is_active == True)
        ).count()
        
        # Usuários únicos que enviaram mensagens
        unique_users = self.db.query(ChatMessage.user_id).filter(
            and_(ChatMessage.room_id == room_id, ChatMessage.is_active == True)
        ).distinct().count()
        
        return {
            "room_id": room_id,
            "room_name": room.name,
            "message_count": message_count,
            "unique_users": unique_users,
            "is_private": room.is_private,
            "created_at": room.created_at
        }
    
    def _filter_message(self, content: str) -> tuple[str, bool, Optional[str]]:
        """Filtra mensagem por conteúdo ofensivo"""
        content_lower = content.lower()
        
        # Verificar palavras ofensivas
        for word in self.offensive_words:
            if word in content_lower:
                # Substituir por asteriscos
                filtered_content = re.sub(
                    re.escape(word), 
                    "*" * len(word), 
                    content, 
                    flags=re.IGNORECASE
                )
                return filtered_content, True, f"Palavra ofensiva detectada: {word}"
        
        # Verificar padrões de spam (muitas repetições)
        if self._is_spam(content):
            return content, True, "Possível spam detectado"
        
        return content, False, None
    
    def _is_spam(self, content: str) -> bool:
        """Verifica se a mensagem é spam"""
        # Verificar repetições excessivas de caracteres
        if len(set(content)) < len(content) * 0.3 and len(content) > 10:
            return True
        
        # Verificar repetições de palavras
        words = content.split()
        if len(words) > 5:
            word_count = {}
            for word in words:
                word_count[word] = word_count.get(word, 0) + 1
                if word_count[word] > len(words) * 0.4:
                    return True
        
        return False
    
    def get_room_members(self, room_id: int) -> List[dict]:
        """Obtém membros de uma sala (usuários que enviaram mensagens)"""
        members = self.db.query(User).join(ChatMessage).filter(
            and_(ChatMessage.room_id == room_id, ChatMessage.is_active == True)
        ).distinct().all()
        
        return [
            {
                "id": member.id,
                "nickname": member.nickname,
                "level": member.level,
                "last_message": self.db.query(ChatMessage).filter(
                    and_(ChatMessage.room_id == room_id, ChatMessage.user_id == member.id)
                ).order_by(desc(ChatMessage.created_at)).first().created_at
            }
            for member in members
        ]
    
    def create_default_rooms(self):
        """Cria salas padrão do sistema"""
        default_rooms = [
            {"name": "Geral", "description": "Chat geral da comunidade", "is_private": False, "is_public": True},
            {"name": "Missões", "description": "Discussões sobre missões e conquistas", "is_private": False, "is_public": True},
            {"name": "Dúvidas", "description": "Tire suas dúvidas aqui", "is_private": False, "is_public": True},
            {"name": "Suporte", "description": "Suporte técnico", "is_private": False, "is_public": True}
        ]
        
        for room_data in default_rooms:
            existing = self.db.query(ChatRoom).filter(ChatRoom.name == room_data["name"]).first()
            if not existing:
                self.create_room(ChatRoomCreate(**room_data))
    
    def _message_to_dict(self, message: ChatMessage) -> dict:
        """Converte objeto ChatMessage para dict compatível com ChatMessageResponse"""
        # Buscar usuário
        user = self.db.query(User).filter(User.id == message.user_id).first()
        user_dict = {
            "id": user.id,
            "nickname": user.nickname,
            "level": user.level
        } if user else {"id": message.user_id, "nickname": "Usuário", "level": 1}
        
        return {
            "id": message.id,
            "user_id": message.user_id,
            "room_id": message.room_id,
            "content": message.content,
            "is_filtered": message.is_filtered,
            "filter_reason": message.filter_reason,
            "is_active": message.is_active,
            "created_at": message.created_at.isoformat() if message.created_at else None,
            "user": user_dict
        }


