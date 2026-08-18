from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.auth import require_student
from db.db import get_db
from models.models import User, Student
from services.scholarship_matcher import match_scholarships

router = APIRouter(prefix="/api/v1/scholarships", tags=["Scholarships"])


@router.get("/matches")
def get_matches(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Return scholarship matches for the authenticated student."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return match_scholarships(student=student, db=db)
