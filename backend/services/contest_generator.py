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
    
    suggested_topic = generate_text(topic_prompt).strip()
    suggested_topic = re.sub(r'["\']', '', suggested_topic)
    
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
    raw_response = generate_text(prompt)
    
    cleaned = re.sub(r'^```(?:json)?\s*', '', raw_response.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    
    try:
        questions = json.loads(cleaned)
    except Exception as e:
        raise ValueError(f"Failed to parse JSON for {grade}-{stream}: {str(e)}")

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
