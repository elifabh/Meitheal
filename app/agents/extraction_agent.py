import logging
from typing import Dict, Any, List

from app.core.llm import generate_json_response

logger = logging.getLogger(__name__)

async def extract_food_data(raw_text: str) -> Dict[str, Any]:
    """
    Extracts structured food data, allergens, diets, and infers urgency from raw text.
    """
    prompt = f"""
    You are a food logistics data extraction agent. 
    Analyze the following input text from a business describing surplus food.
    
    Extract the following information:
    1. A concise summary of the extracted food items.
    2. A list of potential allergens (e.g., 'gluten', 'dairy', 'nuts', 'soy'). Empty list if none obvious or unknown.
    3. The diet type suitability (e.g., 'vegan', 'vegetarian', 'halal'). Empty list if unknown.
    4. The urgency level (HIGH, MEDIUM, LOW) based on perishability. Hot meals or highly perishable items = HIGH. Baked goods or sealed items = LOW.
    5. A pin color based on urgency. HIGH = "red", MEDIUM = "yellow", LOW = "green".
    
    Return EXACTLY a JSON object with this structure and these exact keys:
    {{
        "extracted_food": "string describing the food",
        "allergens": ["list", "of", "strings"],
        "diet_type": ["list", "of", "strings"],
        "urgency_level": "string (HIGH, MEDIUM, or LOW)",
        "pin_color": "string (red, yellow, or green)"
    }}
    
    Do not add any additional text, markdown, or explanations. Only return the JSON object.
    
    Input Text: "{raw_text}"
    """
    
    # generate_json_response handles JSON format enforcement, retries, and parsing.
    result = await generate_json_response(prompt=prompt, model="llama3", max_retries=2)
    
    # Fallback default if extraction fails completely
    if not result:
        logger.error("Failed to extract food data. Returning safe defaults.")
        return {
            "extracted_food": raw_text, # Fallback to raw text
            "allergens": [],
            "diet_type": [],
            "urgency_level": "MEDIUM",
            "pin_color": "yellow"
        }
        
    # Basic validation of expected keys
    return {
        "extracted_food": result.get("extracted_food", raw_text),
        "allergens": result.get("allergens", []) if isinstance(result.get("allergens"), list) else [],
        "diet_type": result.get("diet_type", []) if isinstance(result.get("diet_type"), list) else [],
        "urgency_level": result.get("urgency_level", "MEDIUM"),
        "pin_color": result.get("pin_color", "yellow")
    }
