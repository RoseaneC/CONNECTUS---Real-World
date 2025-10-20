"""
Modelo de usuário para Connectus
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Campos de perfil
    full_name = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    
    # Campos de gamificação
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    tokens_earned = Column(Numeric(10, 2), default=0.00)
    tokens_available = Column(Numeric(10, 2), default=0.00)
    tokens_in_yield = Column(Numeric(10, 2), default=0.00)
    
    # Campos de status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Campos de data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Campos de estatísticas
    missions_completed = Column(Integer, default=0)
    posts_created = Column(Integer, default=0)
    likes_received = Column(Integer, default=0)
    comments_made = Column(Integer, default=0)
    
    # Relacionamentos
    missions = relationship("UserMission", back_populates="user")
    posts = relationship("Post", back_populates="author")
    post_likes = relationship("PostLike", back_populates="user")
    post_comments = relationship("PostComment", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")
    ranking = relationship("UserRanking", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, nickname='{self.nickname}')>"