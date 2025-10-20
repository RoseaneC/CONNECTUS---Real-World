from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from app.core.auth import get_current_user
from app.models.user import User
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter(tags=["profile"])

class AvatarOut(BaseModel):
    glb_url: Optional[str] = None
    png_url: Optional[str] = None

class ProfileIn(BaseModel):
    display_name: Optional[str] = Field(None, max_length=60)
    bio: Optional[str] = Field(None, max_length=280)
    avatar_glb_url: Optional[str] = None
    avatar_png_url: Optional[str] = None

@router.get("/avatars", response_model=AvatarOut)
def get_avatar(user: User = Depends(get_current_user)):
    # ler campos do user; ajuste nomes conforme seu modelo
    return AvatarOut(glb_url=getattr(user, "avatar_glb_url", None),
                     png_url=getattr(user, "avatar_png_url", None))

@router.put("/profile", response_model=AvatarOut)
def update_profile(payload: ProfileIn,
                   db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.bio is not None:
        user.bio = payload.bio
    if payload.avatar_glb_url is not None:
        user.avatar_glb_url = payload.avatar_glb_url
    if payload.avatar_png_url is not None:
        user.avatar_png_url = payload.avatar_png_url
    db.add(user)
    db.commit()
    db.refresh(user)
    return AvatarOut(glb_url=getattr(user, "avatar_glb_url", None),
                     png_url=getattr(user, "avatar_png_url", None))
