import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.core.database import Base, get_db

# Isolated test database URL
TEST_SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://meitheal_user:meitheal_password@localhost:5432/meitheal_test_db"

engine = create_async_engine(TEST_SQLALCHEMY_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """Create test database tables before all tests and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture()
async def db_session() -> AsyncSession:
    """Provides an isolated database session for a single test."""
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture()
async def client() -> AsyncClient:
    """Provides an async test client connected to the FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
