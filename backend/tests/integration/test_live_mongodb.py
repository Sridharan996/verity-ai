import io
import os
import sys
from pathlib import Path
import pytest
from pymongo import MongoClient
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.core.config import settings
from app.core.database import DatabaseManager, ensure_indexes
from app.services.document_service import DocumentService
from app.main import app


def check_live_mongodb_connection() -> bool:
    """Probes if a live MongoDB instance is currently reachable."""
    try:
        client = MongoClient(
            settings.effective_mongodb_uri,
            serverSelectionTimeoutMS=1500,
            connectTimeoutMS=1500,
        )
        client.admin.command("ping")
        client.close()
        return True
    except Exception:
        return False


LIVE_MONGO_AVAILABLE = check_live_mongodb_connection()
pytestmark = pytest.mark.skipif(
    not LIVE_MONGO_AVAILABLE,
    reason=(
        f"Live MongoDB is not reachable at '{settings.effective_mongodb_uri}'. "
        "Integration tests require a running local MongoDB daemon or valid MONGODB_URI."
    ),
)


@pytest.fixture
def live_db_setup(tmp_path, monkeypatch):
    """
    Integration fixture connected to REAL MongoDB.
    Uses 'verity_ai_integration_test' database and cleans up after tests.
    """
    # 1. Isolate temporary uploads directory
    temp_uploads = tmp_path / "live_test_uploads"
    temp_uploads.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(temp_uploads))

    # 2. Use real database with test name
    test_db_name = "verity_ai_integration_test"
    monkeypatch.setattr(settings, "DATABASE_NAME", test_db_name)

    real_manager = DatabaseManager()
    real_manager.connect()
    real_db = real_manager.get_database()
    assert real_db is not None, "Failed to connect to live MongoDB during integration fixture setup"

    # Ensure indexes on real database
    ensure_indexes(real_db)

    # Clean collection before test
    real_db["documents"].delete_many({})

    yield {
        "manager": real_manager,
        "db": real_db,
        "upload_dir": temp_uploads,
    }

    # Teardown: Clean test documents and disconnect
    try:
        real_db["documents"].delete_many({})
    except Exception:
        pass
    real_manager.disconnect()


@pytest.fixture
def test_pdf_payload() -> bytes:
    """Minimal valid PDF byte sequence."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"trailer<</Size 4/Root 1 0 R>>\n%%EOF\n"
    )


def test_live_mongodb_ping(live_db_setup):
    """Test 1: Verify real MongoDB connection and live ping execution."""
    manager = live_db_setup["manager"]
    is_connected, message = manager.check_connection()
    assert is_connected is True
    assert "MongoDB connection active and verified" in message


def test_live_mongodb_indexes(live_db_setup):
    """Test 2: Verify appropriate indexes exist on live MongoDB collection."""
    db = live_db_setup["db"]
    collection = db["documents"]
    indexes = collection.index_information()

    # Verify unique index on document_id
    assert "idx_document_id_unique" in indexes
    assert indexes["idx_document_id_unique"]["unique"] is True

    # Verify compound index on application_id and sha256_hash
    assert "idx_app_sha256" in indexes
    key_fields = indexes["idx_app_sha256"]["key"]
    assert ("application_id", 1) in key_fields
    assert ("sha256_hash", 1) in key_fields

    # Verify chronological query index
    assert "idx_app_timestamp" in indexes


def test_live_mongodb_persistence_and_retrieval(live_db_setup, test_pdf_payload):
    """
    Test 3: Upload document and verify persistent database record in real MongoDB.
    Retrieves document by ID from live database and verifies all fields.
    """
    db = live_db_setup["db"]

    saved_doc = DocumentService.process_and_save_document(
        db=db,
        content=test_pdf_payload,
        original_filename="live_land_deed.pdf",
        institution_id="INST-LIVE-001",
        application_id="APP-LIVE-2026-01",
        document_category="land_deed",
        mime_type="application/pdf",
    )

    # Query directly from real MongoDB
    record_in_mongo = db["documents"].find_one({"document_id": saved_doc.document_id})
    assert record_in_mongo is not None
    assert record_in_mongo["institution_id"] == "INST-LIVE-001"
    assert record_in_mongo["application_id"] == "APP-LIVE-2026-01"
    assert record_in_mongo["sha256_hash"] == saved_doc.sha256_hash
    assert record_in_mongo["processing_status"] == "uploaded"

    # Query via service
    retrieved = DocumentService.get_document_by_id(db=db, document_id=saved_doc.document_id)
    assert retrieved.document_id == saved_doc.document_id
    assert retrieved.sha256_hash == saved_doc.sha256_hash


def test_live_mongodb_persistence_across_backend_restart(live_db_setup, test_pdf_payload):
    """
    Test 4: Verify document remains retrievable in real MongoDB after restarting backend.
    Simulates complete server shutdown and restart.
    """
    manager = live_db_setup["manager"]
    db = live_db_setup["db"]

    # 1. Save document in live MongoDB
    saved_doc = DocumentService.process_and_save_document(
        db=db,
        content=test_pdf_payload,
        original_filename="retained_safety_noc.pdf",
        institution_id="INST-RESTART-002",
        application_id="APP-RESTART-2026-02",
        document_category="building_safety",
        mime_type="application/pdf",
    )
    doc_id = saved_doc.document_id

    # 2. Simulate Backend Shutdown: Close client connection
    manager.disconnect()
    assert manager._client is None
    assert manager._db is None

    # 3. Simulate Backend Restart: Reinitialize connection to live MongoDB
    new_manager = DatabaseManager()
    new_manager.connect()
    new_db = new_manager.get_database()
    assert new_db is not None

    # 4. Verify document is intact and retrieved successfully after restart
    post_restart_doc = DocumentService.get_document_by_id(db=new_db, document_id=doc_id)
    assert post_restart_doc.document_id == doc_id
    assert post_restart_doc.application_id == "APP-RESTART-2026-02"
    assert post_restart_doc.institution_id == "INST-RESTART-002"
    assert post_restart_doc.processing_status == "uploaded"

    new_manager.disconnect()


def test_live_mongodb_duplicate_prevention(live_db_setup, test_pdf_payload):
    """
    Test 5: Verify duplicate file hash upload is blocked with HTTP 409 Conflict
    against real MongoDB database.
    """
    db = live_db_setup["db"]

    # Initial upload
    DocumentService.process_and_save_document(
        db=db,
        content=test_pdf_payload,
        original_filename="first_copy.pdf",
        institution_id="INST-DUP-003",
        application_id="APP-DUP-2026-03",
        document_category="fire_noc",
        mime_type="application/pdf",
    )

    # Attempt duplicate upload with same content and same application_id
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        DocumentService.process_and_save_document(
            db=db,
            content=test_pdf_payload,
            original_filename="duplicate_copy.pdf",
            institution_id="INST-DUP-003",
            application_id="APP-DUP-2026-03",
            document_category="fire_noc",
            mime_type="application/pdf",
        )

    assert exc_info.value.status_code == 409
    assert "Duplicate document detected" in exc_info.value.detail
