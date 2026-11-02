import io
import pytest
from app.core.database import db_manager


def test_get_document_metadata_success(client, valid_pdf_bytes):
    """
    Test retrieving metadata for an existing document ID:
    - Verifies HTTP 200 OK.
    - Verifies all required metadata fields are returned.
    - Verifies no server filesystem path is exposed.
    """
    # 1. Upload a document
    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "fire_noc",
    }
    files = {
        "file": ("fire_noc_2026.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf"),
    }
    upload_res = client.post("/api/documents/upload", data=form_data, files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["document"]["document_id"]

    # 2. Retrieve metadata
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 200

    data = get_res.json()
    assert data["document_id"] == doc_id
    assert data["institution_id"] == "INST-TN-8841"
    assert data["application_id"] == "AICTE-EOA-2026-001"
    assert data["document_category"] == "fire_noc"
    assert data["original_filename"] == "fire_noc_2026.pdf"
    assert data["processing_status"] in ["uploaded", "processed", "processing"]
    assert data["stored_filename"].endswith(".pdf")
    assert "/" not in data["stored_filename"]
    assert "\\" not in data["stored_filename"]


def test_get_document_metadata_not_found(client):
    """
    Test retrieving metadata for a non-existent document ID.
    Expects HTTP 404 Not Found.
    """
    response = client.get("/api/documents/DOC-NON-EXISTENT-ID")
    assert response.status_code == 404
    assert "was not found" in response.json()["detail"]


def test_list_application_documents(client):
    """
    Test listing all documents registered under a specific application_id.
    Uploads two distinct documents and verifies both are returned.
    """
    app_id = "AICTE-APP-MULTI-2026"

    # Document 1
    pdf1 = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n"
    res1 = client.post(
        "/api/documents/upload",
        data={"institution_id": "INST-01", "application_id": app_id, "document_category": "affidavit_1"},
        files={"file": ("affidavit1.pdf", io.BytesIO(pdf1), "application/pdf")},
    )
    assert res1.status_code == 201

    # Document 2 (different content -> different hash)
    pdf2 = b"%PDF-1.4\n2 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 2 0 R>>\n%%EOF\n"
    res2 = client.post(
        "/api/documents/upload",
        data={"institution_id": "INST-01", "application_id": app_id, "document_category": "affidavit_2"},
        files={"file": ("affidavit2.pdf", io.BytesIO(pdf2), "application/pdf")},
    )
    assert res2.status_code == 201

    # Query application documents
    list_res = client.get(f"/api/applications/{app_id}/documents")
    assert list_res.status_code == 200

    list_data = list_res.json()
    assert list_data["application_id"] == app_id
    assert list_data["total_documents"] == 2
    assert len(list_data["documents"]) == 2

    retrieved_categories = {d["document_category"] for d in list_data["documents"]}
    assert "affidavit_1" in retrieved_categories
    assert "affidavit_2" in retrieved_categories


def test_list_application_documents_empty(client):
    """
    Test listing documents for an application with no uploads.
    Expects HTTP 200 OK with total_documents = 0.
    """
    response = client.get("/api/applications/AICTE-NO-UPLOADS-999/documents")
    assert response.status_code == 200

    data = response.json()
    assert data["application_id"] == "AICTE-NO-UPLOADS-999"
    assert data["total_documents"] == 0
    assert data["documents"] == []


def test_database_down_handling_returns_503(client, valid_pdf_bytes, monkeypatch):
    """
    Verify that when MongoDB is unreachable, database-dependent operations
    fail gracefully with HTTP 503 Service Unavailable rather than crashing.
    """
    # Simulate database connection unavailable
    monkeypatch.setattr(db_manager, "get_database", lambda: None)

    # 1. Upload attempt when DB is down
    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-001",
        "document_category": "land_deed",
    }
    files = {
        "file": ("land.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf"),
    }
    upload_res = client.post("/api/documents/upload", data=form_data, files=files)
    assert upload_res.status_code == 503
    assert "Database service is unavailable" in upload_res.json()["detail"]

    # 2. Get document metadata attempt when DB is down
    get_res = client.get("/api/documents/DOC-20261101-ABCD")
    assert get_res.status_code == 503
    assert "Database service is unavailable" in get_res.json()["detail"]
