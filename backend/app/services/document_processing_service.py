import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from pymongo.database import Database

import pymupdf

from app.core.config import settings
from app.core.database import db_manager

logger = logging.getLogger(__name__)


class DocumentProcessingService:
    """
    Automated text extraction and OCR pipeline for statutory PDF documents.
    1. Extracts embedded text natively from digital pages via PyMuPDF.
    2. Dynamically detects scanned / image-only pages (< 50 chars embedded text).
    3. Executes Optical Character Recognition (OCR) via RapidOCR on scanned pages.
    4. Preserves 1-indexed page associations and records processing state in MongoDB.
    """

    _ocr_engine = None

    @classmethod
    def get_ocr_engine(cls):
        """Lazy-load the RapidOCR engine to conserve system memory until required."""
        if cls._ocr_engine is None:
            try:
                from rapidocr_onnxruntime import RapidOCR
                cls._ocr_engine = RapidOCR()
                logger.info("Initialized RapidOCR engine for scanned PDF text extraction.")
            except Exception as ocr_init_err:
                logger.error("Failed to initialize RapidOCR engine: %s", ocr_init_err)
                raise ocr_init_err
        return cls._ocr_engine

    @classmethod
    def process_document(
        cls,
        db: Database,
        document_id: str,
        file_path: Optional[Path] = None,
    ) -> Dict[str, Any]:
        """
        Process a document by ID: performs text extraction and OCR,
        updating the MongoDB record with page-by-page results.
        """
        collection = db["documents"]
        doc_record = collection.find_one({"document_id": document_id})
        if not doc_record:
            logger.error("Cannot process document %s: not found in database", document_id)
            raise ValueError(f"Document '{document_id}' not found in database.")

        # Determine target file path
        if file_path is None:
            stored_filename = doc_record.get("stored_filename")
            if not stored_filename:
                raise ValueError(f"Document '{document_id}' has no stored_filename record.")
            file_path = settings.resolved_upload_dir / stored_filename

        # Mark as processing
        started_at = datetime.now(timezone.utc)
        collection.update_one(
            {"document_id": document_id},
            {
                "$set": {
                    "processing_status": "processing",
                    "processing_started_at": started_at,
                    "processing_error": None,
                }
            },
        )

        if not file_path.exists():
            error_msg = f"Document payload file not found on filesystem: {file_path.name}"
            logger.error(error_msg)
            fail_payload = {
                "processing_status": "failed",
                "processing_error": error_msg,
                "processing_completed_at": datetime.now(timezone.utc),
            }
            collection.update_one(
                {"document_id": document_id},
                {"$set": fail_payload},
            )
            doc_record.update(fail_payload)
            return doc_record

        # Inspect and extract with PyMuPDF
        pages_results: List[Dict[str, Any]] = []
        had_errors = False
        error_details = []

        try:
            pdf_doc = pymupdf.open(str(file_path))
        except Exception as open_err:
            error_msg = f"Malformed or corrupted PDF file: {open_err}"
            logger.error(error_msg)
            fail_payload = {
                "processing_status": "failed",
                "processing_error": error_msg,
                "processing_completed_at": datetime.now(timezone.utc),
            }
            collection.update_one(
                {"document_id": document_id},
                {"$set": fail_payload},
            )
            doc_record.update(fail_payload)
            return doc_record

        try:
            total_pages = len(pdf_doc)
            if total_pages == 0:
                error_msg = "PDF document contains 0 pages."
                fail_payload = {
                    "processing_status": "failed",
                    "processing_error": error_msg,
                    "processing_completed_at": datetime.now(timezone.utc),
                }
                collection.update_one(
                    {"document_id": document_id},
                    {"$set": fail_payload},
                )
                doc_record.update(fail_payload)
                return doc_record

            for page_idx in range(total_pages):
                page_num = page_idx + 1
                try:
                    page = pdf_doc[page_idx]
                    embedded_text = page.get_text("text").strip()
                    images = page.get_images()
                    has_images = len(images) > 0

                    # Threshold & Content Inspection:
                    # 1. Pure digital page: Has embedded text and zero raster images (even short text is 100% native).
                    # 2. Substantial digital text: >= 50 characters of embedded text glyphs.
                    # 3. Otherwise: Scanned / image-heavy page requiring RapidOCR optical character recognition.
                    is_pure_digital = (not has_images) and (len(embedded_text) > 0)
                    has_substantial_text = len(embedded_text) >= 50

                    if is_pure_digital or has_substantial_text:
                        pages_results.append({
                            "page_number": page_num,
                            "extraction_method": "native",
                            "text": embedded_text,
                            "char_count": len(embedded_text),
                            "word_count": len(embedded_text.split()),
                            "has_images": has_images,
                            "ocr_applied": False,
                        })
                    else:
                        # Scanned or low-text page: Run real OCR
                        ocr_text = ""
                        ocr_success = False
                        try:
                            # Render page to 150 DPI pixmap for crisp OCR recognition
                            pix = page.get_pixmap(dpi=150)
                            img_png_bytes = pix.tobytes("png")
                            ocr_engine = cls.get_ocr_engine()
                            ocr_output, _ = ocr_engine(img_png_bytes)

                            if ocr_output:
                                text_lines = [item[1] for item in ocr_output if len(item) > 1 and item[1].strip()]
                                ocr_text = "\n".join(text_lines).strip()
                                if ocr_text:
                                    ocr_success = True
                        except Exception as ocr_err:
                            logger.warning("OCR failed on page %d of document %s: %s", page_num, document_id, ocr_err)
                            had_errors = True
                            error_details.append(f"Page {page_num} OCR error: {ocr_err}")

                        if ocr_success and ocr_text:
                            pages_results.append({
                                "page_number": page_num,
                                "extraction_method": "ocr",
                                "text": ocr_text,
                                "char_count": len(ocr_text),
                                "word_count": len(ocr_text.split()),
                                "has_images": has_images,
                                "ocr_applied": True,
                            })
                        elif embedded_text:
                            # Fallback to sparse embedded text if OCR produced nothing
                            pages_results.append({
                                "page_number": page_num,
                                "extraction_method": "native",
                                "text": embedded_text,
                                "char_count": len(embedded_text),
                                "word_count": len(embedded_text.split()),
                                "has_images": has_images,
                                "ocr_applied": False,
                            })
                        else:
                            pages_results.append({
                                "page_number": page_num,
                                "extraction_method": "empty",
                                "text": "",
                                "char_count": 0,
                                "word_count": 0,
                                "has_images": has_images,
                                "ocr_applied": False,
                            })
                except Exception as page_err:
                    logger.error("Error processing page %d of %s: %s", page_num, document_id, page_err)
                    had_errors = True
                    error_details.append(f"Page {page_num} error: {page_err}")
                    pages_results.append({
                        "page_number": page_num,
                        "extraction_method": "empty",
                        "text": "",
                        "char_count": 0,
                        "word_count": 0,
                        "has_images": False,
                        "ocr_applied": False,
                    })

        finally:
            pdf_doc.close()

        # Compute summary metrics
        total_pages = len(pages_results)
        native_count = sum(1 for p in pages_results if p["extraction_method"] == "native")
        ocr_count = sum(1 for p in pages_results if p["extraction_method"] == "ocr")
        total_chars = sum(p["char_count"] for p in pages_results)
        total_words = sum(p["word_count"] for p in pages_results)

        if had_errors and native_count == 0 and ocr_count == 0:
            final_status = "failed"
            final_error = "; ".join(error_details)
        elif had_errors:
            final_status = "partially_processed"
            final_error = "; ".join(error_details)
        else:
            final_status = "processed"
            final_error = None

        completed_at = datetime.now(timezone.utc)

        update_payload = {
            "processing_status": final_status,
            "total_pages": total_pages,
            "native_pages_count": native_count,
            "ocr_pages_count": ocr_count,
            "total_char_count": total_chars,
            "total_word_count": total_words,
            "processing_completed_at": completed_at,
            "processing_error": final_error,
            "pages": pages_results,
        }

        collection.update_one(
            {"document_id": document_id},
            {"$set": update_payload},
        )

        logger.info(
            "Completed processing document %s: status=%s, pages=%d (native=%d, ocr=%d, words=%d)",
            document_id,
            final_status,
            total_pages,
            native_count,
            ocr_count,
            total_words,
        )

        # Merge for return
        doc_record.update(update_payload)
        return doc_record

    @classmethod
    def process_document_background(cls, document_id: str, stored_filename: str) -> None:
        """Background task entry point invoked by FastAPI BackgroundTasks."""
        try:
            db = db_manager.get_database()
            if db is None:
                logger.warning("MongoDB unavailable during background processing of %s", document_id)
                return

            file_path = settings.resolved_upload_dir / stored_filename
            cls.process_document(db=db, document_id=document_id, file_path=file_path)
        except Exception as bg_err:
            logger.error("Unhandled error in background processing of document %s: %s", document_id, bg_err)

