from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..schemas.chat import ChatRoomCreate, ChatRoomResponse, ChatMessageCreate, ChatMessageResponse
from ..services.chat_service import ChatService
from ..core.auth import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/rooms", response_model=List[ChatRoomResponse])
async def get_chat_rooms(
    public_only: bool = True,
    db: Session = Depends(get_db)
):
    """Obtém salas de chat disponíveis"""
    try:
        chat_service = ChatService(db)
        
        if public_only:
            rooms = chat_service.get_public_rooms()
        else:
            rooms = chat_service.get_all_rooms()
        
        # Converter para formato correto
        result = []
        for room in rooms:
            result.append({
                "id": room.id,
                "name": room.name,
                "description": room.description,
                "is_private": room.is_private,
                "is_public": room.is_public,
                "is_active": room.is_active,
                "created_at": room.created_at.isoformat() if room.created_at else None,
                "message_count": 0  # Pode ser calculado se necessário
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Erro ao obter salas de chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/rooms", response_model=ChatRoomResponse)
async def create_chat_room(
    room_data: ChatRoomCreate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova sala de chat"""
    try:
        chat_service = ChatService(db)
        room = chat_service.create_room(room_data)
        
        if not room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao criar sala de chat"
            )
        
        logger.info(f"Sala de chat criada: {room.name} pelo usuário {current_user['id']}")
        return room
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar sala de chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/rooms/{room_id}", response_model=ChatRoomResponse)
async def get_chat_room(
    room_id: int,
    db: Session = Depends(get_db)
):
    """Obtém detalhes de uma sala de chat"""
    try:
        chat_service = ChatService(db)
        room = chat_service.get_room_by_id(room_id)
        
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sala de chat não encontrada"
            )
        
        return room
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter sala de chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/rooms/{room_id}/messages", response_model=List[ChatMessageResponse])
async def get_room_messages(
    room_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Obtém mensagens de uma sala de chat"""
    try:
        chat_service = ChatService(db)
        
        # Verificar se a sala existe
        room = chat_service.get_room_by_id(room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sala de chat não encontrada"
            )
        
        messages = chat_service.get_room_messages(room_id, limit, offset)
        return messages
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter mensagens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/rooms/{room_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    room_id: int,
    message_data: ChatMessageCreate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Envia uma mensagem para uma sala de chat"""
    try:
        chat_service = ChatService(db)
        
        # Verificar se a sala existe
        room = chat_service.get_room_by_id(room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sala de chat não encontrada"
            )
        
        # Criar mensagem
        message = chat_service.create_message(current_user["id"], message_data)
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao enviar mensagem"
            )
        
        logger.info(f"Mensagem enviada na sala {room_id} pelo usuário {current_user['id']}")
        return message
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta uma mensagem"""
    try:
        chat_service = ChatService(db)
        success = chat_service.delete_message(message_id, current_user["id"])
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mensagem não encontrada ou não pertence ao usuário"
            )
        
        logger.info(f"Mensagem {message_id} deletada pelo usuário {current_user['id']}")
        return {"message": "Mensagem deletada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar mensagem: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/my-messages", response_model=List[ChatMessageResponse])
async def get_my_messages(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém mensagens do usuário atual"""
    try:
        chat_service = ChatService(db)
        messages = chat_service.get_user_messages(current_user["id"], limit, offset)
        
        if not messages:
            return []
        
        return messages
        
    except Exception as e:
        logger.error(f"Erro ao obter mensagens do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/rooms/{room_id}/search")
async def search_messages(
    room_id: int,
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Busca mensagens em uma sala de chat"""
    try:
        chat_service = ChatService(db)
        
        # Verificar se a sala existe
        room = chat_service.get_room_by_id(room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sala de chat não encontrada"
            )
        
        messages = chat_service.search_messages(room_id, q, limit)
        return messages
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar mensagens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/rooms/{room_id}/stats")
async def get_room_stats(
    room_id: int,
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de uma sala de chat"""
    try:
        chat_service = ChatService(db)
        stats = chat_service.get_room_stats(room_id)
        
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sala de chat não encontrada"
            )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas da sala: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/rooms/{room_id}/members")
async def get_room_members(
    room_id: int,
    db: Session = Depends(get_db)
):
    """Obtém membros de uma sala de chat"""
    try:
        chat_service = ChatService(db)
        
        # Verificar se a sala existe
        room = chat_service.get_room_by_id(room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sala de chat não encontrada"
            )
        
        members = chat_service.get_room_members(room_id)
        return {"room_id": room_id, "members": members}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter membros da sala: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/init-default-rooms")
async def init_default_rooms(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Inicializa salas padrão do sistema (apenas para administradores)"""
    try:
        # TODO: Implementar verificação de admin
        chat_service = ChatService(db)
        chat_service.create_default_rooms()
        
        return {"message": "Salas padrão criadas com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao criar salas padrão: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


