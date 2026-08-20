"""
Doubt Solver Service — Grounded RAG-based answer generation.

Pipeline:
  1. Fetch educational content from online sources (Wikipedia, etc.)
  2. Also check local knowledge base (RAG) for supplementary context
  3. Combine all context and pass to Gemini for formatting/summarising
     into a student-friendly, step-by-step explanation
  4. Return the answer with source citations

Gemini is used ONLY for chat formatting — the factual content comes
from online sources and the local knowledge base.
"""
import ast
import logging
import operator
import re
from typing import Optional
from sqlalchemy.orm import Session

from ai.web_search import fetch_online_context
from ai.rag import retrieve_context
from ai.llm import generate_text
from ai.ans_authenticator import authenticate_sources

logger = logging.getLogger(__name__)

_SAFE_OPERATORS = {
    ast.Add: (operator.add, "+", "addition"),
    ast.Sub: (operator.sub, "-", "subtraction"),
    ast.Mult: (operator.mul, "×", "multiplication"),
    ast.Div: (operator.truediv, "÷", "division"),
    ast.FloorDiv: (operator.floordiv, "//", "integer division"),
    ast.Mod: (operator.mod, "%", "modulo (remainder)"),
    ast.Pow: (operator.pow, "^", "exponentiation / power"),
    ast.USub: (operator.neg, "-", "negation"),
    ast.UAdd: (operator.pos, "+", "positive"),
}


def _eval_ast_node(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    elif isinstance(node, ast.BinOp):
        left = _eval_ast_node(node.left)
        right = _eval_ast_node(node.right)
        op_type = type(node.op)
        if op_type in _SAFE_OPERATORS:
            func = _SAFE_OPERATORS[op_type][0]
            return func(left, right)
    elif isinstance(node, ast.UnaryOp):
        operand = _eval_ast_node(node.operand)
        op_type = type(node.op)
        if op_type in _SAFE_OPERATORS:
            func = _SAFE_OPERATORS[op_type][0]
            return func(operand)
    raise ValueError("Unsupported or unsafe math expression")


def _try_solve_arithmetic(query: str, language: str) -> Optional[dict]:
    """
    Directly and accurately evaluates arithmetic queries (e.g. '3+7', 'what is 5+7', '25 * 4').
    Returns a structured step-by-step answer if successful, or None.
    """
    clean = query.strip().rstrip("?!.")
    clean = re.sub(
        r"^(?:what\s+is\s+|calculate\s+|solve\s+|evaluate\s+|find\s+|compute\s+)",
        "",
        clean,
        flags=re.IGNORECASE,
    ).strip()

    # Must contain only arithmetic characters, at least one operator, and at least one digit
    if (
        re.match(r"^[\d\s\+\-\*\/\(\)\^\%×÷\.]+$", clean)
        and re.search(r"[\+\-\*\/\^\%×÷]", clean)
        and re.search(r"\d", clean)
    ):
        sanitized = clean.replace("^", "**").replace("×", "*").replace("÷", "/")
        try:
            tree = ast.parse(sanitized, mode="eval")
            result = _eval_ast_node(tree.body)
            if isinstance(result, float) and result.is_integer():
                result = int(result)

            formatted_answer = (
                f"**Step-by-step Solution:**\n\n"
                f"1. **Given Expression**: `{clean}`\n"
                f"2. **Calculate**: Performing the arithmetic operation gives `{result}`\n"
                f"3. **Result**: `{clean} = {result}`\n\n"
                f"{clean} = **{result}**"
            )

            return {
                "answer": formatted_answer,
                "language": language,
                "topic": "Arithmetic",
                "sources": [],
            }
        except Exception as e:
            logger.debug(f"Direct arithmetic parsing failed: {e}")
            return None

    return None


def _is_conversational(query: str) -> bool:
    q = query.lower().strip().strip("?!.")
    chat_phrases = {
        "hi", "hello", "hey", "how are you", "who are you", "what is your name",
        "good morning", "good afternoon", "good evening", "good night",
        "thanks", "thank you", "bye", "goodbye", "ok", "okay", "yes", "no",
        "what's up", "sup", "how are you doing", "can you help me"
    }
    if q in chat_phrases:
        return True

    # If query contains digits, math operators, or symbols, it is NOT conversational
    if re.search(r"[\d\+\-\*\/\=\^\%\(\)\<\>]", q):
        return False

    # Only short strings composed entirely of greeting/confirmation words are conversational
    words = q.split()
    conversational_words = {
        "hi", "hello", "hey", "ok", "okay", "thanks", "thank", "you",
        "bye", "goodbye", "yes", "no", "yep", "nope", "sure", "cool", "great"
    }
    if words and all(w in conversational_words for w in words):
        return True

    return False


def solve_doubt(
    question: str,
    language: str,
    subject: str,
    topic: str,
    db: Session,
) -> dict:
    """
    1. Check for direct arithmetic expressions (e.g. 3+7, what is 5+7) and solve accurately.
    2. Check for conversational chat.
    3. Fetch relevant content from online sources (Wikipedia, etc.).
    4. Retrieve relevant educational chunks from the local knowledge base.
    5. Build a grounded prompt including all context.
    6. Call LLM to format/summarise into a step-by-step explanation.
    7. Return answer + source citations.
    """

    # ------------------------------------------------------------------ #
    # Step 0: Direct Arithmetic Evaluation (Fast, 100% Accurate)
    # ------------------------------------------------------------------ #
    arithmetic_res = _try_solve_arithmetic(question, language)
    if arithmetic_res:
        return arithmetic_res

    # ------------------------------------------------------------------ #
    # Normal Chat Check
    # ------------------------------------------------------------------ #
    if _is_conversational(question):
        prompt = f"The user just said: '{question}'. Respond politely and conversationally in {language}."
        try:
            answer = generate_text(prompt)
        except Exception as e:
            logger.error(f"LLM generation failed for chat: {e}")
            answer = "Hello! I am your EduBridge AI Tutor. How can I help you with your studies today?"

        return {
            "answer": answer,
            "language": language,
            "topic": "General Chat",
            "sources": [],
        }

    # ------------------------------------------------------------------ #
    # Step 1: Fetch from online sources (Wikipedia, etc.)
    # ------------------------------------------------------------------ #
    online_sources = fetch_online_context(
        question=question, subject=subject, topic=topic
    )
    # Authenticate and filter irrelevant online sources
    online_sources = authenticate_sources(question, online_sources)

    # ------------------------------------------------------------------ #
    # Step 2: Retrieve from local knowledge base (supplementary)
    # ------------------------------------------------------------------ #
    try:
        raw_local_chunks = retrieve_context(query=question, db=db, limit=3)
        # Convert to authenticator format
        local_sources = [
            {"title": chunk["title"], "content": chunk["chunk_text"], "_original_chunk": chunk}
            for chunk in raw_local_chunks
        ]
        # Authenticate and filter irrelevant internal chunks
        valid_local = authenticate_sources(question, local_sources)
        local_chunks = [src["_original_chunk"] for src in valid_local]
    except Exception as e:
        import logging
        logging.warning(f"Skipping local RAG due to error: {e}")
        local_chunks = []

    # ------------------------------------------------------------------ #
    # Step 3: Build context block from all sources
    # ------------------------------------------------------------------ #
    context_parts = []
    source_idx = 1

    # Online sources first (primary)
    for src in online_sources:
        context_parts.append(
            f"[Source {source_idx} — {src['source_name']}: {src['title']}]\n"
            f"URL: {src['url']}\n"
            f"{src['content']}"
        )
        source_idx += 1

    # Local knowledge base chunks (supplementary)
    for chunk in local_chunks:
        if chunk["relevance"] > 0.3:
            context_parts.append(
                f"[Source {source_idx} — {chunk.get('source_name', 'Knowledge Base')}: "
                f"{chunk['title']}]\n{chunk['chunk_text']}"
            )
            source_idx += 1

    context_block = "\n\n".join(context_parts) if context_parts else ""

    # ------------------------------------------------------------------ #
    # Step 4: Build the grounded prompt — Gemini only formats/explains
    # ------------------------------------------------------------------ #
    if context_block:
        prompt = f"""You are an expert educational tutor for Indian students.
Your job is to EXPLAIN the following question using ONLY the provided source content below.
Do NOT generate facts from your own knowledge — use only what the sources say.
Respond in {language}. Be simple, clear, and step-by-step.
If the sources don't have enough information, say so explicitly.

Student's Question: {question}
Subject: {subject}
Topic: {topic}

--- Source Content ---
{context_block}
--- End of Sources ---

Now provide a clear, step-by-step explanation suitable for a student.
At the end, mention which sources you referenced (by name and number)."""
    else:
        prompt = f"""You are an expert educational tutor for Indian students.
Answer the following question in {language}. Be simple, clear, and step-by-step.
Note: No specific online or textbook source was found for this question.
Indicate that this answer is based on general knowledge, not a verified source.

Student's Question: {question}
Subject: {subject}
Topic: {topic}"""

    # ------------------------------------------------------------------ #
    # Step 5: Generate formatted answer from LLM (with fallback)
    # ------------------------------------------------------------------ #
    try:
        answer = generate_text(prompt)
    except Exception as e:
        import logging
        logging.error(f"LLM generation failed: {e}")
        # Provide a graceful fallback using raw Wikipedia text
        if context_block:
            answer = (
                "*(Note: Our AI formatting service is currently experiencing high load. "
                "Here is the raw, unformatted information retrieved from our online sources:)*\n\n"
                + context_block
            )
        else:
            answer = "Sorry, I am currently overloaded and unable to fetch an answer right now. Please try again later."

    # ------------------------------------------------------------------ #
    # Step 6: Build citations list
    # ------------------------------------------------------------------ #
    sources = []

    # Online source citations
    for src in online_sources:
        sources.append({
            "title": f"{src['source_name']}: {src['title']}",
            "chapter": None,
            "source_url": src["url"],
            "image_url": src.get("image_url"),
            "relevance": 0.95,  # online sources are directly fetched
        })

    # Local KB citations (only high-relevance)
    for chunk in local_chunks:
        if chunk["relevance"] > 0.3:
            sources.append({
                "title": chunk["title"],
                "chapter": chunk.get("chapter"),
                "source_url": chunk.get("source_url"),
                "image_url": None,
                "relevance": chunk["relevance"],
            })

    return {
        "answer": answer,
        "language": language,
        "topic": topic,
        "sources": sources,
    }
