import uuid
from typing import Optional, List

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class Volunteer(Base):
    __tablename__ = "volunteers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    telegram_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    is_on_duty: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active_session_token: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships
    food_rescues: Mapped[List["FoodRescue"]] = relationship("FoodRescue", back_populates="volunteer")
