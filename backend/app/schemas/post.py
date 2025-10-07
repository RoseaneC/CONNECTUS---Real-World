from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PostBase(BaseModel):
    content: str
    image_url: Optional[str] = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None


class PostLikeResponse(BaseModel):
    id: int
    user_id: int
    created_at: str
    
    class Config:
        from_attributes = True


class PostCommentCreate(BaseModel):
    content: str


class PostCommentResponse(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: str
    user: dict  # Informações básicas do usuário
    
    class Config:
        from_attributes = True


class PostResponse(PostBase):
    id: int
    author_id: int
    likes_count: int
    comments_count: int
    shares_count: int
    is_active: bool
    created_at: str
    updated_at: Optional[str] = None
    author: dict  # Informações básicas do autor
    likes: List[PostLikeResponse] = []
    comments: List[PostCommentResponse] = []
    
    class Config:
        from_attributes = True


