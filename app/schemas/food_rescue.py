import uuid
from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class RescueStatus(str, Enum):
    PENDING = "PENDING"
    AGENT_ANALYZING = "AGENT_ANALYZING"
    ROUTING = "ROUTING"
    ASSIGNED = "ASSIGNED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class UrgencyLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class FoodRescueBase(BaseModel):
    business_id: uuid.UUID
    volunteer_id: Optional[uuid.UUID] = None
    raw_text_input: str
    extracted_food: Optional[str] = None
    allergens: Optional[List[str]] = None
    diet_type: Optional[List[str]] = None
    status: RescueStatus = RescueStatus.PENDING
    urgency_level: Optional[UrgencyLevel] = None
    pin_color: Optional[str] = None
    expiry_time: datetime
    carbon_saved_kg: Optional[float] = None

class FoodRescueCreate(FoodRescueBase):
    pass

class FoodRescueUpdate(BaseModel):
    business_id: Optional[uuid.UUID] = None
    volunteer_id: Optional[uuid.UUID] = None
    raw_text_input: Optional[str] = None
    extracted_food: Optional[str] = None
    allergens: Optional[List[str]] = None
    diet_type: Optional[List[str]] = None
    status: Optional[RescueStatus] = None
    urgency_level: Optional[UrgencyLevel] = None
    pin_color: Optional[str] = None
    expiry_time: Optional[datetime] = None
    carbon_saved_kg: Optional[float] = None

class FoodRescueResponse(FoodRescueBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
