from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False
    is_public: bool = True


class ChatRoomCreate(ChatRoomBase):
    pass


class ChatRoomResponse(ChatRoomBase):
    id: int
    is_active: bool
    created_at: str
    message_count: Optional[int] = 0
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ChatMessageCreate(BaseModel):
    content: str
    room_id: int


class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    content: str
    is_filtered: bool
    filter_reason: Optional[str] = None
    is_active: bool
    created_at: str
    user: dict  # Informações básicas do usuário
    
    class Config:
        from_attributes = True


