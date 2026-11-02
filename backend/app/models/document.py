from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DocumentModel(BaseModel):
    """Internal MongoDB document model for uploaded statutory proof packets."""

    document_id: str
    institution_id: str
    application_id: str
    document_category: str
    original_filename: str
    stored_filename: str
    file_size: int
    mime_type: str
    sha256_hash: str
    upload_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processing_status: str = "uploaded"  # uploaded, processing, processed, partially_processed, failed

    # Text extraction & OCR processing metadata
    total_pages: int = 0
    native_pages_count: int = 0
    ocr_pages_count: int = 0
    total_char_count: int = 0
    total_word_count: int = 0
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    processing_error: Optional[str] = None
    pages: List[Dict[str, Any]] = Field(default_factory=list)

    def to_mongo_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for MongoDB insertion."""
        data = self.model_dump()
        return data

    @classmethod
    def from_mongo_dict(cls, data: Dict[str, Any]) -> "DocumentModel":
        """Construct model from MongoDB document, stripping Mongo internal _id if present."""
        clean_data = dict(data)
        clean_data.pop("_id", None)
        return cls(**clean_data)
