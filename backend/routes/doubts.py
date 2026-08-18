from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.auth import require_student
from db.db import get_db
from models.models import User, Student
from services.doubt_solver import solve_doubt

router = APIRouter(prefix="/api/v1/doubts", tags=["Doubt Solver"])


class DoubtRequest(BaseModel):
    question: str
    language: str = "English"
    subject: str = "General"
    topic: str = "General"


@router.post("")
def ask_doubt(
    payload: DoubtRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Respect student's preferred language if not explicitly provided
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    language = payload.language
    if language == "English" and student and student.preferred_language:
        language = student.preferred_language

    result = solve_doubt(
        question=payload.question,
        language=language,
        subject=payload.subject,
        topic=payload.topic,
        db=db,
    )
    return result
