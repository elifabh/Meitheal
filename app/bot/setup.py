import os
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "dummy_token_for_dev")

# Initialize Bot and Dispatcher
bot = Bot(
    token=TELEGRAM_BOT_TOKEN, 
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()
