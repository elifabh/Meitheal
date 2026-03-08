import logging
from typing import List, Dict, Optional, Any

from app.services.location_service import calculate_distance

logger = logging.getLogger(__name__)

# Maximum allowed distance for a volunteer to be considered (in kilometers)
MAX_ROUTING_DISTANCE_KM = 5.0

async def evaluate_best_volunteer(business_lat: float, business_lng: float, volunteers: List[Dict[str, Any]]) -> Optional[str]:
    """
    Native ReAct logic for Assigning the closest active volunteer.
    
    volunteers is expected to be a list of dictionaries with structure:
    {"id": str, "lat": float, "lng": float, "is_on_duty": bool}
    """
    logger.info(f"Evaluating best volunteer from {len(volunteers)} candidates.")
    
    best_match_id = None
    min_distance = float('inf')
    
    for volunteer in volunteers:
        # Only consider volunteers on duty
        if not volunteer.get("is_on_duty", False):
            continue
            
        v_lat = volunteer.get("lat")
        v_lng = volunteer.get("lng")
        v_id = volunteer.get("id")
        
        if v_lat is None or v_lng is None or not v_id:
            logger.warning(f"Skipping volunteer {v_id} due to missing location data.")
            continue
            
        # Tool execution: Calculate distance
        distance = calculate_distance(business_lat, business_lng, v_lat, v_lng)
        
        # Agent logical evaluation
        if distance <= MAX_ROUTING_DISTANCE_KM and distance < min_distance:
            min_distance = distance
            best_match_id = str(v_id)
            
    if best_match_id:
        logger.info(f"Selected volunteer {best_match_id} at distance {min_distance:.2f}km.")
    else:
        logger.info("No suitable volunteer found within range.")
        
    return best_match_id
