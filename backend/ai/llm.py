"""
LLM abstraction layer — all Gemini API calls go through here.
"""
import google.generativeai as genai
from core.config import settings

genai.configure(api_key=settings.LLM_API_KEY)

_model = genai.GenerativeModel(settings.LLM_MODEL)


def generate_text(prompt: str) -> str:
    """
    Send a prompt to the configured Gemini model and return the text response.
    """
    try:
        response = _model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        raise RuntimeError(f"LLM generation failed: {e}") from e
