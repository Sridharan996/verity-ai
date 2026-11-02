import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import db_manager, ensure_indexes
from app.routes.documents import router as documents_router
from app.routes.health import router as health_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("verity-ai-backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle management.
    Initializes upload directory and establishes MongoDB connection.
    Gracefully handles database unavailability without preventing application startup.
    """
    logger.info("Initializing %s...", settings.PROJECT_NAME)

    # 1. Ensure storage directory exists
    try:
        settings.resolved_upload_dir.mkdir(parents=True, exist_ok=True)
        logger.info("Upload storage directory verified at %s", settings.resolved_upload_dir)
    except Exception as exc:
        logger.critical("Failed to create upload storage directory: %s", exc)

    # 2. Initialize database connection
    db_manager.connect()
    is_connected, msg = db_manager.check_connection()
    if is_connected:
        db = db_manager.get_database()
        if db is not None:
            ensure_indexes(db)
            # Reconcile interrupted jobs from prior process terminations
            interrupted = db["documents"].update_many(
                {"processing_status": "processing"},
                {
                    "$set": {
                        "processing_status": "failed",
                        "processing_error": "Interrupted: Background process terminated or restarted before completion. Manual reprocess available.",
                        "processing_completed_at": datetime.now(timezone.utc),
                    }
                },
            )
            if interrupted.modified_count > 0:
                logger.warning(
                    "Reconciled %d orphaned document(s) left in 'processing' state from prior server session.",
                    interrupted.modified_count,
                )
        logger.info("MongoDB connection established: %s", msg)
    else:
        logger.warning(
            "MongoDB is currently offline or unreachable (%s). "
            "Backend started in degraded mode. Endpoints requiring database will return HTTP 503.",
            msg,
        )

    yield

    # Cleanup upon shutdown
    logger.info("Shutting down %s...", settings.PROJECT_NAME)
    db_manager.disconnect()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sovereign AICTE Statutory Document Validation & Hashing Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration allowing React frontend interaction (local & production Vercel)
cors_origins_raw = getattr(settings, "CORS_ORIGINS", "*").strip()
if cors_origins_raw == "*" or not cors_origins_raw:
    origins = ["*"]
    allow_credentials = False
else:
    origins = [orig.strip() for orig in cors_origins_raw.split(",") if orig.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
def root():
    """Root endpoint providing service identification and API documentation link."""
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": f"{settings.API_PREFIX}/health",
    }


# Include modular routers under API prefix (/api)
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(documents_router, prefix=settings.API_PREFIX)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
