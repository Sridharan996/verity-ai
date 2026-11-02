import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { StatusBadge } from '../components/common/StatusBadge';
import { DocumentUploadModal } from '../components/common/DocumentUploadModal';
import {
  listApplicationDocuments,
  checkBackendHealth,
  formatCategoryLabel,
  mapCategoryToGroup,
  formatFileSize,
  DocumentMetadata,
  DocumentProcessingResult,
  PageExtractionResult,
  getDocumentProcessingResult,
  triggerDocumentReprocess,
} from '../services/documentApi';

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Land' | 'Safety' | 'Academic' | 'Lab';
  type: string;
  size: string;
  status: 'verified' | 'flagged' | 'pending';
  ocrConfidence: number | null;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  tamperScore: string;
  shaHash: string;
  summary: string;
  extractedFields: { label: string; value: string; verified: boolean }[];
  isLive?: boolean;
  originalFilename?: string;
  storedFilename?: string;
  uploadTimestamp?: string;
  processingStatus?: string;
}

const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-land',
    title: 'Land Title Registered Freehold Deed',
    category: 'Land',
    type: 'PDF',
    size: '4.2 MB',
    status: 'verified',
    ocrConfidence: null,
    certificateNumber: 'TN-KPM-DEED-2018-9941',
    issueDate: '14 May 2018',
    expiryDate: 'Permanent Freehold',
    issuingAuthority: 'Sub-Registrar Office, Sriperumbudur',
    tamperScore: '0.00% (Tamper-Free)',
    shaHash: '0x8a92f8c027419842104829102941b2e4b0291a8e1029482910398410294812a',
    summary: 'Registered sale deed confirming 12.40 contiguous acres in favor of the Educational Trust for technical campus usage.',
    extractedFields: [
      { label: 'Survey Numbers', value: '42/1B, 42/2, 43/1A', verified: true },
      { label: 'Total Land Extent', value: '12.40 Acres (50,181 sq.m)', verified: true },
      { label: 'Land Classification', value: 'Educational / Institutional', verified: true },
      { label: 'Contiguity Norm', value: '100% Single Contiguous Plot', verified: true },
      { label: 'Encumbrance Certificate', value: 'Nil Encumbrance (30 Yrs)', verified: true },
    ],
    isLive: false,
  },
  {
    id: 'doc-cadastral',
    title: 'Cadastral GIS Boundary Map',
    category: 'Land',
    type: 'GEO/CAD',
    size: '8.1 MB',
    status: 'verified',
    ocrConfidence: null,
    certificateNumber: 'GIS-POLY-7721-WZ',
    issueDate: '02 Jan 2026',
    expiryDate: 'AY 2026-27 Validated',
    issuingAuthority: 'State Survey and Land Records Department',
    tamperScore: '0.01% (Tamper-Free)',
    shaHash: '0x3c99f1a9102948192049182048842e104829102948192048102948192048192',
    summary: 'DGPS survey polygon coordinates confirmed against state cadastral geo-database with zero overlap anomalies.',
    extractedFields: [
      { label: 'Geodetic Datum', value: 'WGS 84 / UTM Zone 44N', verified: true },
      { label: 'Campus Perimeter', value: '1,420 Meters Closed Boundary', verified: true },
      { label: 'Access Road Width', value: '18.0 Meters Public Highway', verified: true },
      { label: 'Boundary Buffer Zone', value: 'Clear of Forest / Coastal CRZ', verified: true },
    ],
    isLive: false,
  },
  {
    id: 'doc-pwd',
    title: 'PWD Structural Stability Certificate',
    category: 'Safety',
    type: 'PDF',
    size: '2.8 MB',
    status: 'verified',
    ocrConfidence: null,
    certificateNumber: 'PWD-STR-2024-8812',
    issueDate: '10 Oct 2024',
    expiryDate: '09 Oct 2027',
    issuingAuthority: 'Superintending Engineer, PWD Buildings',
    tamperScore: '0.00% (Tamper-Free)',
    shaHash: '0x17fa2b09182374819208491825510c4d1920391820394810294819203948102',
    summary: 'Executive structural safety inspection certified earthquake resistance (Zone III) and multi-story load capacity.',
    extractedFields: [
      { label: 'Inspected Built-Up Area', value: '38,420 sq.m (Blocks A, B, C)', verified: true },
      { label: 'Seismic Zone Standard', value: 'IS 1893:2016 Compliant (Zone III)', verified: true },
      { label: 'Occupancy Safety Load', value: 'Certified for 6,000 Occupants', verified: true },
      { label: 'Structural Engineer Reg', value: 'SE-CH-Grade1-4402', verified: true },
    ],
    isLive: false,
  },
  {
    id: 'doc-fire',
    title: 'Fire & Rescue Services NOC',
    category: 'Safety',
    type: 'PDF',
    size: '1.9 MB',
    status: 'flagged',
    ocrConfidence: null,
    certificateNumber: 'DFRS-NOC-2025-1102',
    issueDate: '15 Jan 2025',
    expiryDate: '14 Jan 2026 (Expired)',
    issuingAuthority: 'Divisional Fire Officer, Central Division',
    tamperScore: '0.00% (Tamper-Free)',
    shaHash: '0x9924c1d8192837491029381023318f7a1920394810294819203948102948192',
    summary: 'Fire safety system compliance audit completed. Note: Annual renewal is pending submission for AY 2026-27.',
    extractedFields: [
      { label: 'Hydrant Flow Pressure', value: '3.5 Bar at Roof Terminal', verified: true },
      { label: 'Smoke Detector Coverage', value: '100% Academic & Lab Blocks', verified: true },
      { label: 'Emergency Exit Stairways', value: '4 Enclosed Fire Exits (2.0m width)', verified: true },
      { label: 'Renewal Grace Period', value: 'Deficiency Notice Issued (48h)', verified: false },
    ],
    isLive: false,
  },
  {
    id: 'doc-affidavit',
    title: 'AICTE Mandatory Statutory Affidavit',
    category: 'Academic',
    type: 'PDF',
    size: '3.4 MB',
    status: 'verified',
    ocrConfidence: null,
    certificateNumber: 'NOTARY-IND-2026-4401',
    issueDate: '12 Jan 2026',
    expiryDate: 'AY 2026-27 Validated',
    issuingAuthority: 'Notary Public, Govt of Tamil Nadu',
    tamperScore: '0.00% (Tamper-Free)',
    shaHash: '0x4481bb29182374910293810291102e9c1920394810294819203948102948192',
    summary: 'Affidavit affirming non-capitation fee policy, AICTE 2026 approval process handbook conformity and faculty roster accuracy.',
    extractedFields: [
      { label: 'Anti-Ragging Committee', value: 'Constituted per 2009 Regs', verified: true },
      { label: 'Grievance Redressal Cell', value: 'Active Portal & Omudsperson', verified: true },
      { label: 'Faculty Cadre Ratio', value: '1:15 Approved AICTE Ratio', verified: true },
      { label: 'Affidavit Stamp Paper', value: 'Rs. 100 Non-Judicial E-Stamp', verified: true },
    ],
    isLive: false,
  },
];

interface CandidateObservation {
  label: string;
  value: string;
  confidenceNote: string;
}

/**
 * Extract candidate regulatory observations from raw text without fabricating facts.
 */
function extractCandidateObservations(pages: PageExtractionResult[]): CandidateObservation[] {
  const fullText = pages.map((p) => p.text).join('\n');
  const candidates: CandidateObservation[] = [];

  // 1. Certificate / Reference numbers
  const refRegex = new RegExp('\\b(?:NOC|DEED|ORDER|REG|REF|PWD|AICTE|NOTARY|DOC)[\\-:\\s#]+[A-Z0-9\\/-]{4,32}\\b', 'gi');
  const refMatches = fullText.match(refRegex);
  if (refMatches && refMatches.length > 0) {
    candidates.push({
      label: 'Candidate Reference / Certificate No.',
      value: refMatches[0].trim(),
      confidenceNote: 'Pattern-matched statutory identifier token',
    });
  }

  // 2. Dates detected
  const dateRegex = new RegExp('\\b(?:\\d{1,2}[\\-\\/]\\d{1,2}[\\-\\/]\\d{2,4}|(?:\\d{1,2}\\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\\s,]+\\d{4}))\\b', 'gi');
  const dateMatches = fullText.match(dateRegex);
  if (dateMatches && dateMatches.length > 0) {
    candidates.push({
      label: 'Candidate Date Detected',
      value: dateMatches[0].trim(),
      confidenceNote: 'Extracted temporal expression',
    });
  }

  // 3. Land / Built-Up Area measurements
  const areaMatches = fullText.match(/\b\d+(?:\.\d+)?\s*(?:Acres?|acres?|sq\.?m|sqm|sq\.?\s*ft|hectares?)\b/gi);
  if (areaMatches && areaMatches.length > 0) {
    candidates.push({
      label: 'Candidate Land / Area Measurement',
      value: areaMatches[0].trim(),
      confidenceNote: 'Recognized physical area metric',
    });
  }

  // 4. Statutory institutional keywords
  const keywords = [
    'AICTE',
    'Fire and Rescue',
    'Public Works Department',
    'Structural Stability',
    'Sub-Registrar',
    'Affidavit',
    'Non-Capitation',
    'Superintending Engineer',
    'Approved Process Handbook',
  ];
  const matchedKeywords = keywords.filter((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(fullText));
  if (matchedKeywords.length > 0) {
    candidates.push({
      label: 'Detected Statutory Keywords',
      value: matchedKeywords.join(', '),
      confidenceNote: 'Lexical match against regulatory glossary',
    });
  }

  // 5. Raw Opening Excerpt
  const cleanExcerpt = fullText.replace(/\s+/g, ' ').trim();
  if (cleanExcerpt.length > 0) {
    const preview = cleanExcerpt.length > 160 ? `${cleanExcerpt.slice(0, 160)}...` : cleanExcerpt;
    candidates.push({
      label: 'Candidate Text Opening Excerpt',
      value: `"${preview}"`,
      confidenceNote: 'Direct unedited character stream excerpt',
    });
  }

  return candidates;
}

function adaptBackendDocToItem(doc: DocumentMetadata): DocumentItem {
  return {
    id: doc.document_id,
    title: formatCategoryLabel(doc.document_category),
    originalFilename: doc.original_filename,
    storedFilename: doc.stored_filename,
    category: mapCategoryToGroup(doc.document_category),
    type: 'PDF',
    size: formatFileSize(doc.file_size),
    status: doc.processing_status === 'processed' ? 'verified' : doc.processing_status === 'failed' ? 'flagged' : 'pending',
    ocrConfidence: null,
    certificateNumber: doc.document_id,
    issueDate: new Date(doc.upload_timestamp).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    expiryDate: 'Statutory Review Pending',
    issuingAuthority: `Institution Registry (${doc.institution_id})`,
    tamperScore: 'Valid %PDF- Magic Bytes',
    shaHash: doc.sha256_hash,
    summary: `Statutory PDF document '${doc.original_filename}' registered in central repository and cryptographically hashed with SHA-256.`,
    extractedFields: [
      { label: 'Payload Integrity', value: 'Valid %PDF- Header & Magic Bytes', verified: true },
      { label: 'Cryptographic Hash', value: `SHA-256: ${doc.sha256_hash.slice(0, 16)}...`, verified: true },
      { label: 'Storage Status', value: `Safely stored as ${doc.stored_filename}`, verified: true },
      { label: 'Extraction Pipeline', value: `Status: ${doc.processing_status.toUpperCase()}`, verified: doc.processing_status === 'processed' },
    ],
    isLive: true,
    uploadTimestamp: doc.upload_timestamp,
    processingStatus: doc.processing_status,
  };
}

export const DocumentVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentAppId = searchParams.get('appId') || 'AICTE-EOA-2026-001';

  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>(
    searchParams.get('docId') || mockDocuments[0].id
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<'documents' | 'viewer' | 'details'>('viewer');

  // Upload modal & server status
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState<'connected' | 'degraded' | 'offline' | 'checking'>('checking');

  // Real Processing Results State
  const [processingResult, setProcessingResult] = useState<DocumentProcessingResult | null>(null);
  const [isProcessingLoading, setIsProcessingLoading] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isReprocessing, setIsReprocessing] = useState<boolean>(false);

  // Load existing uploaded documents from MongoDB on mount
  useEffect(() => {
    let isMounted = true;

    async function loadLiveData() {
      const health = await checkBackendHealth();
      if (!isMounted) return;

      if (health.status === 'healthy' && health.database_connected) {
        setBackendHealth('connected');
      } else if (health.status === 'degraded' || !health.database_connected) {
        setBackendHealth('degraded');
      } else {
        setBackendHealth('offline');
      }

      const liveDocs = await listApplicationDocuments(currentAppId);
      if (!isMounted) return;

      if (liveDocs.length > 0) {
        const adaptedItems = liveDocs.map(adaptBackendDocToItem);
        setDocuments([...adaptedItems, ...mockDocuments]);
        if (!searchParams.get('docId')) {
          setSelectedDocId(adaptedItems[0].id);
        }
      }
    }

    loadLiveData();

    return () => {
      isMounted = false;
    };
  }, [currentAppId, searchParams]);

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  // Fetch processing results when activeDoc changes
  useEffect(() => {
    let isMounted = true;

    async function fetchProcessingInfo() {
      if (!activeDoc || !activeDoc.isLive) {
        setProcessingResult(null);
        setProcessingError(null);
        setIsProcessingLoading(false);
        return;
      }

      setIsProcessingLoading(true);
      setProcessingError(null);

      try {
        const result = await getDocumentProcessingResult(activeDoc.id);
        if (isMounted) {
          setProcessingResult(result);
          // Sync active doc processing status
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === activeDoc.id
                ? {
                    ...d,
                    processingStatus: result.processing_status,
                    status: result.processing_status === 'processed' ? 'verified' : result.processing_status === 'failed' ? 'flagged' : 'pending',
                  }
                : d
            )
          );
        }
      } catch (err: any) {
        if (isMounted) {
          setProcessingError(err?.message || 'Failed to retrieve text extraction results.');
        }
      } finally {
        if (isMounted) {
          setIsProcessingLoading(false);
        }
      }
    }

    setCurrentPageNumber(1);
    setRotation(0);
    fetchProcessingInfo();

    return () => {
      isMounted = false;
    };
  }, [activeDoc?.id, activeDoc?.isLive]);

  // Polling fallback if processing is running asynchronously
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let isCancelled = false;

    if (processingResult?.processing_status === 'processing' && activeDoc?.isLive) {
      const poll = async () => {
        try {
          const updated = await getDocumentProcessingResult(activeDoc.id);
          if (!isCancelled) {
            setProcessingResult(updated);
            if (updated.processing_status === 'processing') {
              timer = setTimeout(poll, 2000);
            }
          }
        } catch {
          if (!isCancelled) {
            timer = setTimeout(poll, 2500);
          }
        }
      };
      timer = setTimeout(poll, 2000);
    }

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [processingResult?.processing_status, activeDoc?.id, activeDoc?.isLive]);

  const filteredDocs = documents.filter((doc) => {
    if (categoryFilter === 'all') return true;
    return doc.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const handleAction = (message: string) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setCurrentPageNumber(1);
    setRotation(0);
    setMobileWorkspaceTab('viewer');
  };

  const handleUploadSuccess = (newDocMetadata: DocumentMetadata) => {
    const newItem = adaptBackendDocToItem(newDocMetadata);
    setDocuments((prev) => [newItem, ...prev]);
    setSelectedDocId(newItem.id);
    setCurrentPageNumber(1);
    setMobileWorkspaceTab('viewer');
    handleAction(`Document '${newDocMetadata.original_filename}' uploaded. Text extraction enqueued in background.`);
  };

  const handleReprocess = async () => {
    if (!activeDoc?.id || !activeDoc.isLive) return;

    setIsReprocessing(true);
    try {
      const result = await triggerDocumentReprocess(activeDoc.id);
      setProcessingResult(result);
      setProcessingError(null);
      handleAction(
        `Reprocessed '${activeDoc.title}'. Extracted ${result.total_char_count} characters across ${result.total_pages} page(s).`
      );
    } catch (err: any) {
      handleAction(`Reprocessing failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsReprocessing(false);
    }
  };

  const candidateObservations = useMemo(() => {
    if (activeDoc.isLive && processingResult?.pages) {
      return extractCandidateObservations(processingResult.pages);
    }
    return [];
  }, [activeDoc.isLive, processingResult]);

  // Current active page within processing result
  const activePageData = useMemo(() => {
    if (!processingResult?.pages || processingResult.pages.length === 0) return null;
    return (
      processingResult.pages.find((p) => p.page_number === currentPageNumber) ||
      processingResult.pages[0]
    );
  }, [processingResult, currentPageNumber]);

  const totalPages = processingResult?.total_pages || 1;

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="document-verification"
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader
          role="aicte"
          userName="Dr. R. Sharma"
          userRoleTitle="Director, Approval Bureau"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="w-full pt-16 bg-slate-50 flex-1 flex flex-col">
          {/* Top Bar for Workspace */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Document Verification Workspace
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  {currentAppId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scrutinize statutory documents, examine real text extractions (PyMuPDF & RapidOCR), and record verification status.
              </p>
            </div>

            {/* Actions & Connection Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors shadow-sm cursor-pointer"
              >
                <MaterialIcon name="upload_file" className="text-[16px]" />
                <span>Upload Statutory Document</span>
              </button>

              {activeDoc.isLive && (
                <button
                  type="button"
                  onClick={handleReprocess}
                  disabled={isReprocessing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  title="Trigger real document text extraction and OCR reprocessing"
                >
                  <MaterialIcon
                    name="sync"
                    className={`text-[16px] text-gov-navy ${isReprocessing ? 'animate-spin' : ''}`}
                  />
                  <span>{isReprocessing ? 'Processing OCR...' : 'Reprocess Document'}</span>
                </button>
              )}

              {/* Backend Status indicator */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs"
                title={`Database Persistence: ${backendHealth}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendHealth === 'connected'
                      ? 'bg-teal-600'
                      : backendHealth === 'degraded'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-[11px] font-medium">
                  {backendHealth === 'connected'
                    ? 'Registry Connected'
                    : backendHealth === 'degraded'
                    ? 'Offline Mode'
                    : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Notification Banner */}
          {actionNotice && (
            <div className="bg-teal-50 border-b border-teal-200 text-teal-800 px-4 py-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <MaterialIcon name="check_circle" className="text-teal-600 text-[16px]" />
                {actionNotice}
              </span>
              <button onClick={() => setActionNotice(null)} className="text-teal-700 font-bold cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {/* Mobile Panel Switcher Bar (< lg screens) */}
          <div className="lg:hidden flex border-b border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMobileWorkspaceTab('documents')}
              className={`flex-1 py-1.5 text-center rounded transition-colors ${
                mobileWorkspaceTab === 'documents'
                  ? 'bg-gov-navy text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Document List ({filteredDocs.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileWorkspaceTab('viewer')}
              className={`flex-1 py-1.5 text-center rounded transition-colors ${
                mobileWorkspaceTab === 'viewer'
                  ? 'bg-gov-navy text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Document Viewer
            </button>
            <button
              type="button"
              onClick={() => setMobileWorkspaceTab('details')}
              className={`flex-1 py-1.5 text-center rounded transition-colors ${
                mobileWorkspaceTab === 'details'
                  ? 'bg-gov-navy text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extracted Data
            </button>
          </div>

          {/* 3-Panel Main Workspace Container */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-125px)]">
            {/* PANEL 1: Document Selector (3 cols) */}
            <div
              className={`${
                mobileWorkspaceTab === 'documents' ? 'flex' : 'hidden'
              } lg:flex lg:col-span-3 border-r border-slate-200 bg-white flex-col h-full overflow-hidden`}
            >
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Document Checklist ({filteredDocs.length})
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Format: PDF (Max 10 MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-2 py-1 rounded bg-gov-navy text-white text-[11px] font-semibold hover:bg-gov-navy-light cursor-pointer"
                >
                  + Add
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="p-2 border-b border-slate-200 flex flex-wrap gap-1 bg-slate-50/50 text-[11px]">
                {['all', 'Land', 'Safety', 'Academic', 'Lab'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                      categoryFilter.toLowerCase() === cat.toLowerCase()
                        ? 'bg-gov-navy text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>

              {/* Document List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                {filteredDocs.map((doc) => {
                  const isSelected = doc.id === activeDoc.id;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleSelectDoc(doc.id)}
                      className={`w-full text-left p-2.5 rounded-md transition-all flex flex-col gap-1 cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-50 border-gov-navy ring-1 ring-gov-navy'
                          : 'bg-white border-slate-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 text-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {doc.title}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {doc.size}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate">{doc.category}</span>
                        {doc.isLive ? (
                          <span
                            className={`font-mono font-semibold text-[10px] ${
                              doc.processingStatus === 'processed'
                                ? 'text-teal-700'
                                : doc.processingStatus === 'failed'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {doc.processingStatus === 'processed'
                              ? 'Text Processed'
                              : doc.processingStatus === 'processing'
                              ? 'Extracting OCR...'
                              : doc.processingStatus === 'failed'
                              ? 'Failed'
                              : 'Queued'}
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 text-[10px]">
                            Exemplar Record
                          </span>
                        )}
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <StatusBadge status={doc.status} size="sm" />
                        {doc.isLive ? (
                          <span className="text-[10px] font-mono text-gov-navy bg-slate-100 px-1 rounded border border-slate-200">
                            Live Upload
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1 rounded border border-slate-200">
                            Baseline
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PANEL 2: Interactive Document Viewer (5 cols) */}
            <div
              className={`${
                mobileWorkspaceTab === 'viewer' ? 'flex' : 'hidden'
              } lg:flex lg:col-span-5 flex-col h-full bg-slate-100/70 border-r border-slate-200 overflow-hidden`}
            >
              {/* Viewer Control Toolbar */}
              <div className="p-2 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                    {activeDoc.title}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 rounded border border-slate-200 shrink-0">
                    {activeDoc.type}
                  </span>
                  {activeDoc.isLive && (
                    <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-1.5 rounded border border-teal-200 font-semibold shrink-0">
                      Live
                    </span>
                  )}
                </div>

                {/* Page Navigation Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    <button
                      type="button"
                      disabled={currentPageNumber <= 1}
                      onClick={() => setCurrentPageNumber((p) => Math.max(1, p - 1))}
                      className="p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                      title="Previous Page"
                    >
                      <MaterialIcon name="chevron_left" className="text-[16px]" />
                    </button>
                    <span className="font-mono text-[11px] text-slate-700 px-1">
                      {currentPageNumber} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPageNumber >= totalPages}
                      onClick={() => setCurrentPageNumber((p) => Math.min(totalPages, p + 1))}
                      className="p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                      title="Next Page"
                    >
                      <MaterialIcon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>
                )}

                {/* Zoom & Rotation Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Zoom Out"
                  >
                    <MaterialIcon name="zoom_out" className="text-[16px]" />
                  </button>
                  <span className="font-mono text-[11px] text-slate-700 w-9 text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Zoom In"
                  >
                    <MaterialIcon name="zoom_in" className="text-[16px]" />
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Rotate Document"
                  >
                    <MaterialIcon name="rotate_right" className="text-[16px]" />
                  </button>
                </div>
              </div>

              {/* Document Visual Display Area */}
              <div className="flex-1 p-4 overflow-auto flex items-start justify-center">
                {activeDoc.isLive ? (
                  /* LIVE DOCUMENT DISPLAY (Real PyMuPDF + RapidOCR Extraction) */
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="bg-white border border-slate-300 shadow-sm rounded-md p-5 max-w-lg w-full min-h-[480px] flex flex-col justify-between text-slate-800 text-xs"
                  >
                    {isProcessingLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
                        <MaterialIcon name="hourglass_top" className="text-3xl text-gov-navy animate-spin" />
                        <div className="font-semibold text-slate-700 text-sm">
                          Loading Extracted Text Pipeline...
                        </div>
                        <p className="text-xs text-slate-500 text-center max-w-xs">
                          Retrieving real document processing and OCR results from the FastAPI backend.
                        </p>
                      </div>
                    ) : processingError ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-3 text-rose-700">
                        <MaterialIcon name="error_outline" className="text-3xl text-rose-600" />
                        <div className="font-bold text-sm">Text Extraction Failed</div>
                        <p className="text-xs text-slate-600 text-center max-w-xs">
                          {processingError}
                        </p>
                        <button
                          type="button"
                          onClick={handleReprocess}
                          disabled={isReprocessing}
                          className="px-3 py-1.5 rounded bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light cursor-pointer"
                        >
                          {isReprocessing ? 'Retrying...' : 'Retry Extraction & OCR'}
                        </button>
                      </div>
                    ) : processingResult?.processing_status === 'processing' ? (
                      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
                        <MaterialIcon name="document_scanner" className="text-3xl text-amber-600 animate-pulse" />
                        <div className="font-semibold text-slate-800 text-sm">
                          RapidOCR &amp; Document Text Extraction in Progress...
                        </div>
                        <p className="text-xs text-slate-500 text-center max-w-xs">
                          The document processing pipeline is currently rendering and scanning pages with RapidOCR. Results will refresh automatically.
                        </p>
                      </div>
                    ) : processingResult ? (
                      <div className="space-y-3">
                        {/* Letterhead Banner */}
                        <div className="border-b border-slate-200 pb-2.5 flex items-start justify-between">
                          <div>
                            <div className="font-bold text-gov-navy uppercase tracking-wider text-[11px]">
                              {activeDoc.issuingAuthority}
                            </div>
                            <div className="font-bold text-sm text-slate-900 mt-0.5">
                              {activeDoc.originalFilename || activeDoc.title}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              Doc ID: {activeDoc.id}
                            </div>
                          </div>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            Page {currentPageNumber} of {totalPages}
                          </span>
                        </div>

                        {/* Real Extraction Method Badge for Active Page */}
                        {activePageData && (
                          <div
                            className={`p-2.5 rounded border text-xs flex items-start gap-2 ${
                              activePageData.extraction_method === 'ocr'
                                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                : activePageData.extraction_method === 'native'
                                ? 'bg-teal-50/70 border-teal-200 text-teal-950'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <MaterialIcon
                              name={
                                activePageData.extraction_method === 'ocr'
                                  ? 'document_scanner'
                                  : activePageData.extraction_method === 'native'
                                  ? 'description'
                                  : 'crop_free'
                              }
                              className={`text-[18px] shrink-0 ${
                                activePageData.extraction_method === 'ocr'
                                  ? 'text-amber-700'
                                  : activePageData.extraction_method === 'native'
                                  ? 'text-teal-700'
                                  : 'text-slate-500'
                              }`}
                            />
                            <div className="space-y-0.5 flex-1">
                              <div className="font-bold flex items-center justify-between">
                                <span>
                                  {activePageData.extraction_method === 'ocr'
                                    ? 'Scanned Page — RapidOCR Optical Recognition Applied'
                                    : activePageData.extraction_method === 'native'
                                    ? 'Digital PDF Stream — PyMuPDF Native Extraction'
                                    : 'Empty Page / No Characters Detected'}
                                </span>
                                <span className="font-mono text-[10px] font-normal text-slate-600">
                                  {activePageData.char_count} chars · {activePageData.word_count} words
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                {activePageData.extraction_method === 'ocr'
                                  ? 'Native embedded font glyphs were absent or below statutory threshold (<50 chars). 150 DPI pixmap rendered and scanned with RapidOCR onnxruntime.'
                                  : activePageData.extraction_method === 'native'
                                  ? 'Extracted directly from digital font glyph stream with 100% vector accuracy.'
                                  : 'No embedded digital text or legible OCR characters detected on this page.'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Page Selector Tabs if Multi-Page */}
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                            <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                              Select Page:
                            </span>
                            {processingResult.pages.map((p) => (
                              <button
                                key={p.page_number}
                                type="button"
                                onClick={() => setCurrentPageNumber(p.page_number)}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                                  p.page_number === currentPageNumber
                                    ? 'bg-gov-navy text-white border-gov-navy'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                P.{p.page_number} {p.extraction_method === 'ocr' ? '(OCR)' : '(Native)'}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Real Extracted Text Container */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                            <span>Extracted Character Stream</span>
                            <span className="text-[10px] font-normal font-mono text-slate-400">
                              UTF-8 Decoded
                            </span>
                          </div>
                          <pre className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto select-text font-normal shadow-inner">
                            {activePageData?.text && activePageData.text.trim().length > 0
                              ? activePageData.text
                              : '(No printable characters detected on this page.)'}
                          </pre>
                        </div>

                        {/* Verification Candidate Notice Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>SHA-256: {activeDoc.shaHash.slice(0, 16)}...</span>
                          <span className="text-amber-800 font-semibold bg-amber-50 px-1 rounded border border-amber-200">
                            Unverified Candidate Observation
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center text-slate-500">
                        Awaiting text extraction results...
                      </div>
                    )}
                  </div>
                ) : (
                  /* BASELINE EXEMPLAR DISPLAY */
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="bg-white border border-slate-300 shadow-sm rounded-md p-6 max-w-md w-full min-h-[460px] flex flex-col justify-between text-slate-800 text-xs select-none"
                  >
                    <div className="space-y-4">
                      {/* Exemplar Notice */}
                      <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-700 flex items-center gap-1.5">
                        <MaterialIcon name="info" className="text-slate-500 text-[16px] shrink-0" />
                        <span>
                          Demonstration Baseline Record. Upload a PDF using the button above to test real PyMuPDF & RapidOCR extraction.
                        </span>
                      </div>

                      {/* Simulated Document Letterhead */}
                      <div className="text-center border-b border-slate-200 pb-3 space-y-0.5">
                        <div className="font-bold text-gov-navy uppercase tracking-wider text-[11px]">
                          {activeDoc.issuingAuthority}
                        </div>
                        <div className="font-bold text-sm text-slate-900">
                          {activeDoc.title}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          Certificate / Record No: {activeDoc.certificateNumber}
                        </div>
                      </div>

                      {/* Document Meta Row */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div>
                          <span className="text-slate-500 block">Issue Date:</span>
                          <span className="font-semibold text-slate-800">{activeDoc.issueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Statutory Validity:</span>
                          <span className="font-semibold text-slate-800">{activeDoc.expiryDate}</span>
                        </div>
                      </div>

                      {/* Document Summary */}
                      <div className="text-xs text-slate-600 leading-relaxed border-l-2 border-gov-navy pl-3 py-1 bg-slate-50/50">
                        {activeDoc.summary}
                      </div>

                      {/* Official Stamp / Seal Emulation */}
                      <div className="pt-4 flex items-center justify-between text-[10px] text-slate-500">
                        <div className="border border-slate-300 p-2 rounded text-center">
                          <div className="font-bold text-slate-700">OFFICIAL SEAL</div>
                          <div>Department Registry</div>
                        </div>
                        <div className="text-right">
                          <div>Digitally Recorded</div>
                          <div className="font-mono text-[9px] text-slate-400">
                            {activeDoc.shaHash.slice(0, 18)}...
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Baseline Exemplar P.1 of 1</span>
                      <span>AICTE Regulatory Clearing</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PANEL 3: Extracted Information & Verification Findings (4 cols) */}
            <div
              className={`${
                mobileWorkspaceTab === 'details' ? 'flex' : 'hidden'
              } lg:flex lg:col-span-4 flex-col h-full bg-white overflow-y-auto p-4 space-y-4 text-xs`}
            >
              <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Verification Details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Distinction between submitted, extracted, and verified data
                  </p>
                </div>
                <StatusBadge status={activeDoc.status} />
              </div>

              {/* Section 1: Uploaded Document Metadata */}
              <div className="p-3 rounded-md border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="text-[11px] font-bold text-gov-navy uppercase tracking-wider flex items-center justify-between">
                  <span>1. Uploaded Document Metadata</span>
                  {activeDoc.isLive && (
                    <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-1 rounded border border-teal-200 font-normal">
                      Verified Magic Bytes
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Title:</span>
                    <span className="font-medium text-slate-900 truncate max-w-[200px]" title={activeDoc.title}>
                      {activeDoc.title}
                    </span>
                  </div>
                  {activeDoc.originalFilename && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Original File:</span>
                      <span className="font-mono text-[11px] text-slate-900 truncate max-w-[200px]" title={activeDoc.originalFilename}>
                        {activeDoc.originalFilename}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-900">{activeDoc.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">File Size:</span>
                    <span className="font-mono text-slate-900">{activeDoc.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issuing Authority:</span>
                    <span className="text-slate-900">{activeDoc.issuingAuthority}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block text-[10px]">Cryptographic Digest (SHA-256):</span>
                    <div className="font-mono text-[10px] text-slate-700 break-all bg-white p-1 rounded border border-slate-200 mt-0.5 select-all">
                      {activeDoc.shaHash}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Automated Text Extraction & Candidate Fields */}
              <div className="p-3 rounded-md border border-slate-200 bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gov-navy uppercase tracking-wider">
                    2. Automated Text Extraction
                  </span>
                  {activeDoc.isLive ? (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                        processingResult?.processing_status === 'processed'
                          ? 'text-teal-800 bg-teal-50 border-teal-200'
                          : processingResult?.processing_status === 'failed'
                          ? 'text-rose-800 bg-rose-50 border-rose-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {processingResult?.processing_status ? processingResult.processing_status.toUpperCase() : 'QUEUED'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      Exemplar Data
                    </span>
                  )}
                </div>

                {/* Statutory Candidate Notice Box */}
                <div className="p-2.5 rounded bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-[11px] text-amber-900">
                    <MaterialIcon name="verified_user" className="text-[15px] text-amber-700" />
                    <span>Statutory Candidate Disclaimer</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-normal">
                    Extracted text and candidate fields are unverified computer observations to assist regulatory scrutiny. Official approval requires verification against physical records.
                  </p>
                </div>

                {/* Real Processing Statistics Grid (for Live Uploads) */}
                {activeDoc.isLive && processingResult && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Total Pages:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {processingResult.total_pages} page(s)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Method:</span>
                      <span className="font-semibold text-slate-800">
                        {processingResult.native_pages_count > 0 && processingResult.ocr_pages_count > 0
                          ? 'Mixed (Native + OCR)'
                          : processingResult.ocr_pages_count > 0
                          ? 'RapidOCR (Scanned)'
                          : 'PyMuPDF (Native)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Characters:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {processingResult.total_char_count.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Words:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {processingResult.total_word_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Candidate Extracted Observations */}
                <div className="space-y-1.5 divide-y divide-slate-100">
                  {activeDoc.isLive ? (
                    candidateObservations.length > 0 ? (
                      candidateObservations.map((obs, i) => (
                        <div key={i} className="pt-1.5 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">{obs.label}:</span>
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1 rounded border border-amber-200">
                              Candidate
                            </span>
                          </div>
                          <div className="font-medium text-slate-900 text-[11px] break-words">
                            {obs.value}
                          </div>
                          <span className="text-[10px] text-slate-400 italic">
                            {obs.confidenceNote}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-2 text-center text-slate-500 text-[11px]">
                        {isProcessingLoading
                          ? 'Extracting candidate fields...'
                          : 'No specific statutory tokens identified in raw character stream.'}
                      </div>
                    )
                  ) : (
                    activeDoc.extractedFields.map((field, i) => (
                      <div key={i} className="pt-1.5 flex items-start justify-between gap-2">
                        <span className="text-slate-500 text-[11px]">{field.label}:</span>
                        <div className="text-right">
                          <span className="font-medium text-[11px] text-slate-900 block">
                            {field.value}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Exemplar Observation
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reprocess Button for Live Document */}
                {activeDoc.isLive && (
                  <button
                    type="button"
                    onClick={handleReprocess}
                    disabled={isReprocessing}
                    className="w-full mt-2 py-1.5 px-3 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <MaterialIcon
                      name="refresh"
                      className={`text-[14px] ${isReprocessing ? 'animate-spin text-gov-navy' : 'text-slate-600'}`}
                    />
                    <span>{isReprocessing ? 'Reprocessing Text Pipeline...' : 'Reprocess Text Extraction & OCR'}</span>
                  </button>
                )}
              </div>

              {/* Section 3: Official Decision Actions */}
              <div className="p-3 rounded-md border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-[11px] font-bold text-gov-navy uppercase tracking-wider">
                  3. Scrutiny Committee Action
                </div>
                <p className="text-[11px] text-slate-600">
                  Record official committee verification or issue a deficiency notice with statutory explanation.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAction(`Endorsed '${activeDoc.title}' as Verified.`)}
                    className="px-2.5 py-1.5 rounded bg-teal-800 text-white text-xs font-semibold hover:bg-teal-900 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <MaterialIcon name="check" className="text-[14px]" />
                    <span>Verify Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(`Issued Deficiency Notice for '${activeDoc.title}'.`)}
                    className="px-2.5 py-1.5 rounded bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <MaterialIcon name="flag" className="text-[14px]" />
                    <span>Flag Deficiency</span>
                  </button>
                </div>
              </div>

              {/* Links to Compliance & Reports */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <Link
                  to="/compliance"
                  className="text-gov-navy font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  <MaterialIcon name="rule" className="text-[14px]" />
                  <span>Compliance Check</span>
                </Link>
                <Link
                  to="/reports"
                  className="text-gov-navy font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  <MaterialIcon name="summarize" className="text-[14px]" />
                  <span>Evidence Report</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultApplicationId={currentAppId}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};
