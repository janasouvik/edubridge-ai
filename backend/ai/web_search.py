"""
Web search module — fetches educational content from free online sources.

Sources used:
1. Wikipedia API (primary) — full article summaries and extracts
2. Wikipedia search — to find relevant articles when direct match fails

Gemini is NOT used here. This module only fetches raw knowledge.
"""
import httpx
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

_HTTP_TIMEOUT = 10.0  # seconds

# Wikipedia API requires a descriptive User-Agent header
_HEADERS = {
    "User-Agent": "EduBridgeAI/1.0 (https://github.com/janasouvik/edubridge-ai; educational project)",
}
_client = httpx.Client(headers=_HEADERS, timeout=_HTTP_TIMEOUT, follow_redirects=True)


# --------------------------------------------------------------------------- #
# Wikipedia
# --------------------------------------------------------------------------- #

def _search_wikipedia(query: str, limit: int = 3) -> list[str]:
    """Search Wikipedia and return a list of matching page titles."""
    try:
        resp = _client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "srlimit": limit,
                "format": "json",
            },
            timeout=_HTTP_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        return [item["title"] for item in data.get("query", {}).get("search", [])]
    except Exception as e:
        logger.warning(f"Wikipedia search failed: {e}")
        return []


def _get_wikipedia_extract(title: str) -> Optional[dict]:
    """Fetch a plain-text extract, page URL, and image for a Wikipedia article."""
    try:
        resp = _client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "titles": title,
                "prop": "extracts|info|pageimages",
                "exintro": True,
                "explaintext": True,
                "inprop": "url",
                "pithumbsize": 500,
                "format": "json",
            },
            timeout=_HTTP_TIMEOUT,
        )
        resp.raise_for_status()
        pages = resp.json().get("query", {}).get("pages", {})
        for _page_id, page in pages.items():
            if "missing" in page:
                return None
            extract = page.get("extract", "")
            if extract:
                # Remove entire lines containing display style raw LaTeX (solves nested braces issue)
                extract = re.sub(r'^.*\{\\displaystyle.*$', '', extract, flags=re.MULTILINE)
                # Replace single newlines with spaces to fix broken math text lines
                extract = re.sub(r'(?<!\n)\n(?!\n)', ' ', extract)
                # Replace multiple spaces with a single space
                extract = re.sub(r' +', ' ', extract)
                # Fix multiple newlines
                extract = re.sub(r'\n{3,}', '\n\n', extract).strip()

            return {
                "title": page.get("title", title),
                "extract": extract,
                "url": page.get("fullurl", f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"),
                "image_url": page.get("thumbnail", {}).get("source"),
            }
    except Exception as e:
        logger.warning(f"Wikipedia extract failed for '{title}': {e}")
    return None


def _get_wikipedia_summary(query: str) -> Optional[dict]:
    """
    Try Wikipedia REST summary API first (fast, clean), then
    fall back to search + extract if the direct lookup misses.
    """
    # 1) Direct REST summary (works well for exact topic names)
    try:
        slug = query.replace(" ", "_")
        resp = _client.get(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}",
            timeout=_HTTP_TIMEOUT,
            follow_redirects=True,
        )
        if resp.status_code == 200:
            data = resp.json()
            extract = data.get("extract", "")
            if extract and len(extract) > 80:
                image_url = data.get("originalimage", {}).get("source") or data.get("thumbnail", {}).get("source")
                return {
                    "title": data.get("title", query),
                    "extract": extract,
                    "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                    "image_url": image_url,
                }
    except Exception:
        pass

    # 2) Search then fetch full extract
    titles = _search_wikipedia(query, limit=3)
    for title in titles:
        result = _get_wikipedia_extract(title)
        if result and len(result["extract"]) > 80:
            return result

    return None


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #

def _extract_keywords(text: str) -> str:
    stop_words = {"what", "is", "a", "an", "the", "explain", "describe", "how", "why", "who", "when", "where", "and", "or", "but", "in", "on", "at", "to", "for", "with", "about", "give", "example", "examples", "formula", "equation", "step", "by", "details", "definition", "of", "can", "you", "tell", "me"}
    words = re.findall(r'\b\w+\b', text.lower())
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    # If we stripped everything, just return the first 3 words of the original
    if not keywords:
        return " ".join(words[:3])
    return " ".join(keywords)

def fetch_online_context(question: str, subject: str, topic: str) -> list[dict]:
    """
    Search Wikipedia and local NCERT databases to build a combined context.
    Prioritizes specific Wikipedia articles over broad search.
    """
    results: list[dict] = []
    
    # Build search queries — try specific first, then broader
    queries = []
    
    # 1. Extract keywords from the question to avoid Wikipedia search failing on full sentences
    keywords = _extract_keywords(question)
    if keywords:
        queries.append(keywords)
        queries.append(f"{keywords} {subject}")

    # 2. Add the actual question just in case it's a direct entity name
    if len(question.split()) <= 4:
        queries.append(question)
        queries.append(f"{question} {subject}")
    
    # 3. Fallback to topic
    if topic and topic.lower() != "general":
        queries.append(f"{topic} {subject}")
        queries.append(topic)

    seen_titles: set[str] = set()

    for query in queries:
        if len(results) >= 3:
            break

        wiki = _get_wikipedia_summary(query)
        if wiki and wiki["title"] not in seen_titles:
            seen_titles.add(wiki["title"])
            results.append({
                "source_name": "Wikipedia",
                "title": wiki["title"],
                "content": wiki["extract"],
                "url": wiki["url"],
                "image_url": wiki.get("image_url"),
            })

    return results
