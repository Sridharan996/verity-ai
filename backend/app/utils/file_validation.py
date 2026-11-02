import os
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status

from app.core.config import settings

# PDF standard file signature (Magic Bytes: %PDF-)
PDF_MAGIC_BYTES = b"%PDF-"


def validate_pdf_extension(filename: Optional[str]) -> str:
    """
    Validate that the uploaded file has a valid .pdf extension.
    Raises HTTP 400 Bad Request if missing or invalid.
    """
    if not filename or not filename.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty.",
        )

    # Sanitize and extract extension
    clean_filename = Path(filename).name
    ext = Path(clean_filename).suffix.lower()

    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Only PDF documents (.pdf) are accepted.",
        )
    return ext


def validate_pdf_magic_bytes(content: bytes) -> str:
    """
    Inspect the initial file header bytes to confirm it is genuinely a PDF document,
    rather than trusting browser-provided MIME types or extensions alone.
    Raises HTTP 400 Bad Request if the magic bytes are missing or invalid.
    """
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    if not content.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file signature: Content is not a legitimate PDF document (missing %PDF- header).",
        )

    return "application/pdf"


def validate_file_size(size_bytes: int, max_bytes: Optional[int] = None) -> None:
    """
    Validate that file size is within the allowed boundary.
    Raises HTTP 400 Bad Request if file is empty or exceeds the maximum configured limit.
    """
    max_limit = max_bytes if max_bytes is not None else settings.MAX_FILE_SIZE_BYTES

    if size_bytes <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    if size_bytes > max_limit:
        limit_mb = max_limit / (1024 * 1024)
        actual_mb = size_bytes / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File size ({actual_mb:.2f} MB) exceeds maximum permitted limit "
                f"of {limit_mb:.1f} MB ({max_limit} bytes)."
            ),
        )


def generate_safe_server_filename(document_id: str) -> str:
    """
    Generate a server-side storage filename based exclusively on document_id.
    Never trusts or retains user-submitted filenames for filesystem operations.
    """
    # Whitelist characters in document_id: alphanumeric and hyphens only
    clean_id = "".join(c for c in document_id if c.isalnum() or c in ("-", "_"))
    return f"{clean_id}.pdf"


def verify_path_within_directory(base_dir: Path, target_path: Path) -> Path:
    """
    Ensure the resolved target_path resides strictly inside base_dir,
    preventing directory traversal attacks (e.g., ../../../).
    """
    resolved_base = base_dir.resolve()
    resolved_target = target_path.resolve()

    try:
        # relative_to will raise ValueError if resolved_target is not within resolved_base
        resolved_target.relative_to(resolved_base)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security violation: Illegal file path traversal attempt detected.",
        )

    return resolved_target


def validate_metadata_fields(
    institution_id: str,
    application_id: str,
    document_category: str,
) -> None:
    """
    Validate that required metadata fields are provided, non-empty, and valid strings.
    """
    fields = {
        "institution_id": institution_id,
        "application_id": application_id,
        "document_category": document_category,
    }

    for name, value in fields.items():
        if not value or not str(value).strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing or empty required metadata field: '{name}'.",
            )
        if len(str(value).strip()) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Metadata field '{name}' exceeds maximum permitted length of 100 characters.",
            )
