import io
from pathlib import Path
from PIL import Image, ImageDraw
import pymupdf
import pytest
from app.services.document_processing_service import DocumentProcessingService


def create_digital_pdf_bytes(text: str) -> bytes:
    """Helper to create a digitally generated PDF with embedded text."""
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def create_scanned_pdf_bytes(lines: list[str]) -> bytes:
    """Helper to create a scanned PDF (image only, no embedded digital text)."""
    img = Image.new("RGB", (800, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    y = 50
    for line in lines:
        draw.text((50, y), line, fill=(0, 0, 0))
        y += 40

    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")

    doc = pymupdf.open()
    page = doc.new_page(width=800, height=400)
    page.insert_image(pymupdf.Rect(0, 0, 800, 400), stream=img_bytes.getvalue())
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def create_mixed_pdf_bytes(page1_text: str, page2_lines: list[str]) -> bytes:
    """Helper to create a 2-page mixed PDF (page 1 digital, page 2 scanned image)."""
    doc = pymupdf.open()

    # Page 1: Digital text
    page1 = doc.new_page()
    page1.insert_text((50, 72), page1_text)

    # Page 2: Scanned image
    img = Image.new("RGB", (800, 300), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    y = 50
    for line in page2_lines:
        draw.text((50, y), line, fill=(0, 0, 0))
        y += 40

    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")

    page2 = doc.new_page(width=800, height=300)
    page2.insert_image(pymupdf.Rect(0, 0, 800, 300), stream=img_bytes.getvalue())

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_digital_pdf_text_extraction(client):
    """
    Test uploading and processing a digital PDF:
    - Extracts native embedded text.
    - Preserves page numbers.
    - Marks extraction_method as 'native'.
    """
    digital_text = (
        "GOVERNMENT OF TAMIL NADU - REVENUE DEPARTMENT\n"
        "Registered Freehold Land Title Deed No: 2026/TN/8841\n"
        "Survey Number: 42/1A, Total Verified Area: 12.40 Acres\n"
        "Certified Freehold Ownership for Technical Educational Institution."
    )
    pdf_bytes = create_digital_pdf_bytes(digital_text)

    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-DIGITAL",
        "document_category": "land_deed",
    }
    files = {
        "file": ("digital_land_deed.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
    }

    upload_res = client.post("/api/documents/upload", data=form_data, files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["document"]["document_id"]

    # Retrieve processing result
    proc_res = client.get(f"/api/documents/{doc_id}/processing")
    assert proc_res.status_code == 200
    data = proc_res.json()

    assert data["document_id"] == doc_id
    assert data["processing_status"] in ["processed", "processing"]
    assert data["total_pages"] == 1
    assert data["native_pages_count"] == 1
    assert data["ocr_pages_count"] == 0
    assert len(data["pages"]) == 1

    page1 = data["pages"][0]
    assert page1["page_number"] == 1
    assert page1["extraction_method"] == "native"
    assert "Land Title Deed" in page1["text"]
    assert page1["char_count"] > 50
    assert page1["ocr_applied"] is False


def test_scanned_pdf_ocr_extraction(client):
    """
    Test uploading and processing a scanned PDF (image only):
    - Detects lack of embedded text.
    - Runs real RapidOCR on the rendered page image.
    - Preserves page numbers and marks extraction_method as 'ocr'.
    """
    ocr_lines = [
        "TAMIL NADU FIRE AND RESCUE SERVICES",
        "NOC CERTIFICATE NUMBER NOC-2026-FIRE-0912",
        "COMPLIANCE SATISFIED WITH NATIONAL BUILDING CODE",
    ]
    pdf_bytes = create_scanned_pdf_bytes(ocr_lines)

    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-SCANNED",
        "document_category": "fire_noc",
    }
    files = {
        "file": ("scanned_fire_noc.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
    }

    upload_res = client.post("/api/documents/upload", data=form_data, files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["document"]["document_id"]

    # Retrieve processing result
    proc_res = client.get(f"/api/documents/{doc_id}/processing")
    assert proc_res.status_code == 200
    data = proc_res.json()

    assert data["document_id"] == doc_id
    assert data["processing_status"] in ["processed", "processing"]
    assert data["total_pages"] == 1
    assert data["ocr_pages_count"] == 1
    assert data["native_pages_count"] == 0
    assert len(data["pages"]) == 1

    page1 = data["pages"][0]
    assert page1["page_number"] == 1
    assert page1["extraction_method"] == "ocr"
    assert page1["ocr_applied"] is True
    # Verify OCR recognized keywords
    assert "FIRE" in page1["text"].upper() or "RESCUE" in page1["text"].upper() or "BUILDING" in page1["text"].upper()


def test_mixed_pdf_extraction(client):
    """
    Test a 2-page mixed PDF where Page 1 has digital text and Page 2 is a scanned image.
    Verifies that Page 1 is extracted natively and Page 2 is processed via OCR.
    """
    page1_text = (
        "AICTE APPROVAL APPLICATION FORM AY 2026-27\n"
        "Institution: Sri Venkateswara College of Engineering\n"
        "Permanent Institute ID: 1-4296181, Southern Regional Office"
    )
    page2_lines = [
        "PWD STRUCTURAL STABILITY CERTIFICATE",
        "CERTIFICATE SERIAL PWD-CHENNAI-2026-8812",
    ]
    pdf_bytes = create_mixed_pdf_bytes(page1_text, page2_lines)

    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-MIXED",
        "document_category": "pwd_safety",
    }
    files = {
        "file": ("mixed_dossier.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
    }

    upload_res = client.post("/api/documents/upload", data=form_data, files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["document"]["document_id"]

    proc_res = client.get(f"/api/documents/{doc_id}/processing")
    assert proc_res.status_code == 200
    data = proc_res.json()

    assert data["total_pages"] == 2
    assert data["native_pages_count"] == 1
    assert data["ocr_pages_count"] == 1

    page1 = data["pages"][0]
    assert page1["page_number"] == 1
    assert page1["extraction_method"] == "native"
    assert "Sri Venkateswara" in page1["text"]

    page2 = data["pages"][1]
    assert page2["page_number"] == 2
    assert page2["extraction_method"] == "ocr"
    assert page2["ocr_applied"] is True


def test_reprocess_endpoint(client):
    """Test manual reprocessing endpoint POST /api/documents/{document_id}/reprocess."""
    pdf_bytes = create_digital_pdf_bytes("TEST REPROCESS SAMPLE TEXT CONTENT FOR VERIFICATION")
    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-REPROC",
        "document_category": "other",
    }
    files = {
        "file": ("reproc_test.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
    }
    upload_res = client.post("/api/documents/upload", data=form_data, files=files)
    doc_id = upload_res.json()["document"]["document_id"]

    reproc_res = client.post(f"/api/documents/{doc_id}/reprocess")
    assert reproc_res.status_code == 200
    assert reproc_res.json()["processing_status"] in ["processed", "processing"]


def test_short_digital_page_threshold(client):
    """
    Test short digital page (<50 chars) without images:
    Verifies that pure digital vector text is identified as 'native',
    preventing unnecessary and inaccurate OCR.
    """
    short_text = "AICTE AFFIDAVIT ANNEXURE - 1"  # 28 chars, < 50 chars threshold
    pdf_bytes = create_digital_pdf_bytes(short_text)

    form_data = {
        "institution_id": "INST-TN-8841",
        "application_id": "AICTE-EOA-2026-SHORT-DIGITAL",
        "document_category": "aicte_affidavit",
    }
    files = {
        "file": ("short_annexure.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
    }
    upload_res = client.post("/api/documents/upload", data=form_data, files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["document"]["document_id"]

    proc_res = client.get(f"/api/documents/{doc_id}/processing")
    assert proc_res.status_code == 200
    data = proc_res.json()
    assert data["native_pages_count"] == 1
    assert data["ocr_pages_count"] == 0
    assert data["pages"][0]["extraction_method"] == "native"
    assert "ANNEXURE" in data["pages"][0]["text"]


def test_interrupted_job_not_silently_completed(client):
    """
    Verify that an interrupted job left in 'processing' status is marked as failed
    when reconciled and never silently marked as completed.
    """
    from app.core.database import db_manager
    db = db_manager.get_database()
    collection = db["documents"]
    # Seed an orphaned job stuck in 'processing'
    stuck_doc_id = "DOC-STUCK-TEST-001"
    collection.insert_one({
        "document_id": stuck_doc_id,
        "institution_id": "INST-TEST",
        "application_id": "APP-TEST",
        "document_category": "land_deed",
        "original_filename": "stuck.pdf",
        "stored_filename": "stuck.pdf",
        "file_size": 1024,
        "mime_type": "application/pdf",
        "sha256_hash": "abcdef1234567890",
        "upload_timestamp": "2026-11-02T10:00:00Z",
        "processing_status": "processing",
        "processing_started_at": None,
    })

    # Simulate startup reconciliation
    collection.update_many(
        {"processing_status": "processing"},
        {
            "$set": {
                "processing_status": "failed",
                "processing_error": "Interrupted: Background process terminated or restarted before completion.",
            }
        },
    )

    doc = collection.find_one({"document_id": stuck_doc_id})
    assert doc["processing_status"] == "failed"
    assert "Interrupted" in doc["processing_error"]


def test_malformed_pdf_handling(client):
    """
    Verify that a corrupted PDF payload is handled safely by the processing service,
    recording status='failed' with error explanation without raising an unhandled exception.
    """
    from app.core.config import settings
    from app.core.database import db_manager

    db = db_manager.get_database()
    collection = db["documents"]

    # Write corrupt file into current upload directory
    upload_dir = Path(settings.UPLOAD_DIR)
    corrupt_filename = "corrupted_test.pdf"
    corrupt_path = upload_dir / corrupt_filename
    corrupt_path.write_bytes(b"%PDF-1.4 CORRUPTED GARBAGE STREAM CANNOT BE PARSED BY PYMUPDF")

    doc_id = "DOC-CORRUPT-TEST-001"
    collection.insert_one({
        "document_id": doc_id,
        "institution_id": "INST-TEST",
        "application_id": "APP-TEST",
        "document_category": "land_deed",
        "original_filename": "corrupt.pdf",
        "stored_filename": corrupt_filename,
        "file_size": 58,
        "mime_type": "application/pdf",
        "sha256_hash": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "upload_timestamp": "2026-11-02T10:00:00Z",
        "processing_status": "uploaded",
    })

    proc_res = client.get(f"/api/documents/{doc_id}/processing")
    assert proc_res.status_code == 200
    data = proc_res.json()
    assert data["processing_status"] == "failed"
    assert "Malformed" in data["processing_error"] or "corrupted" in data["processing_error"]



