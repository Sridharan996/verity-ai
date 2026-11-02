import hashlib
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import HTTPException, status
from pymongo.database import Database

from app.core.config import settings
from app.models.document import DocumentModel
from app.utils.file_validation import (
    generate_safe_server_filename,
    verify_path_within_directory,
)

logger = logging.getLogger(__name__)


class DocumentService:
    @staticmethod
    def calculate_sha256(content: bytes) -> str:
        """Calculate SHA-256 cryptographic hash of byte content."""
        hasher = hashlib.sha256()
        hasher.update(content)
        return hasher.hexdigest()

    @staticmethod
    def generate_document_id() -> str:
        """Generate a unique sovereign Document ID with date prefix."""
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        unique_suffix = uuid.uuid4().hex[:8].upper()
        return f"DOC-{date_str}-{unique_suffix}"

    @classmethod
    def process_and_save_document(
        cls,
        db: Database,
        content: bytes,
        original_filename: str,
        institution_id: str,
        application_id: str,
        document_category: str,
        mime_type: str,
    ) -> DocumentModel:
        """
        Process, hash, store on disk, and register metadata in MongoDB.
        Guarantees that files are never silently overwritten and duplicates are handled.
        """
        # 1. Calculate SHA-256 fingerprint
        sha256_hash = cls.calculate_sha256(content)
        file_size = len(content)

        # 2. Duplicate Detection: Check if identical document exists for this application
        collection = db["documents"]
        existing = collection.find_one({
            "application_id": application_id.strip(),
            "sha256_hash": sha256_hash,
        })

        if existing:
            existing_doc_id = existing.get("document_id", "UNKNOWN")
            logger.warning(
                "Duplicate upload blocked: Hash %s already registered as %s in app %s",
                sha256_hash[:16],
                existing_doc_id,
                application_id,
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Duplicate document detected: An identical file (SHA-256: {sha256_hash[:16]}...) "
                    f"is already registered for application '{application_id}' "
                    f"with Document ID '{existing_doc_id}'."
                ),
            )

        # 3. Generate unique document ID and safe server-side storage filename
        document_id = cls.generate_document_id()
        stored_filename = generate_safe_server_filename(document_id)

        # 4. Ensure upload directory exists and verify path security
        upload_dir = settings.resolved_upload_dir
        upload_dir.mkdir(parents=True, exist_ok=True)

        target_file_path = upload_dir / stored_filename
        verified_path = verify_path_within_directory(upload_dir, target_file_path)

        # Defend against accidental collision on disk
        if verified_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Storage conflict: Assigned filename collision on server filesystem.",
            )

        # 5. Write content safely to disk
        try:
            with open(verified_path, "wb") as f:
                f.write(content)
            logger.info("Saved document %s to safe storage: %s", document_id, stored_filename)
        except Exception as write_err:
            logger.error("Failed to write document to filesystem: %s", write_err)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Filesystem failure while persisting uploaded document.",
            )

        # 6. Save document metadata in MongoDB
        doc_model = DocumentModel(
            document_id=document_id,
            institution_id=institution_id.strip(),
            application_id=application_id.strip(),
            document_category=document_category.strip(),
            original_filename=Path(original_filename).name,  # Strip any incoming client directories
            stored_filename=stored_filename,  # Stored name only, NO internal filesystem path
            file_size=file_size,
            mime_type=mime_type,
            sha256_hash=sha256_hash,
            upload_timestamp=datetime.now(timezone.utc),
            processing_status="uploaded",
        )

        try:
            collection.insert_one(doc_model.to_mongo_dict())
            logger.info("Successfully registered document metadata for %s in MongoDB", document_id)
        except Exception as db_err:
            # Rollback: Clean up written file from disk if database record insertion fails
            if verified_path.exists():
                try:
                    verified_path.unlink()
                    logger.info("Cleaned up orphaned file %s after DB insertion failure", verified_path)
                except Exception as clean_err:
                    logger.warning("Could not delete orphaned file %s: %s", verified_path, clean_err)

            logger.error("Database insertion failed for %s: %s", document_id, db_err)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database failure while saving document metadata.",
            )

        return doc_model

    @staticmethod
    def get_document_by_id(db: Database, document_id: str) -> DocumentModel:
        """
        Retrieve document metadata by document_id.
        Raises HTTP 404 Not Found if missing.
        """
        clean_id = document_id.strip()
        collection = db["documents"]
        doc = collection.find_one({"document_id": clean_id})

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID '{clean_id}' was not found.",
            )

        return DocumentModel.from_mongo_dict(doc)

    @staticmethod
    def list_documents_by_application(db: Database, application_id: str) -> List[DocumentModel]:
        """
        List all documents registered under a given regulatory application_id.
        """
        clean_app_id = application_id.strip()
        collection = db["documents"]
        cursor = collection.find({"application_id": clean_app_id}).sort("upload_timestamp", -1)

        results = [DocumentModel.from_mongo_dict(doc) for doc in cursor]
        return results
