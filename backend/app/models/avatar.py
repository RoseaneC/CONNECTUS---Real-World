from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.sqlite import JSON
from app.core.database import Base

class UserAvatar(Base):
    __tablename__ = "user_avatar"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    skin = Column(String, default="default")
    skin_tone = Column(String, default="tone_1")
    face = Column(String, default="face_1")
    hair = Column(String, default="hair_1")
    hair_color = Column(String, default="#3a3a3a")
    outfit = Column(String, default="outfit_basic")
    accessories = Column(JSON, default=[])
    unlocked_skins = Column(JSON, default=[])
    
    def __repr__(self):
        return f"<UserAvatar(user_id={self.user_id}, skin={self.skin})>"
