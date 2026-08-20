from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routes import auth, doubts, practice, teacher, scholarships, contests

app = FastAPI(
    title="EduBridge AI Backend",
    description="AI-powered education platform API — Grounded Doubt Solver, Adaptive Practice, Teacher Insights, Scholarship Matcher",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ------------------------------------------------------------------ #
# CORS
# ------------------------------------------------------------------ #
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------ #
# Routers
# ------------------------------------------------------------------ #
app.include_router(auth.router)
app.include_router(doubts.router)
app.include_router(practice.router)
app.include_router(teacher.router)
app.include_router(scholarships.router)
app.include_router(contests.router)


# ------------------------------------------------------------------ #
# Health check
# ------------------------------------------------------------------ #
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
