"""
LLM abstraction layer — all Gemini API calls go through here.
"""
from core.config import settings
from ai.client_manager import execute_with_fallback

def generate_text(prompt: str) -> str:
    """
    Send a prompt to the configured Gemini model and return the text response.
    Automatically rotates API keys on failure.
    """
    def _do_generate(client):
        response = client.models.generate_content(
            model=settings.LLM_MODEL,
            contents=prompt,
        )
        return response.text.strip()
        
    try:
        return execute_with_fallback(_do_generate)
    except Exception as e:
        raise RuntimeError(f"LLM generation failed: {e}") from e
