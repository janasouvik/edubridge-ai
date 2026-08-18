"""
RAG retrieval layer.

Since pgvector is not currently available, similarity is computed in-memory
using cosine similarity.  When pgvector is installed the vector search query
can be swapped in here without touching the rest of the application.
"""
import json
import math
from sqlalchemy.orm import Session

from ai.embeddings import generate_query_embedding
from models.models import DocumentChunk, StudyMaterial


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def retrieve_context(query: str, db: Session, limit: int = 5) -> list[dict]:
    """
    Retrieve the most relevant document chunks for the given query.

    Returns a list of dicts with keys:
        chunk_text, title, chapter, source_url, relevance
    """
    query_embedding = generate_query_embedding(query)

    # Fetch all chunks that have embeddings stored
    chunks = db.query(DocumentChunk).filter(DocumentChunk.embedding.isnot(None)).all()

    scored: list[tuple[float, DocumentChunk]] = []
    for chunk in chunks:
        try:
            vec = json.loads(chunk.embedding)
            score = _cosine_similarity(query_embedding, vec)
            scored.append((score, chunk))
        except (json.JSONDecodeError, TypeError):
            continue

    # Sort by descending similarity and take top-N
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:limit]

    results = []
    for score, chunk in top:
        material = chunk.study_material
        results.append(
            {
                "chunk_text": chunk.chunk_text,
                "title": material.title if material else "Unknown",
                "chapter": material.chapter if material else None,
                "source_url": material.source_url if material else None,
                "source_name": material.source_name if material else "Unknown",
                "relevance": round(score, 4),
            }
        )
    return results
