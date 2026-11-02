from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DocumentMetadataResponse(BaseModel):
    """Public document metadata schema. Does NOT expose internal filesystem paths."""

    document_id: str = Field(..., description="Unique sovereign document identifier")
    institution_id: str = Field(..., description="Permanent or application institution ID")
    application_id: str = Field(..., description="AICTE regulatory application ID")
    document_category: str = Field(..., description="Document type / statutory category")
    original_filename: str = Field(..., description="Original filename submitted by user")
    stored_filename: str = Field(..., description="Safe server-assigned filename (no directory path)")
    file_size: int = Field(..., description="File size in bytes")
    mime_type: str = Field(..., description="Validated MIME type")
    sha256_hash: str = Field(..., description="Cryptographic SHA-256 fingerprint")
    upload_timestamp: datetime = Field(..., description="UTC upload timestamp")
    processing_status: str = Field(default="uploaded", description="Lifecycle processing state")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "document_id": "DOC-20261101-A1B2C3D4",
                "institution_id": "INST-TN-8841",
                "application_id": "AICTE-EOA-2026-001",
                "document_category": "land_deed",
                "original_filename": "registered_land_title_deed.pdf",
                "stored_filename": "DOC-20261101-A1B2C3D4.pdf",
                "file_size": 2048500,
                "mime_type": "application/pdf",
                "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "upload_timestamp": "2026-11-01T01:00:00Z",
                "processing_status": "uploaded",
            }
        },
    )


class DocumentUploadResponse(BaseModel):
    """Response returned upon successful document upload."""

    success: bool = True
    message: str = "Document uploaded, cryptographically hashed, and registered successfully"
    document: DocumentMetadataResponse


class DocumentListResponse(BaseModel):
    """Response returned when listing documents for an application."""

    application_id: str
    total_documents: int
    documents: List[DocumentMetadataResponse]


class HealthResponse(BaseModel):
    """System and database connectivity health response."""

    status: str = Field(..., description="'healthy' if services active, 'degraded' if DB unavailable")
    database_connected: bool = Field(..., description="True only if MongoDB ping succeeds")
    database_message: str = Field(..., description="Status description or error details")
    timestamp: datetime = Field(..., description="Current server time (UTC)")
    version: str = "1.0.0"


class PageExtractionResult(BaseModel):
    """Page-level text extraction and OCR findings."""

    page_number: int = Field(..., description="1-indexed physical page number")
    extraction_method: str = Field(..., description="'native', 'ocr', or 'empty'")
    text: str = Field(..., description="Actual extracted text content for this page")
    char_count: int = Field(..., description="Character count in extracted text")
    word_count: int = Field(..., description="Word count in extracted text")
    has_images: bool = Field(default=False, description="Whether page contains embedded raster images")
    ocr_applied: bool = Field(default=False, description="True if OCR was executed on this page")


class DocumentProcessingResultResponse(BaseModel):
    """Complete document text extraction and OCR processing report."""

    document_id: str
    application_id: str
    institution_id: str
    document_category: str
    original_filename: str
    stored_filename: str
    file_size: int
    sha256_hash: str
    upload_timestamp: datetime
    processing_status: str  # uploaded, processing, processed, partially_processed, failed
    total_pages: int = 0
    native_pages_count: int = 0
    ocr_pages_count: int = 0
    total_char_count: int = 0
    total_word_count: int = 0
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    processing_error: Optional[str] = None
    pages: List[PageExtractionResult] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
