# backend/app/routers/system_flags.py
from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.core.database import get_db
from app.core.auth import get_current_user

router = APIRouter(prefix="/system", tags=["system"])

@router.get("/feature-flags")
def feature_flags(db=Depends(get_db), user=Depends(get_current_user)):
    rows = db.execute(text("SELECT key, enabled FROM feature_flags")).fetchall()
    return { r[0]: bool(r[1]) for r in rows }

