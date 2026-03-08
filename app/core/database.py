import os
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Default to local dev database if environment variable is not set
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://meitheal_user:meitheal_password@localhost:5432/meitheal_db"
)

# Async SQLAlchemy Engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True, # Set to False in production
    future=True # Enforce SQLAlchemy 2.0 style usage
)

# Async Session Maker
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database session."""
    async with AsyncSessionLocal() as session:
        yield session
