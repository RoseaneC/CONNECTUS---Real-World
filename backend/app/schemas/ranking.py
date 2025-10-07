from pydantic import BaseModel
from typing import Optional
from datetime import datetime
# from decimal import Decimal


class UserRankingResponse(BaseModel):
    id: int
    user_id: int
    total_xp: int
    total_tokens: str
    missions_completed: int
    posts_created: int
    likes_received: int
    xp_rank: Optional[int] = None
    token_rank: Optional[int] = None
    mission_rank: Optional[int] = None
    overall_rank: Optional[int] = None
    last_updated: str
    user: dict  # Informações básicas do usuário
    
    class Config:
        from_attributes = True


class RankingResponse(BaseModel):
    rankings: list[UserRankingResponse]
    total_count: int
    page: int
    page_size: int
    has_next: bool


