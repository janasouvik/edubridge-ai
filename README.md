# 🎓 EduBridge AI

EduBridge AI is an AI-powered, personalized educational platform designed to improve learning access through localized, grounded doubt-solving (multilingual RAG), adaptive practice generators, automated teacher insights, and a scholarship matching engine.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini_API-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📺 Live Demo / Preview

- **Live Demo Link**: *Coming Soon* (Deploying to cloud)
- **API Sandbox**: [http://localhost:8000/docs](http://localhost:8000/docs) (Interactive Swagger UI)

---

## 🎯 About the Project

### The Problem
Traditional classroom education often struggles to accommodate students' individual learning speeds, language preferences, and socioeconomic backgrounds. Quality curriculum study materials (like NCERT or Khan Academy) are widely available, but student support tools are often:
1. **Generic / Hallucination-Prone**: LLMs provide general answers without verifying factual curriculum context.
2. **Language Barriers**: High-quality study aids are heavily skewed towards English, ignoring regional language speakers.
3. **Information Silos**: Teachers lack automated dashboards identifying which student is falling behind and on what topics.
4. **Opportunity Gaps**: Economically weaker students struggle to discover and verify scholarship options that match their profiles.

### Our Solution
**EduBridge AI** connects students, teachers, and curriculum-guided AI together:
- **Grounded Doubt-Solving**: AI responses are bounded by authorized textbooks (NCERT, Khan Academy) stored in a vector database (`pgvector`), minimizing hallucination and ensuring curriculum alignment.
- **Multilingual Support**: Responses are translated into regional Indian languages (Hindi, Bengali, Kannada, Tamil, Telugu) dynamically.
- **Learning Loop Feedback**: Every doubt asked and question attempted updates a student's profile. An **Adaptive Practice** engine feeds the next best question to the student based on current gaps, while the **Teacher Insights** dashboard aggregates class statistics and flags at-risk students with AI recommendations.

---

## ✨ Features

- **🛡️ Grounded Doubt Solver (RAG)**
  - Natural language search over textbook corpus using text embeddings.
  - Bounded responses to prevent hallucinations.
  - Multi-source citation tracking (curriculum reference, chapter, and page references).
  - Dynamically switches to regional Indian languages based on user preference.
  
- **📈 Adaptive Practice Generator**
  - Serves custom questions matching student's current learning level.
  - Tracks correctness of attempts to update topic-specific confidence scores.
  - Dynamically changes question difficulty (`easy`, `medium`, `hard`) based on historic data.

- **👩‍🏫 Teacher-Facing Insight Agent**
  - Class-wide overview metrics (class average accuracy, total students, students needing attention).
  - Auto-flags at-risk students with custom severity classifications (`low`, `medium`, `high`).
  - Generates detailed, actionable diagnostic reports and educational recommendations for each flagged student.

- **💰 Scholarship/Eligibility Matcher**
  - Custom recommendation model matching student profile attributes (state, income limit, grade, category) against scholarship databases.
  - Computes suitability and match scores.
  - Direct links to external application portals.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS 4.x, React Router DOM v7
- **Backend**: FastAPI, SQLAlchemy 2.0 (ORM), Alembic (Migrations), Pydantic v2 (Validation)
- **Database**: PostgreSQL with `pgvector` extension for vector similarity searches
- **AI / LLM Integration**: Google Generative AI (Gemini API) for grounded explanation synthesis, translation, and recommendation generation
- **Authentication**: JWT (JSON Web Tokens) with secure password hashing via `passlib[bcrypt]`

---

## 📂 Project Structure

```text
EduBridge AI/
├── backend/               # FastAPI Backend Service
│   ├── ai/                # LLM connectors, embedding generators, and RAG pipelines
│   ├── alembic/           # Alembic database migration scripts & schemas
│   ├── core/              # Global configurations, security keys, logging
│   ├── db/                # SQLAlchemy database connection setup
│   ├── models/            # SQLAlchemy database schemas/entities
│   ├── routes/            # FastAPI controller endpoints (auth, doubts, practice, etc.)
│   ├── scripts/           # DB Seeding utilities
│   ├── services/          # Business logic layers
│   ├── .env.example       # Backend environment configuration template
│   ├── requirements.txt   # Backend dependency checklist
│   └── main.py            # API entrypoint
│
└── frontend/              # React Frontend Application
    ├── public/            # Static assets and icons
    ├── src/               # React source files
    │   ├── api/           # API interaction functions
    │   ├── assets/        # Visual components and UI graphics
    │   ├── components/    # Reusable structural elements (Sidebar, ProtectedRoute, etc.)
    │   ├── contexts/      # Context providers (AuthContext for user state)
    │   ├── pages/         # Page-level components
    │   ├── types/         # TypeScript type files
    │   ├── App.css
    │   ├── App.tsx
    │   ├── index.css      # Core styles & Tailwind directives
    │   └── main.tsx
    ├── eslint.config.js   # Linter configurations
    ├── package.json       # Project manifests
    ├── tsconfig.json      # TypeScript compiler instructions
    └── vite.config.ts     # Vite builder setup
```

---

## 🚀 Installation & Setup

### Prerequisites
Before setting up the project, make sure you have the following installed:
- **Node.js** (v18+)
- **Python** (v3.11+)
- **PostgreSQL** with **pgvector** installed:
  ```sql
  -- Enable vector search inside your PostgreSQL instance
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment & activate it**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install python packages**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Populate the environment variables inside `.env`:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `GEMINI_API_KEY`: Your Gemini API access key.
   - `SECRET_KEY`: Random cryptographic secret key for JWT signatures.

5. **Run Database Migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Seed Initial Database Content** (adds textbooks, questions, and mock scholarships):
   ```bash
   python3 scripts/seed.py
   ```

7. **Start the API Server**:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at [http://localhost:8000](http://localhost:8000).

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Setup Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Verify that `VITE_API_URL` points to your backend instance:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Install npm packages**:
   ```bash
   npm install
   ```

4. **Launch Vite Development Server**:
   ```bash
   npm run dev
   ```
   The application will run locally at [http://localhost:5173](http://localhost:5173).

---

## 📖 API Documentation

FastAPI automatically handles endpoint mapping and serves interactive Swagger documentation:

- **Swagger UI**: Visit [http://localhost:8000/docs](http://localhost:8000/docs) to test API endpoints in real-time.
- **ReDoc UI**: Alternate clean representation at [http://localhost:8000/redoc](http://localhost:8000/redoc).

### Key API Endpoint Categories
- `/api/v1/auth` - User registration, authentication, and session handling.
- `/api/v1/doubts` - Grounded multilingual RAG search and doubt-solving.
- `/api/v1/practice` - Next adaptive practice question retrieval and answer evaluation.
- `/api/v1/teacher` - Summarized class analytics and student risk flagging.
- `/api/v1/scholarships` - Target list computation matching user eligibility profiles.

---

## 🧠 Challenges & Technical Decisions

- **Hybrid Vector Setup**: We decoupled vector database interfaces from backend business processes so that database RAG searches degrade gracefully or utilize preloaded mock database contexts if `pgvector` configurations are absent in a developer's local instance.
- **Text Retrieval Translation Grounding**: Direct regional language translation by general models is sometimes low quality. To avoid this, our Doubt Solver retrieves factual context from original high-quality sources, presents it to the model, and requests it to synthesize the final answer grounded in the source text and translate it inline to the user's preferred Indian regional language.
- **Teacher Diagnostic Dashboard**: Aggregates historic attempt metrics dynamically across database tables (`attempts` -> `questions` -> `learning_gaps`) without bloating page loading.

---

## 🔮 Future Improvements

1. **🎙️ Speech Assistance**: Multilingual Speech-to-Text inputs and Text-to-Speech output support for students from visual or low-literacy backgrounds.
2. **📄 Text Ingestion Portal**: Direct portal allowing teachers to upload raw PDFs to construct custom localized vector contexts.
3. **📊 Visual Progress Dashboards**: Comprehensive analytics charts mapping class performance, average topic accuracy changes over time, and progression indexes.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🧑‍💻 Authors / Contact
- **Souvik Jana** - [@janasouvik](https://github.com/janasouvik)
- **Sayan Maji** - [@Sayanmaji0506](https://github.com/Sayanmaji0506)
- **Repository Link**: [https://github.com/janasouvik/edubridge-ai](https://github.com/janasouvik/edubridge-ai)
