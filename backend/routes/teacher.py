from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth import require_teacher
from db.db import get_db
from models.models import User
from services.teacher_insight import get_teacher_insights

router = APIRouter(prefix="/api/v1/teacher", tags=["Teacher Insights"])


@router.get("/insights")
def insights(
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Return class-wide analytics and flagged students. Teacher only."""
    return get_teacher_insights(db=db)
