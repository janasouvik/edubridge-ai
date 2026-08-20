import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Common stop words including conversational fillers and generic question/action verbs
STOP_WORDS = {
    "what", "is", "a", "an", "the", "explain", "describe", "how", "why", "who",
    "when", "where", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "about", "give", "example", "examples", "formula", "equation", "step", "by",
    "details", "definition", "of", "can", "you", "tell", "me", "are", "do", "does",
    "did", "also", "between", "from", "into", "this", "that", "its", "was", "were",
    "has", "have", "had", "not", "been", "being", "will", "would", "should", "could",
    "may", "might", "shall", "must", "need", "each", "every", "all", "both", "few",
    "more", "most", "other", "some", "such", "than", "too", "very", "just", "because",
    "through", "during", "before", "after", "above", "below", "then", "once", "here",
    "there", "these", "those", "own", "same", "different", "any", "many", "much",
    "using", "used", "use", "make", "like", "get", "let", "know", "see",
    # Mathematical and generic command action verbs
    "solve", "solves", "solving", "solution", "calculate", "calculating",
    "find", "finding", "determine", "eval", "evaluate", "simplify",
    "prove", "show", "answer", "question", "help", "please",
}


def _get_keywords(text: str) -> set[str]:
    """Extract meaningful keywords from a text, filtering stop words."""
    words = re.findall(r'\b[a-z]{2,}\b', text.lower())
    return {w for w in words if w not in STOP_WORDS}


def _compute_overlap(question_keywords: set[str], doc_words: set[str]) -> float:
    """
    Compute the fraction of question keywords that appear in the document's word set.
    Returns a float between 0.0 and 1.0.
    """
    if not question_keywords:
        return 0.0

    matches = len(question_keywords.intersection(doc_words))
    return matches / len(question_keywords)


def authenticate_sources(
    question: str,
    sources: list[dict],
    min_overlap: float = 0.15,
    min_content_length: int = 50,
) -> list[dict]:
    """
    Authenticates and filters sources based on their relevance to the
    user's question. Uses proportional keyword matching rather than a
    simple "any keyword" test.

    Args:
        question:           The user's question.
        sources:            A list of source dicts with 'title' and 'content' keys.
        min_overlap:        Minimum fraction of question keywords that must appear
                            in the source for it to be considered relevant.
        min_content_length: Sources with content shorter than this are dropped
                            as likely stubs or disambiguation pages.

    Returns:
        A filtered list of valid sources, sorted by relevance (best first).
    """
    question_keywords = _get_keywords(question)

    # If the question yields no usable keywords after stop-word removal
    # (e.g. "Why?" or "Solve x² + 5x + 6 = 0"), we cannot filter meaningfully —
    # return empty so the caller falls back to its "no sources" path rather
    # than forwarding irrelevant sources.
    if not question_keywords:
        logger.info("Authenticator: no keywords extracted from question — returning empty")
        return []

    # Proportional matching threshold:
    # 1 keyword -> must match that 1 keyword (100%)
    # 2 keywords -> must match at least 1 keyword (50%)
    # >=3 keywords -> must match at least 30% of keywords (and >= 2 for 4+ keywords)
    if len(question_keywords) == 1:
        effective_min_overlap = 0.99
    elif len(question_keywords) == 2:
        effective_min_overlap = 0.50
    else:
        effective_min_overlap = max(min_overlap, 0.30)

    scored_sources: list[tuple[float, dict]] = []

    for src in sources:
        title = src.get("title", "")
        content = src.get("content", "")

        # Quality gate: skip sources with very short content (stubs,
        # disambiguation pages) or missing titles.
        if len(content.strip()) < min_content_length or not title.strip():
            logger.info(f"Authenticator dropped stub source: {title!r} (content length {len(content)})")
            continue

        combined_text = f"{title} {content}"
        doc_words = set(re.findall(r'\b[a-z]{2,}\b', combined_text.lower()))
        overlap = _compute_overlap(question_keywords, doc_words)

        if overlap >= effective_min_overlap:
            # Attach score for downstream ranking
            src["_auth_score"] = round(overlap, 4)
            scored_sources.append((overlap, src))
        else:
            logger.info(
                f"Authenticator dropped irrelevant source: {title!r} "
                f"(overlap={overlap:.2f}, threshold={effective_min_overlap:.2f})"
            )

    # Sort by descending relevance so the best sources come first
    scored_sources.sort(key=lambda x: x[0], reverse=True)
    return [src for _, src in scored_sources]
