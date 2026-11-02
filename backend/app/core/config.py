import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False
    PROJECT_NAME: str = "VERITY AI Platform Backend"
    API_PREFIX: str = "/api"

    # MongoDB connection
    MONGODB_URI: Optional[str] = None  # Takes precedence if set (e.g. MongoDB Atlas)
    MONGODB_URL: str = "mongodb://127.0.0.1:27017"  # Default local connection
    DATABASE_NAME: str = "verity_ai"
    MONGODB_TIMEOUT_MS: int = 2000

    @property
    def effective_mongodb_uri(self) -> str:
        """Returns MONGODB_URI if defined and non-empty, otherwise MONGODB_URL."""
        if self.MONGODB_URI and self.MONGODB_URI.strip():
            return self.MONGODB_URI.strip()
        return self.MONGODB_URL.strip()

    # File storage configuration
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB default
    ALLOWED_EXTENSIONS: List[str] = [".pdf"]
    ALLOWED_MIME_TYPES: List[str] = ["application/pdf"]

    # CORS configuration (comma-separated origins or * for all)
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def resolved_upload_dir(self) -> Path:
        """Returns resolved absolute Path to upload directory."""
        upload_path = Path(self.UPLOAD_DIR)
        if not upload_path.is_absolute():
            backend_root = Path(__file__).resolve().parent.parent.parent
            upload_path = (backend_root / upload_path).resolve()
        return upload_path


settings = Settings()
