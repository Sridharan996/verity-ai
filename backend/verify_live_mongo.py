"""
VERITY AI — Live MongoDB Persistence Verification Runner
Executes comprehensive real MongoDB connectivity, indexing, document upload,
retrieval, restart persistence, and duplicate prevention checks.
"""

import hashlib
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings
from app.core.database import DatabaseManager, ensure_indexes
from app.services.document_service import DocumentService


def mask_uri(uri: str) -> str:
    """Mask password credentials in MongoDB connection string for safe reporting."""
    return re.sub(r":([^@]+)@", r":****@", uri)


def print_step(title: str):
    print(f"\n{'='*70}\n[STEP] {title}\n{'='*70}")


def main():
    print("=" * 70)
    print(" VERITY AI — Live MongoDB Configuration & Persistence Verification")
    print("=" * 70)

    effective_uri = settings.effective_mongodb_uri
    masked = mask_uri(effective_uri)
    db_name = settings.DATABASE_NAME

    print(f"Target Connection URI: {masked}")
    print(f"Target Database:       {db_name}")
    print(f"Timeout:               {settings.MONGODB_TIMEOUT_MS} ms")

    # Step 1: Real Ping
    print_step("1. Live MongoDB Ping Probe")
    client = None
    try:
        client = MongoClient(
            effective_uri,
            serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            connectTimeoutMS=settings.MONGODB_TIMEOUT_MS,
        )
        ping_result = client.admin.command("ping")
        print(f"[PASS] Real MongoDB ping command succeeded: {ping_result}")
    except (ServerSelectionTimeoutError, ConnectionFailure) as err:
        print("[BLOCKER] Live MongoDB service could not be reached.")
        print(f"Details: {err}\n")
        print("-" * 70)
        print("SETUP INSTRUCTIONS TO RUN LIVE MONGODB ON WINDOWS:")
        print("-" * 70)
        print("1. LOCAL MONGODB COMMUNITY SERVER:")
        print("   - Download and install MongoDB Community Server for Windows:")
        print("     https://www.mongodb.com/try/download/community")
        print("   - Ensure service is started in PowerShell:")
        print("     Start-Service -Name MongoDB   (or: net start MongoDB)")
        print("\n2. MONGODB ATLAS CLUSTER (Cloud):")
        print("   - Create a free cluster on https://www.mongodb.com/cloud/atlas")
        print("   - Copy your connection string and add to backend/.env:")
        print("     MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority")
        print("\n3. DOCKER CONTAINER:")
        print("   - docker run -d -p 27017:27017 --name verity-mongo mongo:latest")
        print("-" * 70)
        print("\nNote: Backend safely operates in degraded mode (HTTP 503 for DB endpoints) until MongoDB is started.")
        return 1
    except Exception as exc:
        print(f"[ERROR] Unexpected error while pinging MongoDB: {exc}")
        return 1

    # Step 2: Index Verification
    print_step("2. Verify & Create Live Database Indexes")
    db = client[db_name]
    ensure_indexes(db)
    indexes = db["documents"].index_information()
    print("Active indexes on collection 'documents':")
    for name, info in indexes.items():
        print(f"  - {name}: keys={info['key']}, unique={info.get('unique', False)}")

    assert "idx_document_id_unique" in indexes, "Missing idx_document_id_unique index"
    assert "idx_app_sha256" in indexes, "Missing idx_app_sha256 index"
    assert "idx_app_timestamp" in indexes, "Missing idx_app_timestamp index"
    print("[PASS] All required indexes verified on live MongoDB collection.")

    # Step 3: Document Upload & Live Persistence
    print_step("3. Test Document Upload & Real Persistence")
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n"
        b"trailer<</Size 4/Root 1 0 R>>\n%%EOF\n"
    )
    expected_hash = hashlib.sha256(pdf_content).hexdigest()
    app_id = f"AICTE-VERIFY-APP-{int(datetime.now().timestamp())}"

    saved_doc = DocumentService.process_and_save_document(
        db=db,
        content=pdf_content,
        original_filename="verified_land_deed.pdf",
        institution_id="INST-VERIFY-001",
        application_id=app_id,
        document_category="land_deed",
        mime_type="application/pdf",
    )
    print(f"[PASS] Document inserted into live MongoDB:")
    print(f"  - Document ID:   {saved_doc.document_id}")
    print(f"  - Application ID: {saved_doc.application_id}")
    print(f"  - SHA-256 Hash:   {saved_doc.sha256_hash}")
    print(f"  - Stored File:    {saved_doc.stored_filename}")

    # Step 4: Retrieval by ID
    print_step("4. Test Document Retrieval by ID")
    retrieved = DocumentService.get_document_by_id(db=db, document_id=saved_doc.document_id)
    assert retrieved.document_id == saved_doc.document_id
    assert retrieved.sha256_hash == expected_hash
    print(f"[PASS] Successfully retrieved document '{retrieved.document_id}' from live MongoDB.")

    # Step 5: Persistence Across Backend Restart
    print_step("5. Test Persistence Across Server Disconnect & Reconnect (Restart)")
    client.close()
    print("Closed MongoDB connection (simulated server shutdown)...")

    new_manager = DatabaseManager()
    new_manager.connect()
    new_db = new_manager.get_database()
    assert new_db is not None, "Failed to reconnect on restart"

    post_restart_doc = DocumentService.get_document_by_id(db=new_db, document_id=saved_doc.document_id)
    assert post_restart_doc.document_id == saved_doc.document_id
    assert post_restart_doc.sha256_hash == expected_hash
    print(f"[PASS] Document survived restart! Retrieved from live DB: {post_restart_doc.document_id}")

    # Step 6: Duplicate Prevention on Live DB
    print_step("6. Test Duplicate Document Prevention on Live DB")
    duplicate_blocked = False
    try:
        DocumentService.process_and_save_document(
            db=new_db,
            content=pdf_content,
            original_filename="duplicate_attempt.pdf",
            institution_id="INST-VERIFY-001",
            application_id=app_id,
            document_category="land_deed",
            mime_type="application/pdf",
        )
    except Exception as dup_err:
        from fastapi import HTTPException
        if isinstance(dup_err, HTTPException) and dup_err.status_code == 409:
            duplicate_blocked = True
            print(f"[PASS] Duplicate upload correctly blocked with HTTP 409 Conflict: {dup_err.detail}")
        else:
            print(f"[FAIL] Unexpected error: {dup_err}")

    assert duplicate_blocked, "Duplicate document upload was not blocked!"

    # Step 7: Teardown Test Record
    print_step("7. Clean Up Verification Artifacts")
    new_db["documents"].delete_one({"document_id": saved_doc.document_id})
    test_file_path = settings.resolved_upload_dir / saved_doc.stored_filename
    if test_file_path.exists():
        test_file_path.unlink()
    new_manager.disconnect()
    print("[PASS] Cleaned up verification record and file payload.")

    print("\n" + "=" * 70)
    print(" ALL LIVE MONGODB PERSISTENCE VERIFICATION CHECKS PASSED!")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
