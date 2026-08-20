import json
import re
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import Contest, ContestQuestion, ContestStatusEnum
from ai.web_search import _search_wikipedia, _get_wikipedia_extract
from ai.llm import generate_text

def generate_and_save_contest(db: Session, grade: str, stream: str) -> dict:
    """
    Generates a contest on the fly for the given grade and stream using Gemini and Wikipedia.
    Saves it to the DB and returns the serialized contest dict.
    """
    # 1. Ask Gemini to pick a relevant Wikipedia topic
    topic_prompt = f"""You are an educational AI. Suggest a single, specific Wikipedia article title 
that is highly relevant for a student in Grade: '{grade}' and Stream/Domain: '{stream}'.
Respond ONLY with the exact Wikipedia title string, and nothing else."""
    
    try:
        suggested_topic = generate_text(topic_prompt).strip()
        suggested_topic = re.sub(r'["\']', '', suggested_topic)
    except Exception as e:
        print(f"LLM Topic Generation Failed for {grade}-{stream}: {e}")
        suggested_topic = f"{stream}" if stream and stream != "General" else "Science"
    
    # 2. Search Wikipedia
    search_results = _search_wikipedia(suggested_topic)
    if not search_results:
        search_results = _search_wikipedia("Science")
    
    title = search_results[0]
    wiki_data = _get_wikipedia_extract(title)
    if not wiki_data or not wiki_data.get("extract"):
        raise ValueError(f"Failed to fetch extract for {title}")
    
    extract = wiki_data["extract"][:20000]

    # 3. Generate tailored questions
    prompt = f"""You are an expert educator. Based on the following text, generate exactly 25 distinct Multiple Choice Questions.
The difficulty, terminology, and concepts MUST be tailored specifically for a student in Grade: '{grade}' and Stream: '{stream}'.
Format the output STRICTLY as a raw JSON array of objects, with NO Markdown wrapping (no ```json).
Each object must have exactly these keys:
"question_text" (string)
"option_a" (string)
"option_b" (string)
"option_c" (string)
"option_d" (string)
"correct_option" (string - MUST be exactly "A", "B", "C", or "D")
"explanation" (string)

Text:
{extract}
"""
    try:
        raw_response = generate_text(prompt)
        match = re.search(r'\[.*\]', raw_response, re.DOTALL)
        if not match:
            raise ValueError(f"Failed to find JSON array in response for {grade}-{stream}")
        questions = json.loads(match.group(0))
        
        # Ensure we don't exceed 25 questions or have 0
        if not questions:
            raise ValueError("LLM returned empty questions list.")
        questions = questions[:25]
            
    except Exception as e:
        print(f"LLM Contest Generation Failed. Using Wikipedia fallback for {grade}-{stream}: {e}")
        # Fallback to a hardcoded minimal contest if LLM fails
        questions = [
            {
                "question_text": f"Which of the following is a key fundamental concept in {stream} for Grade {grade}?",
                "option_a": "Advanced Thermodynamics",
                "option_b": "Basic Terminology",
                "option_c": "Quantum Physics",
                "option_d": "Unrelated subject matter",
                "correct_option": "B",
                "explanation": f"Basic terminology forms the foundation of any subject, including {stream}."
            },
            {
                "question_text": f"Why is studying {title} important for a {stream} curriculum?",
                "option_a": "It provides foundational knowledge.",
                "option_b": "It is not important.",
                "option_c": "It is only for general knowledge.",
                "option_d": "It replaces practical experience.",
                "correct_option": "A",
                "explanation": f"Foundational knowledge is required to master {stream}."
            },
            {
                "question_text": "What is the primary source of the material provided in this test?",
                "option_a": "A random textbook",
                "option_b": "Wikipedia",
                "option_c": "A blog post",
                "option_d": "A newspaper",
                "correct_option": "B",
                "explanation": "The text provided for this test was sourced directly from Wikipedia."
            },
            {
                "question_text": f"In the context of {stream}, how can Wikipedia extracts be useful?",
                "option_a": "By providing a quick summary of topics.",
                "option_b": "By writing your essays for you.",
                "option_c": "By replacing all textbooks.",
                "option_d": "By confusing the student.",
                "correct_option": "A",
                "explanation": "Wikipedia extracts provide concise summaries of complex topics."
            },
            {
                "question_text": f"What should a Grade {grade} student focus on when reading about {title}?",
                "option_a": "Memorizing the entire article.",
                "option_b": "Understanding the core concepts.",
                "option_c": "Ignoring the text.",
                "option_d": "Only looking at the pictures.",
                "correct_option": "B",
                "explanation": "Understanding core concepts is critical for long-term retention."
            }
        ]

    # 4. Save to DB
    now = datetime.utcnow()
    today_live = now - timedelta(minutes=10)
    
    contest = Contest(
        title=f"Daily Challenge: {title}",
        domain=stream,
        target_grade=grade,
        target_stream=stream,
        scheduled_at=today_live,
        duration_minutes=75,
        status=ContestStatusEnum.upcoming,
    )
    db.add(contest)
    db.flush()
    
    for i, q in enumerate(questions):
        db.add(ContestQuestion(contest_id=contest.id, position=i + 1, **q))
        
    db.commit()
    db.refresh(contest)
    
    # Return in the format expected by the frontend list
    return {
        "id": contest.id,
        "title": contest.title,
        "domain": contest.domain,
        "target_grade": contest.target_grade,
        "target_stream": contest.target_stream,
        "scheduled_at": contest.scheduled_at.isoformat(),
        "duration_minutes": contest.duration_minutes,
        "status": contest.status.value,
        "participants": 0,
        "created_at": contest.created_at.isoformat() if contest.created_at else None,
    }
