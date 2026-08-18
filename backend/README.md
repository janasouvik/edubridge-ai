# EduBridge AI — Backend

An AI-powered education platform backend built with **FastAPI**, **PostgreSQL**, and **Gemini AI**.

## Features

| Feature | Endpoint |
|---|---|
| JWT Authentication | `POST /api/v1/auth/register`, `/login`, `/me` |
| Grounded Doubt Solver (RAG) | `POST /api/v1/doubts` |
| Adaptive Practice Generator | `GET /api/v1/practice/next`, `POST /api/v1/practice/submit` |
| Teacher Insight Agent | `GET /api/v1/teacher/insights` |
| Scholarship Eligibility Matcher | `GET /api/v1/scholarships/matches` |

## Tech Stack

- Python 3.11+ · FastAPI · Uvicorn
- PostgreSQL 14+ · SQLAlchemy 2.x · Alembic
- Pydantic v2 · python-jose · passlib/bcrypt
- Google Gemini API (LLM + Embeddings)
- In-memory cosine similarity RAG (pgvector-ready)

## Project Structure

```
backend/
├── main.py               ← FastAPI app, CORS, router registration
├── config.py             ← Settings from .env (pydantic-settings)
├── auth.py               ← JWT + password utilities + role dependencies
├── seed.py               ← DB seed: scholarships + study materials
│
├── db/
│   └── db.py             ← SQLAlchemy engine, SessionLocal, get_db
│
├── models/
│   └── models.py         ← All ORM models (User, Student, Teacher, ...)
│
├── ai/
│   ├── llm.py            ← generate_text(prompt) via Gemini
│   ├── embeddings.py     ← generate_embedding() / generate_query_embedding()
│   └── rag.py            ← retrieve_context() cosine similarity search
│
├── routes/
│   ├── auth.py           ← /api/v1/auth/*
│   ├── doubts.py         ← /api/v1/doubts
│   ├── practice.py       ← /api/v1/practice/*
│   ├── teacher.py        ← /api/v1/teacher/*
│   └── scholarships.py   ← /api/v1/scholarships/*
│
├── services/
│   ├── doubt_solver.py        ← RAG → LLM → grounded answer
│   ├── adaptive_practice.py   ← gap analysis, question gen, answer eval
│   ├── teacher_insight.py     ← rule-based analytics + LLM recommendations
│   └── scholarship_matcher.py ← deterministic eligibility scoring
│
├── alembic/              ← Migration scripts
├── alembic.ini
├── requirements.txt
├── .env                  ← NOT committed (see .env.example)
└── .env.example
```

## Setup

### 1. Prerequisites

- Python 3.11+
- PostgreSQL 14+ running locally
- A Gemini API key

### 2. Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Database setup

```bash
# Create DB
psql -U postgres -c "CREATE DATABASE edubridge;"

# Run migrations
alembic upgrade head

# Seed scholarships + study materials + embeddings
python3 seed.py
```

### 5. Run the server

```bash
uvicorn main:app --reload
```

Open **http://localhost:8000/docs** for Swagger UI.

## API Overview

### Authentication

```bash
# Register a student
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Arjun","email":"arjun@test.com","password":"pass123","role":"student","grade":"10","preferred_language":"Bengali"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@test.com","password":"pass123"}'
```

### Doubt Solver

```bash
curl -X POST http://localhost:8000/api/v1/doubts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is photosynthesis?","language":"Bengali","subject":"Biology","topic":"Photosynthesis"}'
```

### Adaptive Practice

```bash
# Get next question
curl -X GET http://localhost:8000/api/v1/practice/next \
  -H "Authorization: Bearer <token>"

# Submit answer
curl -X POST http://localhost:8000/api/v1/practice/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"question_id":1,"answer":"1"}'
```

### Teacher Insights (teacher JWT required)

```bash
curl -X GET http://localhost:8000/api/v1/teacher/insights \
  -H "Authorization: Bearer <teacher_token>"
```

### Scholarship Matching

```bash
curl -X GET http://localhost:8000/api/v1/scholarships/matches \
  -H "Authorization: Bearer <token>"
```

## Security

- Passwords hashed with bcrypt — never stored in plain text
- JWT tokens with configurable expiry
- Role-based access: students cannot access teacher endpoints and vice versa
- All secrets in `.env`, never in source code
- Input validation via Pydantic

## Upgrading to pgvector

When pgvector is available:

1. `CREATE EXTENSION vector;` in PostgreSQL
2. Change `DocumentChunk.embedding` from `Text` to `Vector(768)` in `models/models.py`
3. Update `rag.py` to use `<=>` cosine distance SQL operator
4. Run `alembic revision --autogenerate -m "add_pgvector"` and `alembic upgrade head`
