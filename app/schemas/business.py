import uuid
from datetime import time
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class BusinessBase(BaseModel):
    name: str = Field(..., description="The name of the business")
    instagram_handle: Optional[str] = Field(None, description="The Instagram handle of the business")
    telegram_id: str = Field(..., description="The Telegram ID of the business")
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    closing_time: time = Field(..., description="Closing time of the business")
    is_active: bool = Field(True, description="Whether the business is currently active")

class BusinessCreate(BusinessBase):
    pass

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    instagram_handle: Optional[str] = None
    telegram_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    closing_time: Optional[time] = None
    is_active: Optional[bool] = None

class BusinessResponse(BusinessBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
