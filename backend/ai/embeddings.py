"""
Embedding generation using Google Gemini embedding model.
Returns a list of floats representing the semantic embedding of the given text.
"""
from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types as genai_types
from core.config import settings
from ai.client_manager import execute_with_fallback

EMBEDDING_MODEL = "models/gemini-embedding-001"


def generate_embedding(text: str) -> list[float]:
    """
    Generate a semantic embedding vector for the given text.
    Returns a list of floats.
    Automatically rotates API keys on failure.
    """
    def _do_embed(client):
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config=genai_types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
        )
        return result.embeddings[0].values
        
    try:
        return execute_with_fallback(_do_embed)
    except Exception as e:
        raise RuntimeError(f"Embedding generation failed: {e}") from e


def generate_query_embedding(text: str) -> list[float]:
    """
    Generate a query embedding (optimised for retrieval queries).
    Automatically rotates API keys on failure.
    """
    def _do_embed(client):
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config=genai_types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
        )
        return result.embeddings[0].values
        
    try:
        return execute_with_fallback(_do_embed)
    except Exception as e:
        raise RuntimeError(f"Query embedding failed: {e}") from e
