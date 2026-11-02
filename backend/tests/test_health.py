import pytest
from app.core.database import db_manager


def test_health_when_database_is_connected(client):
    """
    Verify GET /api/health returns healthy and database_connected=True
    when database is connected.
    """
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "MongoDB" in data["database_message"] or "verified" in data["database_message"]
    assert "timestamp" in data
    assert data["version"] == "1.0.0"


def test_health_when_database_is_down(client, monkeypatch):
    """
    Verify GET /api/health accurately reports degraded status and
    database_connected=False when MongoDB ping fails.
    Does NOT report connected unless a real connection succeeds.
    """
    # Simulate database connection failure
    monkeypatch.setattr(
        db_manager,
        "check_connection",
        lambda: (False, "ServerSelectionTimeoutError: No servers found"),
    )

    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "degraded"
    assert data["database_connected"] is False
    assert "ServerSelectionTimeoutError" in data["database_message"]
