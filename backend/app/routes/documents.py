from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from pymongo.database import Database

from app.core.database import get_db
from app.schemas.document import (
    DocumentListResponse,
    DocumentMetadataResponse,
    DocumentProcessingResultResponse,
    DocumentUploadResponse,
)
from app.services.document_processing_service import DocumentProcessingService
from app.services.document_service import DocumentService
from app.utils.file_validation import (
    validate_file_size,
    validate_metadata_fields,
    validate_pdf_extension,
    validate_pdf_magic_bytes,
)

router = APIRouter(tags=["Documents"])


@router.post(
    "/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Register Statutory Document",
)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF document binary payload"),
    institution_id: str = Form(..., description="Sovereign or state institution ID"),
    application_id: str = Form(..., description="AICTE regulatory application ID"),
    document_category: str = Form(..., description="Statutory category (e.g. land_deed, fire_noc)"),
    db: Database = Depends(get_db),
) -> DocumentUploadResponse:
    """
    Upload a statutory document in PDF format:
    - Validates file extension and content magic bytes (%PDF-).
    - Enforces configured file size limit (default 10 MB).
    - Generates a unique server-side document ID and filename to prevent path traversal.
    - Calculates SHA-256 cryptographic hash.
    - Persists file safely in the backend uploads directory.
    - Registers metadata in MongoDB.
    - Rejects duplicate uploads within the same application.
    - Asynchronously enqueues text extraction and OCR in background tasks.
    """
    # 1. Validate metadata fields
    validate_metadata_fields(
        institution_id=institution_id,
        application_id=application_id,
        document_category=document_category,
    )

    # 2. Validate file extension
    validate_pdf_extension(file.filename)

    # 3. Read uploaded binary content
    try:
        content = await file.read()
    except Exception as read_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file payload: {read_err}",
        )

    # 4. Validate file size and content magic bytes (%PDF-)
    validate_file_size(len(content))
    mime_type = validate_pdf_magic_bytes(content)

    # 5. Process, hash, persist on disk, and store in MongoDB
    saved_document = DocumentService.process_and_save_document(
        db=db,
        content=content,
        original_filename=file.filename or "uploaded_document.pdf",
        institution_id=institution_id,
        application_id=application_id,
        document_category=document_category,
        mime_type=mime_type,
    )

    # 6. Enqueue asynchronous background text extraction & OCR pipeline
    background_tasks.add_task(
        DocumentProcessingService.process_document_background,
        document_id=saved_document.document_id,
        stored_filename=saved_document.stored_filename,
    )

    metadata_response = DocumentMetadataResponse.model_validate(saved_document)

    return DocumentUploadResponse(
        success=True,
        message="Document uploaded, cryptographically hashed, and registered successfully. Text extraction enqueued.",
        document=metadata_response,
    )


@router.get(
    "/documents/{document_id}",
    response_model=DocumentMetadataResponse,
    summary="Retrieve Document Metadata",
)
def get_document_metadata(
    document_id: str,
    db: Database = Depends(get_db),
) -> DocumentMetadataResponse:
    """
    Retrieve document metadata by document_id.
    Never exposes internal filesystem paths in the response.
    """
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID parameter cannot be empty.",
        )

    document = DocumentService.get_document_by_id(db=db, document_id=document_id)
    return DocumentMetadataResponse.model_validate(document)


@router.get(
    "/applications/{application_id}/documents",
    response_model=DocumentListResponse,
    summary="List Documents for an Application",
)
def list_application_documents(
    application_id: str,
    db: Database = Depends(get_db),
) -> DocumentListResponse:
    """
    Retrieve all statutory documents uploaded under a specific application_id.
    Never exposes internal filesystem paths.
    """
    if not application_id or not application_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application ID parameter cannot be empty.",
        )

    documents = DocumentService.list_documents_by_application(db=db, application_id=application_id)
    serialized_docs = [DocumentMetadataResponse.model_validate(d) for d in documents]

    return DocumentListResponse(
        application_id=application_id.strip(),
        total_documents=len(serialized_docs),
        documents=serialized_docs,
    )


@router.get(
    "/documents/{document_id}/processing",
    response_model=DocumentProcessingResultResponse,
    summary="Retrieve Document Text Extraction & OCR Results",
)
def get_document_processing_result(
    document_id: str,
    db: Database = Depends(get_db),
) -> DocumentProcessingResultResponse:
    """
    Retrieve real page-by-page extracted text and OCR status for a statutory document.
    """
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID parameter cannot be empty.",
        )

    clean_id = document_id.strip()
    collection = db["documents"]
    doc = collection.find_one({"document_id": clean_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{clean_id}' was not found.",
        )

    # If the document is still in 'uploaded' state, trigger extraction now
    if doc.get("processing_status") == "uploaded":
        doc = DocumentProcessingService.process_document(db=db, document_id=clean_id)
    elif doc.get("processing_status") == "processing":
        started_at = doc.get("processing_started_at")
        if started_at:
            if started_at.tzinfo is None:
                started_at = started_at.replace(tzinfo=timezone.utc)
            elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
            if elapsed > 120:
                # Mark stalled job as failed
                error_msg = f"Processing timeout exceeded ({int(elapsed)}s). Background worker was likely terminated."
                collection.update_one(
                    {"document_id": clean_id},
                    {
                        "$set": {
                            "processing_status": "failed",
                            "processing_error": error_msg,
                            "processing_completed_at": datetime.now(timezone.utc),
                        }
                    },
                )
                doc = collection.find_one({"document_id": clean_id})

    return DocumentProcessingResultResponse.model_validate(doc)


@router.post(
    "/documents/{document_id}/reprocess",
    response_model=DocumentProcessingResultResponse,
    summary="Retry / Reprocess Text Extraction & OCR",
)
def reprocess_document(
    document_id: str,
    db: Database = Depends(get_db),
) -> DocumentProcessingResultResponse:
    """
    Manually trigger re-extraction and OCR on a document.
    """
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID parameter cannot be empty.",
        )

    clean_id = document_id.strip()
    doc = DocumentProcessingService.process_document(db=db, document_id=clean_id)
    return DocumentProcessingResultResponse.model_validate(doc)
