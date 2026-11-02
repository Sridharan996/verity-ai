import logging
from typing import Optional, Tuple
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


def ensure_indexes(db: Database) -> None:
    """
    Ensure performance and integrity indexes exist on the documents collection.
    - Unique index on document_id guarantees global document uniqueness.
    - Compound index on application_id and sha256_hash enables rapid duplicate checks.
    - Compound index on application_id and upload_timestamp enables chronological listing.
    """
    try:
        collection = db["documents"]
        # Unique constraint on document_id
        collection.create_index(
            "document_id",
            unique=True,
            name="idx_document_id_unique",
            background=True,
        )
        # Compound index for application duplicate detection
        collection.create_index(
            [("application_id", 1), ("sha256_hash", 1)],
            name="idx_app_sha256",
            background=True,
        )
        # Compound index for chronological application document queries
        collection.create_index(
            [("application_id", 1), ("upload_timestamp", -1)],
            name="idx_app_timestamp",
            background=True,
        )
        logger.info("MongoDB indexes verified on collection 'documents'")
    except Exception as exc:
        logger.warning("Could not create/verify MongoDB indexes: %s", exc)


class DatabaseManager:
    def __init__(self) -> None:
        self._client: Optional[MongoClient] = None
        self._db: Optional[Database] = None
        self._is_mock: bool = False

    def connect(self) -> None:
        """
        Initialize MongoDB client using effective URI (MONGODB_URI or MONGODB_URL).
        Does not raise if MongoDB is down, allowing graceful degraded startup.
        """
        if self._is_mock:
            return

        try:
            uri = settings.effective_mongodb_uri
            self._client = MongoClient(
                uri,
                serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
                connectTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            )
            self._db = self._client[settings.DATABASE_NAME]
            logger.info("Initialized MongoDB client for database '%s'", settings.DATABASE_NAME)

            # If connection is alive, ensure indexes
            is_connected, _ = self.check_connection()
            if is_connected and self._db is not None:
                ensure_indexes(self._db)
        except Exception as exc:
            logger.warning("Failed to initialize MongoDB client: %s", exc)
            self._client = None
            self._db = None

    def disconnect(self) -> None:
        """Close MongoDB client connection."""
        if self._client is not None and not self._is_mock:
            try:
                self._client.close()
                logger.info("Closed MongoDB client connection")
            except Exception as exc:
                logger.warning("Error closing MongoDB client: %s", exc)
        self._client = None
        self._db = None

    def check_connection(self) -> Tuple[bool, str]:
        """
        Verify real connection by sending a ping command to MongoDB.
        Returns (True, message) if alive, or (False, reason) if down.
        Never reports connected unless ping succeeds.
        """
        if self._client is None:
            # Attempt reconnect if client is uninitialized
            if not self._is_mock:
                try:
                    self._client = MongoClient(
                        settings.effective_mongodb_uri,
                        serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
                        connectTimeoutMS=settings.MONGODB_TIMEOUT_MS,
                    )
                    self._db = self._client[settings.DATABASE_NAME]
                except Exception as exc:
                    return False, f"Failed to initialize MongoDB client: {exc}"

        if self._client is None:
            return False, "Database client is not initialized"

        try:
            # Issue a real ping command with timeout
            self._client.admin.command("ping")
            return True, "MongoDB connection active and verified"
        except (ServerSelectionTimeoutError, ConnectionFailure) as conn_err:
            return False, f"MongoDB connection failure: {conn_err}"
        except Exception as exc:
            return False, f"MongoDB ping failed: {exc}"

    def get_database(self) -> Optional[Database]:
        """Returns the database instance if connection is verified, else None."""
        is_connected, _ = self.check_connection()
        if is_connected:
            return self._db
        return None

    def set_mock_db(self, mock_db: Database, mock_client: Optional[MongoClient] = None) -> None:
        """Used by test suites to inject mongomock."""
        self._db = mock_db
        self._client = mock_client
        self._is_mock = True

    def reset_mock(self) -> None:
        """Reset mock state for tests."""
        self._is_mock = False
        self._client = None
        self._db = None


db_manager = DatabaseManager()


def get_db() -> Database:
    """
    FastAPI dependency that returns active Database.
    Raises HTTP 503 Service Unavailable if MongoDB is not reachable.
    """
    db = db_manager.get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is unavailable. Please verify MongoDB service status.",
        )
    return db
