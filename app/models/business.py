import uuid
from datetime import time
from typing import Optional, List

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Float, Time
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    instagram_handle: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    telegram_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    closing_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    food_rescues: Mapped[List["FoodRescue"]] = relationship("FoodRescue", back_populates="business")
