import json
import logging
from typing import Any, Dict
from ollama import AsyncClient

logger = logging.getLogger(__name__)

# Initialize Ollama AsyncClient
ollama_client = AsyncClient(host="http://localhost:11434")

async def generate_json_response(prompt: str, model: str = "phi3", max_retries: int = 2) -> Dict[str, Any]:
    """
    Generate a JSON response from Ollama, enforcing JSON formatting natively.
    Includes built-in retries for malformed JSON parsing.
    """
    for attempt in range(max_retries + 1):
        try:
            response = await ollama_client.generate(
                model=model,
                prompt=prompt,
                format="json", # Enforces JSON format at the API level
                options={"temperature": 0.1} # Lower temperature for more deterministic JSON
            )
            
            raw_text = response.get("response", "")
            
            # Clean possible markdown formatting just in case
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1).strip()
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3].strip()
                
            parsed_data = json.loads(raw_text)
            return parsed_data
            
        except json.JSONDecodeError as e:
            logger.warning(f"Attempt {attempt + 1}: Failed to parse JSON from LLM: {e}. Raw response: {raw_text}")
            if attempt == max_retries:
                logger.error("Max retries reached. Returning empty dict.")
                return {}
            # Self-correction: tell the model it failed to produce valid JSON
            prompt = f"Your previous response was NOT valid JSON. Error: {e}. Fix it. Original prompt: {prompt}"
        except Exception as e:
            logger.error(f"Unexpected error communicating with Ollama: {e}")
            return {}
            
    return {}
