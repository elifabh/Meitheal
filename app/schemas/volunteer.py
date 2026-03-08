import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class VolunteerBase(BaseModel):
    name: str = Field(..., description="Name of the volunteer")
    telegram_id: str = Field(..., description="Telegram ID of the volunteer")
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    is_on_duty: bool = Field(False, description="Whether the volunteer is currently on duty")
    active_session_token: Optional[str] = Field(None, description="Active session token for web auth")

class VolunteerCreate(VolunteerBase):
    pass

class VolunteerUpdate(BaseModel):
    name: Optional[str] = None
    telegram_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_on_duty: Optional[bool] = None
    active_session_token: Optional[str] = None

class VolunteerResponse(VolunteerBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
