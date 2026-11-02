import os
import sys
from pathlib import Path
import mongomock
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.core.config import settings
from app.core.database import db_manager
from app.main import app


@pytest.fixture(autouse=True)
def setup_test_environment(tmp_path, monkeypatch):
    """
    Automated test fixture that:
    1. Points settings.UPLOAD_DIR to a clean temporary directory.
    2. Injects an in-memory mongomock database.
    3. Cleans up upon completion.
    """
    # 1. Isolate uploads directory
    temp_uploads = tmp_path / "test_uploads"
    temp_uploads.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(temp_uploads))

    # 2. Inject mongomock client & database
    mock_client = mongomock.MongoClient()
    mock_db = mock_client["verity_ai_test"]
    db_manager.set_mock_db(mock_db, mock_client)

    yield {
        "client": mock_client,
        "db": mock_db,
        "upload_dir": temp_uploads,
    }

    # 3. Teardown
    db_manager.reset_mock()


@pytest.fixture
def client():
    """FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def valid_pdf_bytes() -> bytes:
    """Minimal valid PDF byte sequence with header and EOF trailer."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
    )
