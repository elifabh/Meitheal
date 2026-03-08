import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from app.core.database import Base
from app.schemas.food_rescue import RescueStatus, UrgencyLevel

class FoodRescue(Base):
    __tablename__ = "food_rescues"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    volunteer_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("volunteers.id"), nullable=True)
    raw_text_input: Mapped[str] = mapped_column(String, nullable=False)
    extracted_food: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    allergens: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
    diet_type: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
    status: Mapped[RescueStatus] = mapped_column(SQLEnum(RescueStatus), nullable=False, default=RescueStatus.PENDING)
    urgency_level: Mapped[Optional[UrgencyLevel]] = mapped_column(SQLEnum(UrgencyLevel), nullable=True)
    pin_color: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    expiry_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    carbon_saved_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="food_rescues")
    volunteer: Mapped[Optional["Volunteer"]] = relationship("Volunteer", back_populates="food_rescues")
