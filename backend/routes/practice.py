from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.auth import require_student
from db.db import get_db
from models.models import User, Student
from services.adaptive_practice import generate_next_question, submit_answer

router = APIRouter(prefix="/api/v1/practice", tags=["Adaptive Practice"])


class SubmitAnswerRequest(BaseModel):
    question_id: int
    answer: str


@router.get("/next")
def next_question(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return generate_next_question(student=student, db=db)


@router.post("/submit")
def submit(
    payload: SubmitAnswerRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not payload.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return submit_answer(
        student=student,
        question_id=payload.question_id,
        answer=payload.answer,
        db=db,
    )
