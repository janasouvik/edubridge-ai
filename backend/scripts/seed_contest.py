"""
Seed dynamic daily contests for every active student cohort (Grade + Stream combination),
generated via Gemini using dynamically selected Wikipedia articles.
"""
import sys, os, random, json, re, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from sqlalchemy import text
from db.db import SessionLocal, engine
from models.models import Contest, ContestQuestion, ContestStatusEnum, Base, Student
from ai.web_search import _search_wikipedia, _get_wikipedia_extract
from ai.llm import generate_text

def generate_questions_for_cohort(grade: str, stream: str) -> tuple[str, list[dict]]:
    # 1. Ask Gemini to pick a relevant Wikipedia topic for this cohort
    topic_prompt = f"""You are an educational AI. Suggest a single, specific Wikipedia article title 
that is highly relevant for a student in Grade: '{grade}' and Stream/Domain: '{stream}'.
Respond ONLY with the exact Wikipedia title string, and nothing else."""
    
    suggested_topic = generate_text(topic_prompt).strip()
    # Strip any markdown or quotes
    suggested_topic = re.sub(r'["\']', '', suggested_topic)
    
    print(f"[{grade} - {stream}] Suggested Topic: {suggested_topic}")
    
    # 2. Search Wikipedia
    search_results = _search_wikipedia(suggested_topic)
    if not search_results:
        # Fallback to a random generic topic if search fails
        search_results = _search_wikipedia("Science")
    
    title = search_results[0]
    print(f"[{grade} - {stream}] Using Wikipedia Article: {title}")
    
    wiki_data = _get_wikipedia_extract(title)
    if not wiki_data or not wiki_data.get("extract"):
        raise ValueError(f"Failed to fetch extract for {title}")
    
    extract = wiki_data["extract"][:20000] # Truncate to avoid massive token usage

    # 3. Generate tailored questions
    print(f"[{grade} - {stream}] Generating 25 MCQs...")
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
        print(f"JSON Parse Error for {grade}-{stream}. Raw:\n{raw_response[:500]}...")
        raise e
        
    return title, questions


def run_seeder():
    # Attempt to apply schema updates dynamically if they don't exist
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE contests ADD COLUMN target_grade VARCHAR(50) NOT NULL DEFAULT '10'"))
        except Exception:
            pass 
        try:
            conn.execute(text("ALTER TABLE contests ADD COLUMN target_stream VARCHAR(255) NULL"))
        except Exception:
            pass 

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Clearing old contests...")
    db.query(ContestQuestion).delete()
    db.query(Contest).delete()
    db.commit()

    # Find all active cohorts
    cohorts = db.query(Student.grade, Student.learning_level).distinct().all()
    print(f"Found {len(cohorts)} active student cohorts.")

    now = datetime.utcnow()
    # Today's contest (started 10 mins ago, so it is LIVE)
    today_live = now - timedelta(minutes=10)

    for idx, (grade, stream) in enumerate(cohorts):
        # Default fallbacks if none
        safe_grade = grade or "10"
        safe_stream = stream or "General"
        
        print(f"\n--- Processing Cohort {idx+1}/{len(cohorts)}: Grade {safe_grade}, Stream {safe_stream} ---")
        
        try:
            topic_title, q_data = generate_questions_for_cohort(safe_grade, safe_stream)
        except Exception as e:
            print(f"Failed to generate for {safe_grade}-{safe_stream}: {e}")
            continue

        contest = Contest(
            title=f"Daily Challenge: {topic_title}",
            domain=safe_stream,
            target_grade=safe_grade,
            target_stream=safe_stream,
            scheduled_at=today_live,
            duration_minutes=75,
            status=ContestStatusEnum.upcoming,
        )
        db.add(contest)
        db.flush()
        
        for i, q in enumerate(q_data):
            db.add(ContestQuestion(contest_id=contest.id, position=i + 1, **q))
            
        db.commit()
        print(f"✅ Saved Contest for {safe_grade}-{safe_stream} ({len(q_data)} qs, topic: {topic_title})")
        
        # Prevent Gemini Rate Limits
        if idx < len(cohorts) - 1:
            print("Sleeping for 15 seconds to avoid rate limits...")
            time.sleep(15)

    print("\nAll cohorts processed successfully!")
    db.close()

if __name__ == "__main__":
    run_seeder()
