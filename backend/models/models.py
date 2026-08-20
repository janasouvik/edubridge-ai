import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, Enum as SAEnum, Date, JSON
)
from sqlalchemy.orm import relationship
from db.db import Base


# --------------------------------------------------------------------------- #
# Enums
# --------------------------------------------------------------------------- #

class RoleEnum(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class DifficultyEnum(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ContestStatusEnum(str, enum.Enum):
    upcoming = "upcoming"
    live = "live"
    completed = "completed"


# --------------------------------------------------------------------------- #
# User
# --------------------------------------------------------------------------- #

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(RoleEnum), nullable=False, default=RoleEnum.student)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="user", uselist=False)
    teacher = relationship("Teacher", back_populates="user", uselist=False)


# --------------------------------------------------------------------------- #
# Student
# --------------------------------------------------------------------------- #

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    grade = Column(String(50), nullable=True)
    preferred_language = Column(String(100), default="English")
    learning_level = Column(String(50), default="beginner")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student")
    attempts = relationship("Attempt", back_populates="student")
    learning_gaps = relationship("LearningGap", back_populates="student")


# --------------------------------------------------------------------------- #
# Teacher
# --------------------------------------------------------------------------- #

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="teacher")


# --------------------------------------------------------------------------- #
# Question
# --------------------------------------------------------------------------- #

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    difficulty = Column(SAEnum(DifficultyEnum), nullable=False, default=DifficultyEnum.medium)
    question_text = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("Attempt", back_populates="question")


# --------------------------------------------------------------------------- #
# Attempt
# --------------------------------------------------------------------------- #

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")


# --------------------------------------------------------------------------- #
# LearningGap
# --------------------------------------------------------------------------- #

class LearningGap(Base):
    __tablename__ = "learning_gaps"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(255), nullable=False)
    confidence_score = Column(Float, default=0.5)
    severity = Column(SAEnum(SeverityEnum), default=SeverityEnum.medium)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="learning_gaps")


# --------------------------------------------------------------------------- #
# StudyMaterial
# --------------------------------------------------------------------------- #

class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    source_name = Column(String(255), nullable=False)
    source_url = Column(Text, nullable=True)
    subject = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    chapter = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="study_material")


# --------------------------------------------------------------------------- #
# DocumentChunk  (pgvector-ready; embedding stored as JSON text for now)
# --------------------------------------------------------------------------- #

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    study_material_id = Column(Integer, ForeignKey("study_materials.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    # Stored as JSON string — e.g. "[0.12, 0.34, ...]"
    # Replace with pgvector Vector column when extension is available.
    embedding = Column(Text, nullable=True)

    study_material = relationship("StudyMaterial", back_populates="chunks")


# --------------------------------------------------------------------------- #
# Scholarship
# --------------------------------------------------------------------------- #

class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    provider = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    eligibility = Column(Text, nullable=True)
    income_limit = Column(Float, nullable=True)       # in INR/year
    minimum_grade = Column(String(50), nullable=True) # e.g. "10", "12"
    category = Column(String(255), nullable=True)     # e.g. "SC", "ST", "OBC", "General"
    state = Column(String(255), nullable=True)        # state-specific or "All"
    deadline = Column(Date, nullable=True)
    application_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# --------------------------------------------------------------------------- #
# Contest
# --------------------------------------------------------------------------- #

class Contest(Base):
    __tablename__ = "contests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    domain = Column(String(255), nullable=False)
    target_grade = Column(String(50), nullable=False, default="10")
    target_stream = Column(String(255), nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=30)
    status = Column(
        SAEnum(ContestStatusEnum),
        nullable=False,
        default=ContestStatusEnum.upcoming,
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("ContestQuestion", back_populates="contest", order_by="ContestQuestion.position")
    participations = relationship("ContestParticipation", back_populates="contest")


# --------------------------------------------------------------------------- #
# ContestQuestion
# --------------------------------------------------------------------------- #

class ContestQuestion(Base):
    __tablename__ = "contest_questions"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, nullable=False, default=0)
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)  # 'A', 'B', 'C', or 'D'
    explanation = Column(Text, nullable=True)

    contest = relationship("Contest", back_populates="questions")


# --------------------------------------------------------------------------- #
# ContestParticipation
# --------------------------------------------------------------------------- #

class ContestParticipation(Base):
    __tablename__ = "contest_participations"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    answers = Column(JSON, nullable=True)         # {question_id: "A"|"B"|"C"|"D"}
    score = Column(Integer, nullable=False, default=0)
    total_questions = Column(Integer, nullable=False, default=0)
    rating_change = Column(Integer, nullable=False, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    contest = relationship("Contest", back_populates="participations")
    student = relationship("Student")


# --------------------------------------------------------------------------- #
# StudentRating
# --------------------------------------------------------------------------- #

class StudentRating(Base):
    __tablename__ = "student_ratings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_rating = Column(Integer, nullable=False, default=1200)
    highest_rating = Column(Integer, nullable=False, default=1200)
    contests_played = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student")


# --------------------------------------------------------------------------- #
# PracticeSession
# --------------------------------------------------------------------------- #

class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    score = Column(Integer, nullable=False, default=0)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student")
    questions = relationship("PracticeMCQ", back_populates="session", order_by="PracticeMCQ.position")


# --------------------------------------------------------------------------- #
# PracticeMCQ
# --------------------------------------------------------------------------- #

class PracticeMCQ(Base):
    __tablename__ = "practice_mcqs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("practice_sessions.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, nullable=False, default=0)
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)  # 'A', 'B', 'C', or 'D'
    explanation = Column(Text, nullable=True)
    
    # Store student answer for this MCQ
    student_answer = Column(String(1), nullable=True)

    session = relationship("PracticeSession", back_populates="questions")
