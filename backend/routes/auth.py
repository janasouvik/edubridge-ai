from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from core.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user,
)
from core.config import settings
from db.db import get_db
from models.models import User, Student, Teacher, RoleEnum

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# ------------------------------------------------------------------ #
# Schemas
# ------------------------------------------------------------------ #

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"
    # Student-only optional fields
    grade: Optional[str] = None
    preferred_language: Optional[str] = "English"
    learning_level: Optional[str] = "beginner"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ------------------------------------------------------------------ #
# Endpoints
# ------------------------------------------------------------------ #

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Validate role
    try:
        role = RoleEnum(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Role must be student, teacher, or admin")

    # Check email uniqueness
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.flush()  # get user.id

    # Create role profile
    if role == RoleEnum.student:
        student = Student(
            user_id=user.id,
            grade=payload.grade,
            preferred_language=payload.preferred_language or "English",
            learning_level=payload.learning_level or "beginner",
        )
        db.add(student)
    elif role == RoleEnum.teacher:
        teacher = Teacher(user_id=user.id)
        db.add(teacher)

    db.commit()
    db.refresh(user)

    return {"message": "User registered successfully", "user_id": user.id}


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut(id=user.id, name=user.name, email=user.email, role=user.role.value),
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role.value,
    )
