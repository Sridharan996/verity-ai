from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.database import db_manager
from app.schemas.document import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Backend & Database Health Probe")
def get_health() -> HealthResponse:
    """
    Check backend operational status and verify real MongoDB connectivity.
    Will NOT report database as connected unless a live ping command succeeds.
    """
    is_connected, db_message = db_manager.check_connection()

    status_str = "healthy" if is_connected else "degraded"

    return HealthResponse(
        status=status_str,
        database_connected=is_connected,
        database_message=db_message,
        timestamp=datetime.now(timezone.utc),
        version="1.0.0",
    )
