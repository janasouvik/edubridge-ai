"""
Teacher Insight Service.

Uses rule-based analysis on student attempt data to identify
struggling students, then uses LLM to generate human-readable recommendations.
"""
from datetime import datetime, timedelta
from collections import defaultdict

from sqlalchemy.orm import Session

from ai.llm import generate_text
from models.models import Student, User, Attempt, LearningGap


def _student_accuracy(student_id: int, db: Session) -> float:
    """Overall accuracy for a student."""
    attempts = db.query(Attempt).filter(Attempt.student_id == student_id).all()
    if not attempts:
        return 0.0
    return sum(1 for a in attempts if a.is_correct) / len(attempts) * 100


def _risk_level(accuracy: float) -> str:
    """PRD rule: accuracy < 40 → high, 40–60 → medium, >60 → low."""
    if accuracy < 40:
        return "high"
    elif accuracy < 60:
        return "medium"
    else:
        return "low"


def _weak_topics(student_id: int, db: Session, limit: int = 3) -> list[str]:
    """Return topics with the lowest confidence scores."""
    gaps = (
        db.query(LearningGap)
        .filter(LearningGap.student_id == student_id)
        .order_by(LearningGap.confidence_score.asc())
        .limit(limit)
        .all()
    )
    return [g.topic for g in gaps]


def _generate_recommendation(student_name: str, accuracy: float, weak_topics: list[str]) -> str:
    if not weak_topics:
        prompt = (
            f"Student {student_name} has an accuracy of {accuracy:.1f}%. "
            f"Write a short encouraging teacher recommendation (2 sentences)."
        )
    else:
        topics_str = ", ".join(weak_topics)
        prompt = (
            f"Student {student_name} is struggling with: {topics_str}. "
            f"Accuracy: {accuracy:.1f}%. "
            f"Write a short actionable teacher recommendation (2 sentences max)."
        )
    try:
        return generate_text(prompt)
    except Exception:
        return f"Student needs attention in: {', '.join(weak_topics) or 'general topics'}."


def get_teacher_insights(db: Session) -> dict:
    """
    Analyze all students and return class summary + flagged students.
    """
    all_students = db.query(Student).all()
    total = len(all_students)

    flagged = []
    accuracy_list = []

    for student in all_students:
        acc = _student_accuracy(student.id, db)
        accuracy_list.append(acc)
        risk = _risk_level(acc)

        if risk in ("high", "medium"):
            weak = _weak_topics(student.id, db)
            reason = "Low accuracy and repeated mistakes" if risk == "high" else "Moderate accuracy, needs improvement"
            rec = _generate_recommendation(student.user.name if student.user else "Unknown", acc, weak)
            flagged.append(
                {
                    "student_id": student.id,
                    "student_name": student.user.name if student.user else "Unknown",
                    "risk_level": risk,
                    "accuracy": round(acc, 1),
                    "weak_topics": weak,
                    "reason": reason,
                    "recommendation": rec,
                }
            )

    # Sort flagged: high risk first
    flagged.sort(key=lambda x: (0 if x["risk_level"] == "high" else 1, -x["accuracy"]))

    avg_accuracy = (sum(accuracy_list) / len(accuracy_list)) if accuracy_list else 0.0
    needing_attention = len([s for s in flagged if s["risk_level"] == "high"])

    return {
        "class_summary": {
            "total_students": total,
            "students_needing_attention": needing_attention,
            "average_accuracy": round(avg_accuracy, 1),
        },
        "flagged_students": flagged,
    }
