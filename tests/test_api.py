import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test the base API health endpoint."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Meitheal Server Running"}
