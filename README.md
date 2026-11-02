# VERITY AI — Technical Education Regulatory Application Review Platform
### AICTE Smart India Hackathon (Ministry of Education, Government of India)

An institutional regulatory review and compliance verification system designed for the **All India Council for Technical Education (AICTE)**. VERITY AI automates statutory document verification, computes cryptographic SHA-256 integrity proofs, validates Approval Process Handbook (APH 2026–27) norms, cross-examines cadastral spatial evidence, and manages institutional faculty cadre compliance.

---

## Key Highlights

- **Two Dedicated Sovereign Portals**:
  1. **AICTE Official Portal (`/dashboard`)**: Central regulatory scrutiny desk answering the 5 core approval questions, priority deficiency queues, compliance reviews, and scrutiny committee decision sign-offs.
  2. **Institution Portal (`/institution-dashboard`)**: Complete applicant desk for Sri Venkateswara College of Engineering (Permanent ID: `1-4296181`), featuring 4-stage review progress, academic & faculty administration (CSE, AI&DS, ECE, MECH), and deficiency response workflows.
- **Cryptographic Evidentiary Pipeline**:
  - Live multipart upload accepting PDF documents (< 10 MB).
  - Deep binary header inspection (`%PDF-` magic bytes).
  - SHA-256 fingerprinting for immutable audit trail verification.
  - Compound database indexing preventing duplicate submissions.
- **Government-Grade Institutional UI/UX**:
  - Clean institutional styling adhering to Government of India web guidelines.
  - Indian National Emblem and Ministry of Education identity.
  - Fully accessible, high-density regulatory data tables with CSV exports.

---

## Architecture & Technology Stack

| Layer | Technologies | Primary Roles |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS | Single-page institutional web application |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous REST API |
| **Database** | MongoDB (Local Community / MongoDB Atlas Cloud) | Persistent document metadata and audit records |
| **Storage** | Local Safe Storage (`backend/uploads/`) | Server-side collision-free binary PDF storage |
| **Hosting** | Vercel (Frontend) + Render / Railway (Backend) | Production cloud deployment |

---

## Local Development Setup

### 1. Start the FastAPI Backend
```powershell
cd C:\Users\sridh\Documents\SIH
& .\backend\.venv312\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health Probe: `http://127.0.0.1:8000/api/health`

### 2. Start the React Frontend
Open a second PowerShell terminal:
```powershell
cd C:\Users\sridh\Documents\SIH
npm.cmd run dev
```
- Frontend Web Portal: `http://localhost:3000`
- API calls to `/api` are automatically proxied to the backend on port 8000.

---

## Automated Test Suites

### Frontend Tests
```powershell
npm.cmd test -- --run
```
*Executes 8 unit and integration tests (validation, byte formatting, category mapping, duplicate handling, 503 error handling).*

### Backend Tests
```powershell
& .\backend\.venv312\Scripts\python.exe -m pytest backend\tests --basetemp=backend\.pytest-tmp-run
```
*Executes 19 integration and unit tests across upload validation, MongoDB persistence, duplicate prevention, and health probes.*

### Production Build
```powershell
npm.cmd run build
```
*Compiles TypeScript and bundles client assets via Vite.*

---

## Deployment Instructions

For complete step-by-step guidance on deploying the frontend to **Vercel** and the backend to **Render** or **Railway**, consult **[DEPLOYMENT_GUIDE.md](file:///c:/Users/sridh/Documents/SIH/DEPLOYMENT_GUIDE.md)**.

