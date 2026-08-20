"""
Client Manager — handles multiple Gemini API keys and automatically fails over
if a key is rate-limited (429) or reported as leaked (403).
"""
import logging
from typing import Callable, Any
from google import genai
from google.genai.errors import ClientError
from core.config import settings

logger = logging.getLogger(__name__)

# Parse keys from the comma-separated env string
_api_keys = [k.strip() for k in settings.LLM_API_KEYS.split(",") if k.strip()]
if not _api_keys:
    raise ValueError("No valid LLM_API_KEYS found in configuration.")

# Initialize clients for all keys
_clients = [genai.Client(api_key=key) for key in _api_keys]
_current_client_index = 0

def execute_with_fallback(action: Callable[[genai.Client], Any]) -> Any:
    """
    Executes a callable that takes a genai.Client as input.
    If the client fails with a 429 or 403 error, it rotates to the next client
    and retries, up to the number of available keys.
    """
    global _current_client_index
    attempts = 0
    max_attempts = len(_clients)
    
    last_error = None
    
    while attempts < max_attempts:
        client = _clients[_current_client_index]
        try:
            return action(client)
        except ClientError as e:
            # Catch 429 (Resource Exhausted) and 403 (Permission Denied/Leaked Key)
            if e.code in (429, 403):
                logger.warning(f"Client { _current_client_index } failed with {e.code}: {e.message}. Rotating to next key.")
                _current_client_index = (_current_client_index + 1) % len(_clients)
                attempts += 1
                last_error = e
            else:
                # Other ClientErrors are likely bad requests (e.g., 400), don't retry.
                raise
        except Exception as e:
            # For non-ClientErrors, raise immediately
            raise
            
    # If we exhausted all keys
    raise RuntimeError(f"All {max_attempts} Gemini API keys exhausted. Last error: {last_error}") from last_error
