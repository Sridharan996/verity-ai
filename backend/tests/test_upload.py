import hashlib
import io
import pytest
from app.core.config import settings


def test_valid_pdf_upload(client, valid_pdf_bytes):
    """
    Test uploading a valid PDF document:
    - Verifies HTTP 201 Created.
    - Verifies unique document_id generation.
    - Verifies accurate SHA-256 calculation.
    - Verifies processing_status is 'uploaded'.
    - Verifies file is safely stored on server filesystem.
    - Verifies internal paths are not exposed.
    """
    expected_hash = hashlib.sha256(valid_pdf_bytes).hexdigest()

    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "land_deed",
    }
    files = {
        "file": ("registered_land_title.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf"),
    }

    response = client.post("/api/documents/upload", data=form_data, files=files)
    assert response.status_code == 201

    data = response.json()
    assert data["success"] is True
    assert "document" in data

    doc = data["document"]
    assert doc["document_id"].startswith("DOC-")
    assert doc["institution_id"] == "INST-TN-8841"
    assert doc["application_id"] == "AICTE-EOA-2026-001"
    assert doc["document_category"] == "land_deed"
    assert doc["original_filename"] == "registered_land_title.pdf"
    assert doc["sha256_hash"] == expected_hash
    assert doc["file_size"] == len(valid_pdf_bytes)
    assert doc["mime_type"] == "application/pdf"
    assert doc["processing_status"] == "uploaded"

    # Verify no filesystem paths are exposed
    assert "/" not in doc["stored_filename"]
    assert "\\" not in doc["stored_filename"]
    assert "uploads" not in doc["stored_filename"]
    assert doc["stored_filename"].endswith(".pdf")

    # Verify file physically exists on disk in upload directory
    stored_path = settings.resolved_upload_dir / doc["stored_filename"]
    assert stored_path.exists()
    assert stored_path.read_bytes() == valid_pdf_bytes


def test_invalid_file_extension(client, valid_pdf_bytes):
    """
    Test uploading a file with an unpermitted extension (e.g. .docx or .exe).
    Expects HTTP 400 Bad Request.
    """
    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "fire_noc",
    }
    files = {
        "file": ("document.docx", io.BytesIO(valid_pdf_bytes), "application/octet-stream"),
    }

    response = client.post("/api/documents/upload", data=form_data, files=files)
    assert response.status_code == 400
    assert "Only PDF documents (.pdf) are accepted" in response.json()["detail"]


def test_invalid_magic_bytes(client):
    """
    Test uploading a file with a .pdf extension but invalid header bytes.
    Validates content rather than trusting browser-provided MIME type alone.
    Expects HTTP 400 Bad Request.
    """
    fake_content = b"<html><head></head><body>This is an HTML file renamed to PDF</body></html>"

    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "building_safety",
    }
    files = {
        "file": ("fake_deed.pdf", io.BytesIO(fake_content), "application/pdf"),
    }

    response = client.post("/api/documents/upload", data=form_data, files=files)
    assert response.status_code == 400
    assert "Invalid file signature" in response.json()["detail"]
    assert "%PDF-" in response.json()["detail"]


def test_empty_file_upload(client):
    """
    Test uploading a zero-byte file.
    Expects HTTP 400 Bad Request.
    """
    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "trust_deed",
    }
    files = {
        "file": ("empty.pdf", io.BytesIO(b""), "application/pdf"),
    }

    response = client.post("/api/documents/upload", data=form_data, files=files)
    assert response.status_code == 400
    assert "empty (0 bytes)" in response.json()["detail"]


def test_oversized_file(client, monkeypatch):
    """
    Test uploading a file that exceeds the configured file size limit.
    Expects HTTP 400 Bad Request.
    """
    # Temporarily set max limit to 50 bytes for testing
    monkeypatch.setattr(settings, "MAX_FILE_SIZE_BYTES", 50)

    # 100-byte PDF content
    large_content = b"%PDF-1.4" + b"X" * 120

    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "financial_audit",
    }
    files = {
        "file": ("oversized.pdf", io.BytesIO(large_content), "application/pdf"),
    }

    response = client.post("/api/documents/upload", data=form_data, files=files)
    assert response.status_code == 400
    assert "exceeds maximum permitted limit" in response.json()["detail"]


def test_duplicate_document_upload_blocked(client, valid_pdf_bytes):
    """
    Test uploading the exact same document hash twice for the same application.
    Expects HTTP 409 Conflict on the second attempt to prevent silent overwriting.
    """
    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "land_deed",
    }
    files = {
        "file": ("land_deed_first.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf"),
    }

    # First upload: Should succeed
    res1 = client.post("/api/documents/upload", data=form_data, files=files)
    assert res1.status_code == 201
    doc1 = res1.json()["document"]

    # Second upload: Same bytes and same application_id
    files_repeat = {
        "file": ("land_deed_copy.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf"),
    }
    res2 = client.post("/api/documents/upload", data=form_data, files=files_repeat)
    assert res2.status_code == 409
    assert "Duplicate document detected" in res2.json()["detail"]
    assert doc1["document_id"] in res2.json()["detail"]


def test_missing_metadata_fields(client, valid_pdf_bytes):
    """
    Test uploading without required metadata fields (e.g. empty institution_id).
    Expects HTTP 400 or 422 Bad Request.
    """
    form_data = {
        "institution_id": "   ",  # Whitespace only
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "land_deed",
    }
    files = {
        "file": ("deed.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf"),
    }

    response = client.post("/api/documents/upload", data=form_data, files=files)
    assert response.status_code in (400, 422)
