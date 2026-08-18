"""
Adaptive Practice Service.

Generates questions targeting the student's weakest topic and
adjusts difficulty based on recent performance.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ai.llm import generate_text
from models.models import Student, Question, Attempt, LearningGap, SeverityEnum, DifficultyEnum


# ------------------------------------------------------------------ #
# Difficulty determination
# ------------------------------------------------------------------ #

def _calculate_recent_accuracy(student: Student, db: Session, days: int = 7) -> float:
    """Returns accuracy (0.0–1.0) over the last `days` days."""
    since = datetime.utcnow() - timedelta(days=days)
    recent_attempts = (
        db.query(Attempt)
        .filter(Attempt.student_id == student.id, Attempt.created_at >= since)
        .all()
    )
    if not recent_attempts:
        return 0.5  # assume medium difficulty for new students
    correct = sum(1 for a in recent_attempts if a.is_correct)
    return correct / len(recent_attempts)


def _determine_difficulty(accuracy: float) -> DifficultyEnum:
    """Simple adaptive difficulty rule from PRD."""
    if accuracy < 0.40:
        return DifficultyEnum.easy
    elif accuracy <= 0.70:
        return DifficultyEnum.medium
    else:
        return DifficultyEnum.hard


def _get_worst_gap(student: Student, db: Session) -> LearningGap | None:
    """Return the learning gap with the lowest confidence score."""
    return (
        db.query(LearningGap)
        .filter(LearningGap.student_id == student.id)
        .order_by(LearningGap.confidence_score.asc())
        .first()
    )


# ------------------------------------------------------------------ #
# Question generation
# ------------------------------------------------------------------ #

def generate_next_question(student: Student, db: Session) -> dict:
    """
    Generate the next adaptive practice question for this student.
    Returns the stored Question as a dict.
    """
    # 1. Identify worst learning gap
    gap = _get_worst_gap(student, db)
    if gap:
        topic = gap.topic
        subject = "General"  # could be enhanced by linking topics to subjects
    else:
        topic = "Basic Concepts"
        subject = "General"

    # 2. Determine difficulty based on recent accuracy
    accuracy = _calculate_recent_accuracy(student, db)
    difficulty = _determine_difficulty(accuracy)

    # 3. Generate question via LLM
    prompt = f"""Generate ONE educational practice question for an Indian school student.

Subject: {subject}
Topic: {topic}
Difficulty: {difficulty.value}
Student's preferred language: {student.preferred_language}

Requirements:
- Ask a clear, objective question (preferably short answer or MCQ).
- Provide the CORRECT ANSWER clearly labeled "Answer:".
- Provide a brief EXPLANATION labeled "Explanation:".
- Keep it suitable for grade {student.grade or 'school'} students.

Format strictly as:
Question: <question text here>
Answer: <correct answer here>
Explanation: <explanation here>"""

    raw = generate_text(prompt)

    # Parse LLM response
    question_text = ""
    correct_answer = ""
    explanation = ""

    for line in raw.splitlines():
        line = line.strip()
        if line.lower().startswith("question:"):
            question_text = line[len("question:"):].strip()
        elif line.lower().startswith("answer:"):
            correct_answer = line[len("answer:"):].strip()
        elif line.lower().startswith("explanation:"):
            explanation = line[len("explanation:"):].strip()

    # Fallback if parsing fails
    if not question_text:
        question_text = raw
    if not correct_answer:
        correct_answer = "See explanation"

    # 4. Save question to DB
    question = Question(
        subject=subject,
        topic=topic,
        difficulty=difficulty,
        question_text=question_text,
        correct_answer=correct_answer,
        explanation=explanation,
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "question_id": question.id,
        "subject": question.subject,
        "topic": question.topic,
        "difficulty": question.difficulty.value,
        "question": question.question_text,
    }


# ------------------------------------------------------------------ #
# Answer submission & learning gap update
# ------------------------------------------------------------------ #

def _normalize(text: str) -> str:
    return text.strip().lower()


def submit_answer(student: Student, question_id: int, answer: str, db: Session) -> dict:
    """
    Evaluate the student's answer, store the attempt, update learning gap.
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Question not found")

    # Simple exact/normalized comparison
    is_correct = _normalize(answer) == _normalize(question.correct_answer)

    # Store attempt
    attempt = Attempt(
        student_id=student.id,
        question_id=question_id,
        answer=answer,
        is_correct=is_correct,
    )
    db.add(attempt)

    # Update or create learning gap for this topic
    gap = (
        db.query(LearningGap)
        .filter(
            LearningGap.student_id == student.id,
            LearningGap.topic == question.topic,
        )
        .first()
    )

    if gap:
        # Update confidence: correct → +0.1, wrong → −0.15, clamp 0–1
        delta = 0.10 if is_correct else -0.15
        gap.confidence_score = max(0.0, min(1.0, gap.confidence_score + delta))
    else:
        gap = LearningGap(
            student_id=student.id,
            topic=question.topic,
            confidence_score=0.6 if is_correct else 0.35,
        )
        db.add(gap)

    db.flush()

    # Update severity based on new confidence score
    if gap.confidence_score < 0.4:
        gap.severity = SeverityEnum.high
    elif gap.confidence_score < 0.7:
        gap.severity = SeverityEnum.medium
    else:
        gap.severity = SeverityEnum.low

    db.commit()

    return {
        "correct": is_correct,
        "correct_answer": question.correct_answer,
        "explanation": question.explanation or "No explanation available.",
        "topic": question.topic,
        "updated_confidence": round(gap.confidence_score, 4),
    }
