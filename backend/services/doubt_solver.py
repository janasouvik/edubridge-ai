"""
Doubt Solver Service — Grounded RAG-based answer generation.
"""
from sqlalchemy.orm import Session

from ai.rag import retrieve_context
from ai.llm import generate_text


def solve_doubt(
    question: str,
    language: str,
    subject: str,
    topic: str,
    db: Session,
) -> dict:
    """
    1. Retrieve relevant educational chunks from the knowledge base.
    2. Build a grounded prompt including context.
    3. Call LLM to generate a step-by-step explanation.
    4. Return answer + source citations.
    """
    # Step 1: Retrieve relevant educational context
    query = f"{subject} {topic} {question}"
    chunks = retrieve_context(query=query, db=db, limit=5)

    # Step 2: Build context block
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        context_parts.append(
            f"[Source {i}] {chunk['title']} — {chunk.get('chapter', '')}\n{chunk['chunk_text']}"
        )
    context_block = "\n\n".join(context_parts) if context_parts else ""

    # Step 3: Build the grounded prompt
    if context_block:
        prompt = f"""You are an expert educational tutor for Indian students. 
Answer the following question using ONLY the provided educational context below.
Respond in {language}. Be simple, clear, and step-by-step. 
Do NOT invent citations. If the context does not have enough information, say so explicitly.

Student's Question: {question}
Subject: {subject}
Topic: {topic}

--- Educational Context ---
{context_block}
--- End of Context ---

Now provide a clear, step-by-step explanation suitable for a student. 
At the end, include which sources you referenced."""
    else:
        prompt = f"""You are an expert educational tutor for Indian students.
Answer the following question in {language}. Be simple, clear, and step-by-step.
Note: No specific educational source was found in the knowledge base for this question.
Indicate that this answer is based on general knowledge, not a specific textbook source.

Student's Question: {question}
Subject: {subject}
Topic: {topic}"""

    # Step 4: Generate answer from LLM
    answer = generate_text(prompt)

    # Step 5: Build citations list
    sources = [
        {
            "title": chunk["title"],
            "chapter": chunk.get("chapter"),
            "source_url": chunk.get("source_url"),
            "relevance": chunk["relevance"],
        }
        for chunk in chunks
        if chunk["relevance"] > 0.3
    ]

    return {
        "answer": answer,
        "language": language,
        "topic": topic,
        "sources": sources,
    }
