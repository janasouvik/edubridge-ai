from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.auth import require_student
from db.db import get_db
from models.models import User, Student
from services.adaptive_practice import generate_practice_session, submit_practice_session

router = APIRouter(prefix="/api/v1/practice", tags=["Adaptive Practice"])


class GenerateRequest(BaseModel):
    subject: str
    level: str = "school"  # "school" or "higher_ed"


class SubmitSessionRequest(BaseModel):
    answers: dict[int, str]


@router.post("/generate")
def generate_session(
    payload: GenerateRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    return generate_practice_session(
        subject=payload.subject,
        level=payload.level,
        student=student,
        db=db
    )


@router.post("/{session_id}/submit")
def submit_session(
    session_id: int,
    payload: SubmitSessionRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return submit_practice_session(
        session_id=session_id,
        answers=payload.answers,
        student=student,
        db=db,
    )
