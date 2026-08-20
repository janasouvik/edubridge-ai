from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.auth import require_student
from db.db import get_db
from models.models import User, Student
from services.materials import generate_study_materials

router = APIRouter(prefix="/api/v1/materials", tags=["Materials"])

@router.get("/")
def api_get_materials(
    level: str = "school",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Generate dynamic study materials based on the student's grade/stream and requested level.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    try:
        materials = generate_study_materials(student, level)
        return materials
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
