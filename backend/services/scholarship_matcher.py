"""
Scholarship Matcher Service.

Uses deterministic eligibility rules to calculate a match score.
LLM is used only to generate human-readable eligibility reasons.
"""
from datetime import date
from sqlalchemy.orm import Session

from models.models import Student, User, Scholarship


def _calculate_match(student: Student, scholarship: Scholarship) -> tuple[int, list[str]]:
    """
    Returns (match_score 0–100, list of eligibility reason strings).
    Score is based on how many criteria the student satisfies.
    """
    score = 0
    max_score = 0
    reasons = []

    # Grade check
    if scholarship.minimum_grade:
        max_score += 30
        try:
            student_grade = int(student.grade) if student.grade else 0
            min_grade = int(scholarship.minimum_grade)
            if student_grade >= min_grade:
                score += 30
                reasons.append(f"Grade requirement satisfied (Grade {student_grade} ≥ {min_grade})")
            else:
                reasons.append(f"Grade requirement NOT met (Grade {student_grade} < {min_grade})")
        except (ValueError, TypeError):
            # If non-numeric grades, treat as satisfied
            score += 30
            reasons.append("Grade requirement assumed satisfied")
    else:
        score += 30
        max_score += 30
        reasons.append("No grade restriction")

    # Deadline check
    if scholarship.deadline:
        max_score += 20
        if scholarship.deadline >= date.today():
            score += 20
            reasons.append(f"Application deadline is open (until {scholarship.deadline})")
        else:
            reasons.append(f"Deadline has passed ({scholarship.deadline})")
    else:
        score += 20
        max_score += 20
        reasons.append("No deadline restriction")

    # State check (if "All" or matches student's state)
    if scholarship.state:
        max_score += 20
        if scholarship.state.lower() in ("all", "any", "national", "pan-india"):
            score += 20
            reasons.append("Open to all states")
        else:
            # We don't have student.state in the model (can be added later)
            # Treat as partial match
            score += 10
            reasons.append(f"State-specific scholarship ({scholarship.state}) — verify eligibility")
    else:
        score += 20
        max_score += 20
        reasons.append("No state restriction")

    # Category check (General = open to all)
    if scholarship.category:
        max_score += 30
        if scholarship.category.lower() in ("general", "all", "any", "open"):
            score += 30
            reasons.append("Open to all categories")
        else:
            score += 15
            reasons.append(f"Category-specific ({scholarship.category}) — verify your category")
    else:
        score += 30
        max_score += 30
        reasons.append("No category restriction")

    # Normalise to 100
    final_score = int((score / max_score) * 100) if max_score > 0 else 0
    return final_score, reasons


def match_scholarships(student: Student, db: Session) -> dict:
    """Return a list of scholarships the student may qualify for, with scores."""
    scholarships = db.query(Scholarship).all()

    matches = []
    for s in scholarships:
        score, reasons = _calculate_match(student, s)
        if score >= 50:  # Only return plausible matches
            matches.append(
                {
                    "scholarship_id": s.id,
                    "name": s.name,
                    "provider": s.provider,
                    "description": s.description,
                    "match_score": score,
                    "deadline": str(s.deadline) if s.deadline else None,
                    "application_url": s.application_url,
                    "eligibility_reasons": reasons,
                }
            )

    # Sort by match score descending
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return {"matches": matches}
