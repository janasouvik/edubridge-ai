"""
Contest service — scoring, Elo rating, and leaderboard logic.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from models.models import (
    Contest, ContestQuestion, ContestParticipation,
    StudentRating, Student, ContestStatusEnum,
)


# --------------------------------------------------------------------------- #
# Rating-change rules
# --------------------------------------------------------------------------- #

def _calculate_rating_change(score: int, total: int) -> int:
    """
    Determine rating delta based on percentage correct.
    ≥80 % → +25 to +35  (scaled linearly inside that band)
    60-79% → +10
    40-59% → 0
    <40 %  → -10
    """
    if total == 0:
        return 0
    pct = (score / total) * 100

    if pct >= 80:
        # linearly scale between +25 (at 80%) and +35 (at 100%)
        return 25 + round((pct - 80) / 20 * 10)
    elif pct >= 60:
        return 10
    elif pct >= 40:
        return 0
    else:
        return -10


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _get_or_create_rating(db: Session, student_id: int) -> StudentRating:
    """Return the StudentRating row, creating one at 1200 if it doesn't exist."""
    rating = db.query(StudentRating).filter(StudentRating.student_id == student_id).first()
    if not rating:
        rating = StudentRating(student_id=student_id, current_rating=1200, highest_rating=1200)
        db.add(rating)
        db.flush()
    return rating


def _participant_count(db: Session, contest_id: int) -> int:
    return (
        db.query(func.count(ContestParticipation.id))
        .filter(ContestParticipation.contest_id == contest_id)
        .scalar() or 0
    )


# --------------------------------------------------------------------------- #
# Public service functions
# --------------------------------------------------------------------------- #

def list_contests(
    db: Session,
    domain: Optional[str] = None,
    contest_status: Optional[str] = None,
    target_grade: Optional[str] = None,
    target_stream: Optional[str] = None,
) -> list[dict]:
    """Return all contests with participant counts, optionally filtered."""
    q = db.query(Contest)
    if domain:
        q = q.filter(Contest.domain == domain)
    if contest_status:
        q = q.filter(Contest.status == ContestStatusEnum(contest_status))
    if target_grade:
        q = q.filter(Contest.target_grade == target_grade)
    if target_stream:
        q = q.filter(Contest.target_stream == target_stream)
    q = q.order_by(Contest.scheduled_at.desc())
    contests = q.all()

    result = []
    for c in contests:
        result.append({
            "id": c.id,
            "title": c.title,
            "domain": c.domain,
            "target_grade": c.target_grade,
            "target_stream": c.target_stream,
            "scheduled_at": c.scheduled_at.isoformat(),
            "duration_minutes": c.duration_minutes,
            "status": c.status.value,
            "participants": _participant_count(db, c.id),
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


def get_contest_detail(db: Session, contest_id: int) -> dict:
    """Return contest + questions, **without** correct answers."""
    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contest not found")

    questions = []
    for q in contest.questions:
        questions.append({
            "id": q.id,
            "position": q.position,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            # correct_option and explanation are intentionally omitted
        })

    return {
        "id": contest.id,
        "title": contest.title,
        "domain": contest.domain,
        "scheduled_at": contest.scheduled_at.isoformat(),
        "duration_minutes": contest.duration_minutes,
        "status": contest.status.value,
        "participants": _participant_count(db, contest.id),
        "questions": questions,
    }


def submit_contest(
    db: Session,
    contest_id: int,
    student_id: int,
    answers: dict[str, str],
) -> dict:
    """
    Validate timing, score answers, calculate Elo delta, persist results,
    and return a review payload.
    """
    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    # ---- time validation ----
    now = datetime.utcnow()
    end_time = contest.scheduled_at + timedelta(minutes=contest.duration_minutes)
    if now < contest.scheduled_at:
        raise HTTPException(status_code=400, detail="Contest has not started yet")
    # Allow a 2-minute grace window after official end
    if now > end_time + timedelta(minutes=2):
        raise HTTPException(status_code=400, detail="Contest submission window has closed")

    # ---- prevent double submission ----
    existing = (
        db.query(ContestParticipation)
        .filter(
            ContestParticipation.contest_id == contest_id,
            ContestParticipation.student_id == student_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already submitted this contest")

    # ---- score ----
    questions = db.query(ContestQuestion).filter(ContestQuestion.contest_id == contest_id).all()
    total = len(questions)
    correct = 0
    review: list[dict] = []

    for q in questions:
        student_answer = answers.get(str(q.id), "").upper()
        is_correct = student_answer == q.correct_option.upper()
        if is_correct:
            correct += 1
        review.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "your_answer": student_answer or None,
            "correct_answer": q.correct_option,
            "is_correct": is_correct,
            "explanation": q.explanation,
        })

    # ---- rating update ----
    delta = _calculate_rating_change(correct, total)
    rating = _get_or_create_rating(db, student_id)
    rating.current_rating += delta
    if rating.current_rating < 0:
        rating.current_rating = 0
    if rating.current_rating > rating.highest_rating:
        rating.highest_rating = rating.current_rating
    rating.contests_played += 1
    rating.updated_at = datetime.utcnow()

    # ---- persist participation ----
    participation = ContestParticipation(
        contest_id=contest_id,
        student_id=student_id,
        answers=answers,
        score=correct,
        total_questions=total,
        rating_change=delta,
    )
    db.add(participation)
    db.commit()

    return {
        "score": correct,
        "total": total,
        "percentage": round(correct / total * 100, 1) if total else 0,
        "rating_change": delta,
        "new_rating": rating.current_rating,
        "detailed_results": review,
    }


def get_my_rating(db: Session, student_id: int) -> dict:
    """Return the student's current rating, rank, total participants, and recent change."""
    rating = _get_or_create_rating(db, student_id)

    # Rank = number of students with a higher rating + 1
    higher_count = (
        db.query(func.count(StudentRating.id))
        .filter(StudentRating.current_rating > rating.current_rating)
        .scalar() or 0
    )
    total_participants = db.query(func.count(StudentRating.id)).scalar() or 0

    # Most recent rating change
    last_participation = (
        db.query(ContestParticipation)
        .filter(ContestParticipation.student_id == student_id)
        .order_by(ContestParticipation.submitted_at.desc())
        .first()
    )
    recent_change = last_participation.rating_change if last_participation else 0

    return {
        "current_rating": rating.current_rating,
        "highest_rating": rating.highest_rating,
        "contests_played": rating.contests_played,
        "rank": higher_count + 1,
        "total_participants": total_participants,
        "recent_change": recent_change,
    }


def get_leaderboard(
    db: Session,
    domain: Optional[str] = None,
    limit: int = 50,
) -> list[dict]:
    """Ranked list of students by current rating."""
    q = db.query(StudentRating).join(Student, Student.id == StudentRating.student_id)
    # Domain filtering would require filtering by contests in that domain;
    # for now, the leaderboard is global (all domains).
    q = q.order_by(desc(StudentRating.current_rating)).limit(limit)

    result = []
    for idx, sr in enumerate(q.all(), start=1):
        student = sr.student
        user = student.user
        result.append({
            "rank": idx,
            "student_id": student.id,
            "name": user.name,
            "current_rating": sr.current_rating,
            "highest_rating": sr.highest_rating,
            "contests_played": sr.contests_played,
        })
    return result
