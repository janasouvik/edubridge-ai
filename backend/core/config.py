from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    LLM_API_KEY: Optional[str] = None
    LLM_API_KEYS: Optional[str] = None
    LLM_MODEL: str = "gemini-3.6-flash"
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False
    )

    @model_validator(mode="after")
    def populate_api_keys(self):
        if not self.LLM_API_KEYS and self.LLM_API_KEY:
            self.LLM_API_KEYS = self.LLM_API_KEY
        elif not self.LLM_API_KEY and self.LLM_API_KEYS:
            self.LLM_API_KEY = self.LLM_API_KEYS.split(",")[0].strip()
        elif not self.LLM_API_KEY and not self.LLM_API_KEYS:
            self.LLM_API_KEYS = ""
            self.LLM_API_KEY = ""

        # Sanitize and auto-upgrade Gemini model identifiers
        if self.LLM_MODEL:
            cleaned = self.LLM_MODEL.strip().lower().replace(" ", "-")
            if cleaned.startswith("models/"):
                cleaned = cleaned[len("models/"):]
            deprecated = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash"]
            if cleaned in deprecated or not cleaned:
                self.LLM_MODEL = "gemini-3.6-flash"
            else:
                self.LLM_MODEL = cleaned
        else:
            self.LLM_MODEL = "gemini-3.6-flash"

        return self


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

