import pytest
from unittest.mock import patch, AsyncMock
from app.agents.extraction_agent import extract_food_data

@pytest.mark.asyncio
async def test_extraction_agent_urgency_scoring():
    """
    Test the NLP Extraction Agent's capability to determine urgency and pins.
    We MOCK the Ollama AsyncClient explicitly so it doesn't hit the real instance,
    testing our logic runs in milliseconds while isolating the agent wrapper.
    """
    mock_llm_json_response = '''
    {
        "extracted_food": "15 hot dinners, roast chicken",
        "allergens": ["gluten", "dairy"],
        "diet_type": ["halal"],
        "urgency_level": "HIGH",
        "pin_color": "red"
    }'''

    # We mock the underlying ollama AsyncClient chat method entirely
    with patch("ollama.AsyncClient.chat", new_callable=AsyncMock) as mock_chat:
        # Mock what the local LLM would respond with
        mock_chat.return_value = {
            "message": {
                "content": mock_llm_json_response
            }
        }
        
        # Call our agent function
        input_text = "We have 15 hot roast chicken dinners left over from an event. Need them gone ASAP."
        result = await extract_food_data(input_text)
        
        # Verify the agent processed the LLM response correctly
        assert result["extracted_food"] == "15 hot dinners, roast chicken"
        assert result["urgency_level"] == "HIGH"
        assert result["pin_color"] == "red"
        assert "gluten" in result["allergens"]
        assert "halal" in result["diet_type"]
        
        # Ensure our mock was actually used
        mock_chat.assert_called_once()
