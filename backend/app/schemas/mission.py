from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from decimal import Decimal


class MissionBase(BaseModel):
    title: str
    description: str
    category: str
    xp_reward: int
    token_reward: Union[int, float, str, Decimal]
    is_daily: bool
    difficulty: str


class MissionCreate(MissionBase):
    pass


class MissionResponse(MissionBase):
    id: int
    is_active: bool
    created_at: Union[str, datetime]
    
    class Config:
        from_attributes = True


class UserMissionBase(BaseModel):
    mission_id: int


class UserMissionCreate(UserMissionBase):
    pass


class UserMissionUpdate(BaseModel):
    is_completed: Optional[bool] = None
    progress: Optional[int] = None


class UserMissionResponse(UserMissionBase):
    id: int
    user_id: int
    is_completed: bool
    completed_at: Optional[str] = None
    progress: int
    created_at: str
    mission: MissionResponse
    
    class Config:
        from_attributes = True


