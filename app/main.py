import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.bot.setup import bot
from app.api.endpoints import telegram

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

import asyncio

# Determine mode: use long polling if no WEBHOOK_URL is set (local dev)
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

# Long polling background task reference
_polling_task: asyncio.Task | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _polling_task

    # ── Register handlers (must happen before polling starts) ─────────────────
    from app.api.endpoints import telegram as tg_module  # noqa – triggers dp.include_router
    _ = tg_module  # keep import alive

    if WEBHOOK_URL:
        # ── Webhook mode (production) ─────────────────────────────────────────
        webhook_path = f"{WEBHOOK_URL}/api/webhook/telegram"
        try:
            await bot.set_webhook(url=webhook_path)
            logger.info(f"Webhook set to {webhook_path}")
        except Exception as e:
            logger.error(f"Failed to set webhook: {e}")
    elif BOT_TOKEN and BOT_TOKEN != "dummy_token_for_dev":
        # ── Long polling mode (local development) ─────────────────────────────
        # Delete any stale webhook so polling won't be blocked
        try:
            await bot.delete_webhook(drop_pending_updates=True)
        except Exception:
            pass

        from app.bot.setup import dp

        async def _poll_forever():
            logger.info("🤖 Telegram Bot is running... (Long Polling mode)")
            try:
                await dp.start_polling(bot, allowed_updates=["message", "callback_query"])
            except asyncio.CancelledError:
                logger.info("Telegram polling stopped.")
            except Exception as e:
                logger.error(f"Polling error: {e}")

        _polling_task = asyncio.create_task(_poll_forever())
        logger.info("Telegram long polling task created.")
    else:
        logger.warning("TELEGRAM_BOT_TOKEN not set or is a dummy. Bot will not start.")

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    if _polling_task and not _polling_task.done():
        _polling_task.cancel()
        try:
            await _polling_task
        except asyncio.CancelledError:
            pass
        logger.info("Polling task cancelled.")

    try:
        await bot.session.close()
        logger.info("Bot session closed.")
    except Exception as e:
        logger.error(f"Failed to cleanly close bot session: {e}")

app = FastAPI(
    title="Meitheal API",
    description="An autonomous, async Agentic AI system for food waste logistics.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(telegram.router, prefix="/api/webhook", tags=["Telegram Webhooks"])

# WebSocket Endpoint
from fastapi import WebSocket, WebSocketDisconnect
from app.api.websockets import manager
from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.food_rescue import FoodRescue, RescueStatus

@app.websocket("/api/ws/rescues")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # On connect: push existing PENDING rescues to this client
        try:
            async with AsyncSessionLocal() as session:
                from sqlalchemy import text
                # Use a plain SQL join to avoid ORM lazy-loading issues across async session
                q = text("""
                    SELECT fr.id, fr.extracted_food, fr.allergens, fr.diet_type,
                           fr.status, fr.urgency_level, fr.pin_color, fr.created_at,
                           b.name as business_name, b.lat, b.lng
                    FROM food_rescues fr
                    JOIN businesses b ON b.id = fr.business_id
                    WHERE fr.status = 'PENDING'
                    LIMIT 50
                """)
                rows = await session.execute(q)
                for row in rows.mappings():
                    payload = {
                        "id": str(row["id"]),
                        "business_name": row["business_name"] or "Unknown",
                        "business_location": {"lat": float(row["lat"]), "lng": float(row["lng"])},
                        "extracted_food": row["extracted_food"] or "Surplus Food",
                        "allergens": row["allergens"] or [],
                        "diet_type": row["diet_type"] or [],
                        "urgency_level": row["urgency_level"] or "MEDIUM",
                        "pin_color": row["pin_color"] or "yellow",
                        "status": row["status"] or "PENDING",
                        "created_at": row["created_at"].isoformat() if row["created_at"] else ""
                    }
                    await websocket.send_json(payload)
        except Exception as db_err:
            logger.warning(f"Failed to push initial rescues to new WebSocket client: {db_err}")

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Simple health-check endpoint."""
    return {"status": "ok", "service": "Meitheal API"}
