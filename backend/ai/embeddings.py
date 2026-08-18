"""
Embedding generation using Google Gemini embedding model.
Returns a list of floats representing the semantic embedding of the given text.
"""
import google.generativeai as genai
from core.config import settings

genai.configure(api_key=settings.LLM_API_KEY)

EMBEDDING_MODEL = "models/embedding-001"


def generate_embedding(text: str) -> list[float]:
    """
    Generate a semantic embedding vector for the given text.
    Returns a list of floats (768 dimensions for text-embedding-004).
    """
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]
    except Exception as e:
        raise RuntimeError(f"Embedding generation failed: {e}") from e


def generate_query_embedding(text: str) -> list[float]:
    """
    Generate a query embedding (optimised for retrieval queries).
    """
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_query",
        )
        return result["embedding"]
    except Exception as e:
        raise RuntimeError(f"Query embedding failed: {e}") from e
