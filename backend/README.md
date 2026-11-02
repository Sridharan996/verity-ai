# VERITY AI — Backend Foundation & MongoDB Persistence

The backend foundation for the **VERITY AI** Technical Education Statutory Application Validation Platform. Engineered with FastAPI, Python 3.11+, Pydantic v2, PyMongo, and SHA-256 cryptographic proof generation.

---

## 1. Architecture & Technologies
- **Runtime:** Python 3.11+ (Validated on Python 3.14)
- **Framework:** FastAPI
- **Data Validation & Serialization:** Pydantic v2 & Pydantic-Settings
- **Database Engine:** MongoDB via PyMongo (Supports local instance or MongoDB Atlas)
- **Cryptographic Fingerprinting:** Python `hashlib.sha256`
- **Application Server:** Uvicorn ASGI
- **Environment Management:** Python-Dotenv
- **Testing:** Pytest, HTTPX, and MongoMock (unit) + Live PyMongo (integration)

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI entrypoint, lifespan & CORS
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic BaseSettings (MONGODB_URI / MONGODB_URL)
│   │   └── database.py             # PyMongo client manager, index setup & live ping
│   ├── models/
│   │   ├── __init__.py
│   │   └── document.py             # Internal MongoDB document representation
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── document.py             # Public Pydantic schemas (paths redacted)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py               # GET /api/health probe
│   │   └── documents.py            # Upload, metadata, and listing endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── document_service.py     # SHA-256 hashing, safe write & Mongo operations
│   └── utils/
│       ├── __init__.py
│       └── file_validation.py      # Magic bytes (%PDF-), extension, path traversal
├── uploads/                        # Dedicated server-side document storage (.gitkeep)
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Fixtures with in-memory mongomock & temp storage
│   ├── test_health.py              # Health check & DB disconnection unit tests
│   ├── test_upload.py              # Valid/invalid/oversized/duplicate upload unit tests
│   ├── test_documents.py           # Metadata retrieval & application listing unit tests
│   └── integration/
│       ├── __init__.py
│       └── test_live_mongodb.py    # Real MongoDB integration tests (ping, indexes, restart)
├── verify_live_mongo.py            # Standalone live MongoDB persistence verification script
├── .env.example                    # Template environment variables (placeholders)
├── .env                            # Local environment configuration
├── requirements.txt                # Production and development dependencies
└── README.md                       # Comprehensive setup and API documentation
```

---

## 3. MongoDB Configuration Options

The backend supports two MongoDB connection modes configured through environment variables:

### Option A: Local MongoDB Community Service
Ideal for local development. Default host is `127.0.0.1:27017`.
In `.env`:
```env
MONGODB_URL=mongodb://127.0.0.1:27017
DATABASE_NAME=verity_ai
MONGODB_TIMEOUT_MS=2000
```

### Option B: MongoDB Atlas (Cloud Cluster)
Set `MONGODB_URI` in `.env`. When defined, `MONGODB_URI` takes precedence over `MONGODB_URL`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=verity_ai
MONGODB_TIMEOUT_MS=2500
```
> **Security Note:** Never commit actual database passwords or connection strings to version control. Keep `.env` gitignored and only commit placeholder values in `.env.example`.

---

## 4. Database Lifecycle, Ping & Indexes

### Live Health Check (`GET /api/health`)
- Executes a live `ping` command (`client.admin.command('ping')`) with configurable timeout.
- Returns `status: "healthy"` and `database_connected: true` only if the database responds.
- Returns `status: "degraded"` and `database_connected: false` if MongoDB is down or unreachable.

### Graceful Startup in Degraded Mode
- The FastAPI application boots cleanly even if MongoDB is offline.
- Non-database endpoints (e.g. root `/`, OpenAPI `/docs`) remain responsive.
- Database-dependent endpoints (upload, document metadata, application listings) safely return:
  ```json
  {
    "detail": "Database service is unavailable. Please verify MongoDB service status."
  }
  ```
  with HTTP status code `503 Service Unavailable`.

### Automatic Index Creation
When connecting to a live MongoDB instance, `ensure_indexes()` automatically registers:
1. `idx_document_id_unique`: Unique index on `document_id`.
2. `idx_app_sha256`: Compound index on `(application_id, sha256_hash)` to accelerate duplicate detection.
3. `idx_app_timestamp`: Compound index on `(application_id, upload_timestamp)` for chronological listing.

---

## 5. Windows Setup Instructions

### Prerequisites
1. **Python 3.11+** installed on Windows. Verify with:
   ```powershell
   python --version
   ```
2. **MongoDB Database** (Choose one):
   - **Local MongoDB Community Server:** Download installer from [MongoDB Community Server](https://www.mongodb.com/try/download/community). Start service via `Start-Service -Name MongoDB` or `net start MongoDB`.
   - **MongoDB Atlas Cloud:** Create free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and set `MONGODB_URI` in `backend/.env`.
   - **Docker:** `docker run -d -p 27017:27017 --name verity-mongo mongo:latest`

---

### Step 1: Create and Activate Virtual Environment

Open PowerShell inside the `backend` folder:
```powershell
cd C:\Users\sridh\Documents\SIH\backend

# Create virtual environment
python -m venv venv

# Activate on Windows PowerShell:
.\venv\Scripts\Activate.ps1

# (If running in Command Prompt cmd.exe: .\venv\Scripts\activate.bat)
```

---

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

---

### Step 3: Run Development Server

```powershell
# Default port 8000 (or 8001 if port 8000 is occupied):
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Endpoint:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 6. Testing

### 1. Unit Tests (Fast in-memory with mongomock)
Existing unit tests run completely offline without requiring a running MongoDB server:
```powershell
python -m pytest backend/tests -v
```

### 2. Standalone Live Persistence Verification
To test live database ping, index registration, document persistence across server restarts, and duplicate prevention against an active MongoDB instance:
```powershell
python backend/verify_live_mongo.py
```
*If MongoDB is offline, this script displays exact connection diagnostic blockers and actionable setup instructions.*

### 3. Integration Tests against Live MongoDB
```powershell
python -m pytest backend/tests/integration/test_live_mongodb.py -v
```
*(Automatically runs when MongoDB is reachable, or skips cleanly with an explanatory notice if MongoDB is offline).*

---

## 7. Troubleshooting Windows MongoDB Issues

| Issue | Cause | Resolution |
|---|---|---|
| `GET /api/health` returns `"status": "degraded"` | MongoDB service is not started on Windows | Run `Start-Service -Name MongoDB` in elevated PowerShell or check MongoDB service in `services.msc`. |
| `HTTP 503 Service Unavailable` on document upload | Database is offline | Check `.env` configuration. Ensure `MONGODB_URL` or `MONGODB_URI` points to a reachable MongoDB host. |
| Port 8000 in use (`[Errno 10048]`) | Another Windows process is bound to port 8000 | Run uvicorn on port 8001: `uvicorn app.main:app --port 8001 --reload`. |
| Atlas DNS error (`ServerSelectionTimeoutError`) | Missing `dnspython` package or blocked outbound port 27017 | Verify `dnspython` is installed (`pip install dnspython`) and network allows outbound TCP 27017. |
