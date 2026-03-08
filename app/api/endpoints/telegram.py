import logging
from fastapi import APIRouter, Request, BackgroundTasks
from aiogram import types

from app.bot.setup import bot, dp
from app.bot import handlers  # Import to register handlers

logger = logging.getLogger(__name__)

router = APIRouter()

# Register the handlers router into the main dispatcher
dp.include_router(handlers.router)

@router.post("/telegram")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint for Telegram bot webhooks.
    Must return HTTP 200 immediately to prevent Telegram retries.
    Uses FastAPI BackgroundTasks to process the update asynchronously.
    """
    try:
        update_data = await request.json()
        update = types.Update(**update_data)
        
        # Process the update in the background so we can yield 200 OK instantly
        background_tasks.add_task(dp.feed_update, bot, update)
        
    except Exception as e:
        logger.error(f"Failed to process webhook update: {e}")
        
    return {"status": "ok"}
