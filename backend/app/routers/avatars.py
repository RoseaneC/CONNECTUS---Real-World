# >>> NEW FILE: app/routers/avatars.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.auth import get_current_user  # já existe
from pydantic import BaseModel

router = APIRouter(prefix="/avatars", tags=["avatars"])

class AvatarPatch(BaseModel):
    glb_url: str | None = None     # GLB do RPM
    png_url: str | None = None     # PNG render do RPM
    thumbnail_url: str | None = None  # Alias para png_url

@router.get("")
def get_my_avatar(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return {
        "current": {
            "glb_url": user.avatar_glb_url,
            "png_url": user.avatar_png_url,
        }
    }

@router.post("")
def update_avatar(patch: AvatarPatch, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    fields = []
    params = {"uid": current_user.id}
    
    # Use thumbnail_url if provided, otherwise png_url
    png_url_to_use = patch.thumbnail_url or patch.png_url
    
    if png_url_to_use is not None:
        fields.append("avatar_png_url=:png_url")
        params["png_url"] = png_url_to_use
    if patch.glb_url is not None:
        fields.append("avatar_glb_url=:glb_url")
        params["glb_url"] = patch.glb_url
    if fields:
        db.execute(text(f"UPDATE users SET {', '.join(fields)}, updated_at=CURRENT_TIMESTAMP WHERE id=:uid"), params)
        db.commit()
    row = db.execute(text("SELECT avatar_png_url, avatar_glb_url FROM users WHERE id=:uid"), {"uid": current_user.id}).first()
    return {"glb_url": row[1] if row else None, "thumbnail_url": row[0] if row else None}
