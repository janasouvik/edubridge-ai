"""
Contest API routes — /api/v1/contests
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.auth import require_student
from db.db import get_db
from models.models import User, Student
from services.contest import (
    list_contests,
    get_contest_detail,
    submit_contest,
    get_my_rating,
    get_leaderboard,
)

router = APIRouter(prefix="/api/v1/contests", tags=["Contests"])


# ------------------------------------------------------------------ #
# Schemas
# ------------------------------------------------------------------ #

class SubmitContestRequest(BaseModel):
    """Map of question_id (as string) → selected option letter (A/B/C/D)."""
    answers: dict[str, str]


# ------------------------------------------------------------------ #
# Endpoints
# ------------------------------------------------------------------ #

@router.get("/")
def api_list_contests(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    status: Optional[str] = Query(None, description="Filter by status (upcoming, live, completed)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    # Determine the user's grade and stream to fetch targeted contests
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    target_grade = student.grade if student else None
    target_stream = student.learning_level if student else None
    
    
    contests = list_contests(
        db=db, 
        domain=domain, 
        contest_status=status,
        target_grade=target_grade,
        target_stream=target_stream
    )
    
    # Generate on the fly if none exist for this specific student's cohort
    if not contests and target_grade and target_stream:
        from services.contest_generator import generate_and_save_contest
        try:
            new_contest = generate_and_save_contest(db, target_grade, target_stream)
            contests = [new_contest]
        except Exception as e:
            print(f"Error auto-generating contest: {e}")
            
    return contests


@router.get("/rating/me")
def api_my_rating(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Current rating, rank, total participants, and recent change."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return get_my_rating(db=db, student_id=student.id)


@router.get("/leaderboard")
def api_leaderboard(
    domain: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_student),
):
    """Ranked student list by current rating."""
    return get_leaderboard(db=db, domain=domain, limit=limit)


@router.get("/{contest_id}")
def api_contest_detail(
    contest_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_student),
):
    """Contest details + questions (**without** correct answers)."""
    return get_contest_detail(db=db, contest_id=contest_id)


@router.post("/{contest_id}/submit")
def api_submit_contest(
    contest_id: int,
    payload: SubmitContestRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Submit answers for a contest.
    Validates timing, scores, updates Elo, returns review with explanations.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return submit_contest(
        db=db,
        contest_id=contest_id,
        student_id=student.id,
        answers=payload.answers,
    )
