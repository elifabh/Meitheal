import asyncio
import logging
from aiogram import Router, types
from aiogram.filters import CommandStart

from app.services.orchestrator import process_food_rescue_task

logger = logging.getLogger(__name__)

# Main Bot Router
router = Router()

@router.message(CommandStart())
async def cmd_start(message: types.Message):
    """Handles /start command."""
    await message.answer(
        "Welcome to the Meitheal Network! 🍲\n\n"
        "If you have surplus food, just type what you have left "
        "and our Agentic AI will handle the rest.\n\n"
        "<b>Example:</b> <i>We have 10 lattes and 8 pastries expiring in 1 hour.</i>",
    )

@router.message()
async def handle_food_report(message: types.Message):
    """
    Generic message handler.
    Pipeline: Telegram Message → extraction_agent.py (via orchestrator) → DB → WebSocket broadcast
    """
    if not message.text:
        await message.answer("Please send a text message describing the surplus food.")
        return

    user_telegram_id = str(message.from_user.id)
    raw_text = message.text

    logger.info(f"📩 Received message from {user_telegram_id}: '{raw_text[:60]}...' → dispatching to extraction_agent")

    # Acknowledge instantly so the user doesn't wait
    await message.answer("Got it! 🧠 Our AI is analyzing the food and alerting volunteers... 🚴")

    # Dispatch to orchestrator which calls extraction_agent.py → DB → WebSocket
    asyncio.create_task(process_food_rescue_task(raw_text, user_telegram_id))

