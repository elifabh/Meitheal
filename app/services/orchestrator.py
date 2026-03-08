import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.business import Business
from app.models.food_rescue import FoodRescue
from app.schemas.food_rescue import RescueStatus
from app.agents.extraction_agent import extract_food_data
from app.bot.setup import bot

logger = logging.getLogger(__name__)

async def process_food_rescue_task(text: str, telegram_id: str) -> None:
    """
    Background orchestrator task that processes a food report from Telegram.
    """
    try:
        async with AsyncSessionLocal() as session:
            # 1. Query DB for business by telegram_id
            stmt = select(Business).where(Business.telegram_id == telegram_id)
            result = await session.execute(stmt)
            business = result.scalars().first()
            
            if not business:
                logger.warning(f"Unregistered user {telegram_id} attempted to report food.")
                await bot.send_message(
                    chat_id=telegram_id,
                    text="You are not registered in the Meitheal system. Please contact an administrator."
                )
                return
                
            # 2. Extract food data using Ollama
            logger.info(f"Extracting food data from text: {text}")
            extracted_json = await extract_food_data(text)
            
            # Simple fallback if empty response returned due to error
            if not extracted_json:
                extracted_json = {
                    "extracted_food": "Unknown items", 
                    "allergens": [], 
                    "diet_type": [],
                    "urgency_level": "MEDIUM",
                    "pin_color": "yellow"
                }
                
            extracted_food = extracted_json.get("extracted_food", text)
            allergens = extracted_json.get("allergens", [])
            diet_type = extracted_json.get("diet_type", [])
            # Map LLM string output to Enum using value, wrapper with fallback
            try:
                from app.schemas.food_rescue import UrgencyLevel
                urgency_level = UrgencyLevel(extracted_json.get("urgency_level", "MEDIUM"))
            except ValueError:
                urgency_level = UrgencyLevel.MEDIUM
                
            pin_color = extracted_json.get("pin_color", "yellow")
            
            # 3. Create FoodRescue record in DB
            # Use naive UTC time for simplicity, or timezone-aware if DB configured
            expiry_time = datetime.now(timezone.utc) + timedelta(hours=2) # Default 2 hours expiry
            
            new_rescue = FoodRescue(
                business_id=business.id,
                raw_text_input=text,
                extracted_food=extracted_food,
                allergens=allergens,
                diet_type=diet_type,
                status=RescueStatus.PENDING,
                urgency_level=urgency_level,
                pin_color=pin_color,
                expiry_time=expiry_time
            )
            session.add(new_rescue)
            await session.commit()
            
            logger.info(f"FoodRescue {new_rescue.id} created for Business {business.id}.")
            
            # --- NEXT.JS WEBSOCKET INTEGRATION ---
            # Broadcast the new rescue to all connected WebSocket clients (Admin/Volunteer dashboards)
            from app.api.websockets import manager
            
            rescue_payload = {
                "id": str(new_rescue.id),
                "business_name": business.name,
                "business_location": {"lat": business.lat, "lng": business.lng},
                "extracted_food": extracted_food,
                "allergens": allergens,
                "diet_type": diet_type,
                "urgency_level": urgency_level.value if urgency_level else "MEDIUM",
                "pin_color": pin_color,
                "status": new_rescue.status.value,
                "created_at": new_rescue.created_at.isoformat() if new_rescue.created_at else datetime.utcnow().isoformat()
            }
            
            await manager.broadcast(rescue_payload)
            logger.info(f"Broadcasted new rescue {new_rescue.id} to connected WebSockets.")
            # ------------------------------------

            # 4. Send follow-up message back to Business via Bot
            await bot.send_message(
                chat_id=telegram_id,
                text=f"Analysis complete! Found: {extracted_food}. Looking for volunteers..."
            )

            
            # Future Phase: trigger Logistics Routing Agent logic right here
            
    except Exception as e:
        logger.error(f"Error in orchestrator processing task: {e}")
        try:
            await bot.send_message(
                chat_id=telegram_id,
                text="We encountered an issue processing your request. Please try again later."
            )
        except Exception as e2:
            logger.error(f"Failed to send failure message: {e2}")
