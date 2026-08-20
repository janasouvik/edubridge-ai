import re
import logging

logger = logging.getLogger(__name__)

def _get_keywords(text: str) -> set[str]:
    """Extract meaningful keywords from a text."""
    stop_words = {
        "what", "is", "a", "an", "the", "explain", "describe", "how", "why", "who", 
        "when", "where", "and", "or", "but", "in", "on", "at", "to", "for", "with", 
        "about", "give", "example", "examples", "formula", "equation", "step", "by", 
        "details", "definition", "of", "can", "you", "tell", "me", "are", "do", "does", "did"
    }
    # Match words with at least 3 characters
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    return {w for w in words if w not in stop_words}

def authenticate_sources(question: str, sources: list[dict]) -> list[dict]:
    """
    Authenticates and filters sources (both online and internal) based on their 
    relevance to the user's question. Ensures that only valid, relevant sources 
    are passed to the AI or fallback response.
    
    Args:
        question: The user's question
        sources: A list of source dictionaries with 'title' and 'content' keys
        
    Returns:
        A filtered list of valid sources.
    """
    question_keywords = _get_keywords(question)
    
    # If we couldn't extract any meaningful keywords from the question, 
    # we can't reliably filter, so return everything.
    if not question_keywords:
        return sources

    valid_sources = []
    
    for src in sources:
        title = src.get("title", "")
        content = src.get("content", "")
        
        # Lowercase text to check against keywords
        text_to_check = (title + " " + content).lower()
        
        # Count how many question keywords appear in the source's title or content
        matches = sum(1 for kw in question_keywords if kw in text_to_check)
        
        # If at least one keyword matches, we consider the source relevant.
        # This effectively drops completely unrelated documents (e.g. Probability doc for a Physics query).
        if matches > 0:
            valid_sources.append(src)
        else:
            logger.info(f"Authenticator dropped irrelevant source: {title}")
            
    return valid_sources
