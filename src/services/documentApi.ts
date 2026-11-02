/**
 * VERITY AI — Statutory Document API Client
 * 
 * Handles client-side validation, multipart FormData upload,
 * duplicate detection, and retrieval of documents persisted in live MongoDB.
 */

export interface DocumentMetadata {
  document_id: string;
  institution_id: string;
  application_id: string;
  document_category: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  upload_timestamp: string;
  processing_status: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  document: DocumentMetadata;
}

export interface DocumentListResponse {
  application_id: string;
  total_documents: number;
  documents: DocumentMetadata[];
}

export interface PageExtractionResult {
  page_number: number;
  extraction_method: 'native' | 'ocr' | 'empty';
  text: string;
  char_count: number;
  word_count: number;
  has_images: boolean;
  ocr_applied: boolean;
}

export interface DocumentProcessingResult {
  document_id: string;
  application_id: string;
  institution_id: string;
  document_category: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  sha256_hash: string;
  upload_timestamp: string;
  processing_status: 'uploaded' | 'processing' | 'processed' | 'partially_processed' | 'failed';
  total_pages: number;
  native_pages_count: number;
  ocr_pages_count: number;
  total_char_count: number;
  total_word_count: number;
  processing_started_at?: string | null;
  processing_completed_at?: string | null;
  processing_error?: string | null;
  pages: PageExtractionResult[];
}

export interface HealthResponse {
  status: string;
  database_connected: boolean;
  database_message: string;
  timestamp: string;
  version: string;
}

export interface UploadDocumentParams {
  file: File;
  institutionId: string;
  applicationId: string;
  documentCategory: string;
}

export class ApiError extends Error {
  statusCode?: number;
  isDuplicate?: boolean;
  isDatabaseOffline?: boolean;

  constructor(message: string, statusCode?: number, isDuplicate = false, isDatabaseOffline = false) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isDuplicate = isDuplicate;
    this.isDatabaseOffline = isDatabaseOffline;
  }
}

/**
 * Format bytes into human-readable string (e.g. 2.4 MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Map raw document category slug to human-readable label.
 */
export function formatCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    land_deed: 'Land Title Registered Deed',
    cadastral_map: 'Cadastral GIS Boundary Map',
    pwd_safety: 'PWD Structural Stability Certificate',
    fire_noc: 'Fire & Rescue Services NOC',
    building_plan: 'Approved Municipal Building Plan',
    aicte_affidavit: 'AICTE Statutory Affidavit',
    water_noc: 'Pollution Control & Water NOC',
    faculty_cadre: 'Faculty Cadre Roll & Service Register',
    experience_records: 'Faculty Experience & APAAR Sync',
    salary_disbursal: 'Form 16 & Bank Disbursal Records',
    other: 'Statutory Proof Document',
  };
  return map[category] || category.replace(/_/g, ' ').toUpperCase();
}

/**
 * Map document category to broad group ('Land' | 'Safety' | 'Academic' | 'Lab').
 */
export function mapCategoryToGroup(category: string): 'Land' | 'Safety' | 'Academic' | 'Lab' {
  const lower = category.toLowerCase();
  if (lower.includes('land') || lower.includes('cadastral') || lower.includes('boundary')) {
    return 'Land';
  }
  if (lower.includes('fire') || lower.includes('pwd') || lower.includes('safety') || lower.includes('building')) {
    return 'Safety';
  }
  if (lower.includes('lab') || lower.includes('mechanic') || lower.includes('equipment')) {
    return 'Lab';
  }
  return 'Academic';
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Resolve the backend API base URL.
 * In local development, returns '' so that requests use the Vite proxy (/api).
 * In production (e.g. Vercel), uses VITE_API_BASE_URL if configured.
 */
export function getApiBaseUrl(): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '');
    }
  } catch {
    // In non-Vite testing environments
  }
  return '';
}

/**
 * Upload a statutory PDF document to FastAPI backend via Vite proxy or direct API URL.
 * Enforces multipart FormData boundary handling without manually setting Content-Type.
 */
export async function uploadDocument(params: UploadDocumentParams): Promise<DocumentUploadResponse> {
  const { file, institutionId, applicationId, documentCategory } = params;

  // 1. Client-side extension validation
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new ApiError('Invalid file type: Only PDF documents (.pdf) are permitted.', 400);
  }

  // 2. Client-side size limit validation (10 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(
      `File size (${formatFileSize(file.size)}) exceeds the maximum statutory limit of 10 MB.`,
      413
    );
  }

  if (file.size === 0) {
    throw new ApiError('The selected PDF file is empty (0 bytes).', 400);
  }

  // 3. Assemble multipart FormData (browser will generate boundary automatically)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('institution_id', institutionId.trim());
  formData.append('application_id', applicationId.trim());
  formData.append('document_category', documentCategory.trim());

  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      body: formData,
      // NOTE: Do NOT set 'Content-Type' header here; fetch sets multipart/form-data with proper boundary!
    });
  } catch (netErr) {
    throw new ApiError(
      'Unable to connect to the backend server. Please verify the FastAPI backend is running on port 8000.',
      0
    );
  }

  if (!response.ok) {
    let errorDetail = `Upload failed with HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      // Non-JSON error payload
    }

    if (response.status === 409) {
      throw new ApiError(
        errorDetail || 'Duplicate document detected: This exact file has already been registered for this application.',
        409,
        true,
        false
      );
    }

    if (response.status === 503) {
      throw new ApiError(
        'Database persistence is currently unavailable. Please verify MongoDB status.',
        503,
        false,
        true
      );
    }

    throw new ApiError(errorDetail, response.status);
  }

  const result: DocumentUploadResponse = await response.json();
  return result;
}

/**
 * Retrieve metadata for a single document from live MongoDB.
 */
export async function getDocumentMetadata(documentId: string): Promise<DocumentMetadata> {
  const cleanId = documentId.trim();
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/documents/${encodeURIComponent(cleanId)}`);
  } catch {
    throw new ApiError('Unable to connect to backend server.', 0);
  }

  if (!response.ok) {
    let detail = `Document '${cleanId}' not found.`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch {
      // Non-JSON error payload
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}

/**
 * Retrieve all statutory documents registered under an AICTE application ID.
 */
export async function listApplicationDocuments(applicationId: string): Promise<DocumentMetadata[]> {
  const cleanAppId = applicationId.trim();
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/applications/${encodeURIComponent(cleanAppId)}/documents`);
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  try {
    const data: DocumentListResponse = await response.json();
    return data.documents || [];
  } catch {
    return [];
  }
}

/**
 * Check backend service and database health.
 */
export async function checkBackendHealth(): Promise<HealthResponse> {
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/health`);
  } catch {
    return {
      status: 'offline',
      database_connected: false,
      database_message: 'Backend server is unreachable.',
      timestamp: new Date().toISOString(),
      version: 'unknown',
    };
  }

  if (!response.ok) {
    return {
      status: 'degraded',
      database_connected: false,
      database_message: `Backend health check returned HTTP ${response.status}`,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  return response.json();
}

/**
 * Retrieve text extraction and OCR findings for a document.
 */
export async function getDocumentProcessingResult(documentId: string): Promise<DocumentProcessingResult> {
  const cleanId = documentId.trim();
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/documents/${encodeURIComponent(cleanId)}/processing`);
  } catch {
    throw new ApiError('Unable to connect to backend server for processing results.', 0);
  }

  if (!response.ok) {
    let detail = `Processing results for '${cleanId}' not available.`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch {
      // Non-JSON error payload
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}

/**
 * Manually trigger re-extraction and OCR on a document.
 */
export async function triggerDocumentReprocess(documentId: string): Promise<DocumentProcessingResult> {
  const cleanId = documentId.trim();
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/documents/${encodeURIComponent(cleanId)}/reprocess`, {
      method: 'POST',
    });
  } catch {
    throw new ApiError('Unable to connect to backend server to trigger reprocessing.', 0);
  }

  if (!response.ok) {
    let detail = `Failed to trigger reprocessing for '${cleanId}'.`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch {
      // Non-JSON error payload
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}
