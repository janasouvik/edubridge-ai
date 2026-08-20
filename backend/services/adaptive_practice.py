"""
Adaptive Practice Service.

Generates subject-wise MCQ questions targeting the student's grade
using Wikipedia for grounding.
"""
import json
import re
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ai.llm import generate_text
from ai.web_search import _search_wikipedia, _get_wikipedia_extract
from models.models import Student, PracticeSession, PracticeMCQ


def generate_practice_session(subject: str, level: str, student: Student, db: Session) -> dict:
    """
    Generate a new practice session with 5 MCQs based on the subject and student's grade/level.
    """
    grade = student.grade or "10"
    
    if level == "higher_ed":
        target_audience = "Undergraduate / Postgraduate university student"
    else:
        target_audience = f"student in Grade: '{grade}'"
        
    # 1. Ask Gemini to pick a relevant Wikipedia topic
    topic_prompt = f"""You are an educational AI. Suggest a single, specific Wikipedia article title 
that is highly relevant for a {target_audience} wanting to practice '{subject}'.
Respond ONLY with the exact Wikipedia title string, and nothing else."""
    
    suggested_topic = generate_text(topic_prompt).strip()
    suggested_topic = re.sub(r'["\']', '', suggested_topic)
    
    # 2. Search Wikipedia
    search_results = _search_wikipedia(suggested_topic)
    if not search_results:
        search_results = _search_wikipedia(subject)
    
    title = search_results[0]
    wiki_data = _get_wikipedia_extract(title)
    if not wiki_data or not wiki_data.get("extract"):
        raise ValueError(f"Failed to fetch extract for {title}")
    
    extract = wiki_data["extract"][:20000]

    # 3. Generate exactly 5 tailored questions
    prompt = f"""You are an expert educator. Based on the following text, generate exactly 5 distinct Multiple Choice Questions.
The difficulty, terminology, and concepts MUST be tailored specifically for a {target_audience} studying '{subject}'.
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
        raise ValueError(f"Failed to parse JSON: {str(e)}\nRaw: {raw_response[:500]}")

    if len(questions) != 5:
        # Pad or slice to exactly 5
        questions = questions[:5]
        
    # 4. Save to DB
    session = PracticeSession(
        student_id=student.id,
        subject=subject,
    )
    db.add(session)
    db.flush()
    
    db_questions = []
    for i, q in enumerate(questions):
        mcq = PracticeMCQ(
            session_id=session.id,
            position=i + 1,
            question_text=q["question_text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=q["correct_option"],
            explanation=q["explanation"],
        )
        db.add(mcq)
        db_questions.append(mcq)
        
    db.commit()
    db.refresh(session)
    
    return {
        "session_id": session.id,
        "subject": session.subject,
        "questions": [
            {
                "id": q.id,
                "position": q.position,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
            }
            for q in db_questions
        ]
    }


def submit_practice_session(session_id: int, answers: dict[int, str], student: Student, db: Session) -> dict:
    """
    Evaluate the student's answers for the session and return results.
    answers: {question_id: "A"|"B"|"C"|"D"}
    """
    session = db.query(PracticeSession).filter(
        PracticeSession.id == session_id,
        PracticeSession.student_id == student.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Practice session not found")
        
    if session.completed:
        raise HTTPException(status_code=400, detail="Session already completed")

    questions = db.query(PracticeMCQ).filter(PracticeMCQ.session_id == session.id).order_by(PracticeMCQ.position).all()
    
    score = 0
    detailed_results = []
    
    for q in questions:
        student_ans = answers.get(q.id) or answers.get(str(q.id))
        is_correct = student_ans == q.correct_option
        
        if is_correct:
            score += 1
            
        q.student_answer = student_ans
        
        detailed_results.append({
            "question_id": q.id,
            "position": q.position,
            "question_text": q.question_text,
            "is_correct": is_correct,
            "student_answer": student_ans,
            "correct_option": q.correct_option,
            "explanation": q.explanation,
        })
        
    session.score = score
    session.completed = True
    db.commit()
    
    return {
        "session_id": session.id,
        "score": score,
        "total": len(questions),
        "detailed_results": detailed_results
    }
