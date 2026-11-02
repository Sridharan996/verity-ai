import React, { useState, useRef } from 'react';
import { MaterialIcon } from './MaterialIcon';
import {
  uploadDocument,
  DocumentMetadata,
  formatFileSize,
  formatCategoryLabel,
  ApiError,
} from '../../services/documentApi';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultApplicationId?: string;
  defaultInstitutionId?: string;
  defaultCategory?: string;
  onUploadSuccess: (metadata: DocumentMetadata) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'land_deed', label: 'Land Title Registered Deed (Freehold)' },
  { value: 'cadastral_map', label: 'Cadastral GIS Boundary Map' },
  { value: 'pwd_safety', label: 'PWD Structural Stability & Safety Certificate' },
  { value: 'fire_noc', label: 'Directorate Fire & Rescue Services NOC' },
  { value: 'building_plan', label: 'Approved Municipal Building Plan' },
  { value: 'aicte_affidavit', label: 'AICTE Statutory Affidavit & Undertaking' },
  { value: 'faculty_cadre', label: 'Faculty Cadre Roll & Service Register' },
  { value: 'experience_records', label: 'Faculty Experience & APAAR Biometric Sync' },
  { value: 'salary_disbursal', label: 'Form 16 & Bank Salary Disbursal Statement' },
  { value: 'water_noc', label: 'State Pollution Control & Water NOC' },
  { value: 'other', label: 'Other Statutory Proof Document' },
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  defaultApplicationId = 'AICTE-EOA-2026-001',
  defaultInstitutionId = 'INST-TN-8841',
  defaultCategory = 'land_deed',
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [applicationId, setApplicationId] = useState(defaultApplicationId);
  const [institutionId, setInstitutionId] = useState(defaultInstitutionId);
  const [documentCategory, setDocumentCategory] = useState(defaultCategory);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<DocumentMetadata | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setApplicationId(defaultApplicationId);
      setInstitutionId(defaultInstitutionId);
      setDocumentCategory(defaultCategory);
      setSelectedFile(null);
      setErrorMessage(null);
      setSuccessResult(null);
    }
  }, [isOpen, defaultApplicationId, defaultInstitutionId, defaultCategory]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    setSuccessResult(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid file format: Only official PDF documents (.pdf) are accepted.');
      return;
    }

    // Validate size (10 MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(
        `File size (${formatFileSize(file.size)}) exceeds the maximum statutory limit of 10 MB.`
      );
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please choose a valid PDF document.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a statutory PDF document to upload.');
      return;
    }

    if (!applicationId.trim()) {
      setErrorMessage('Application ID cannot be empty.');
      return;
    }

    if (!institutionId.trim()) {
      setErrorMessage('Institution ID cannot be empty.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      const response = await uploadDocument({
        file: selectedFile,
        applicationId: applicationId.trim(),
        institutionId: institutionId.trim(),
        documentCategory,
      });

      setSuccessResult(response.document);
      onUploadSuccess(response.document);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred during document upload.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetModal = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
    >
      <div className="bg-white border border-slate-300 rounded-lg shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gov-navy text-white flex items-center justify-center shadow-sm">
              <MaterialIcon name="upload_file" className="text-[18px]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Upload Statutory Document
              </h3>
              <p className="text-[11px] text-slate-500">
                Central Document Registry • AICTE Review Desk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <MaterialIcon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Success State */}
          {successResult && (
            <div className="p-3.5 rounded-md bg-teal-50 border border-teal-300 space-y-2">
              <div className="flex items-center gap-2 text-teal-900">
                <MaterialIcon name="check_circle" className="text-[20px] text-teal-700" />
                <h4 className="text-xs font-bold">
                  Document Registered &amp; Hashed Successfully
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded border border-teal-200">
                <div>
                  <span className="text-slate-500">Document ID:</span>
                  <div className="font-mono font-bold text-slate-900 break-all">
                    {successResult.document_id}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Original Filename:</span>
                  <div className="font-medium text-slate-900 truncate">
                    {successResult.original_filename}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Category:</span>
                  <div className="font-medium text-slate-900">
                    {formatCategoryLabel(successResult.document_category)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">File Size:</span>
                  <div className="font-mono text-slate-900">
                    {formatFileSize(successResult.file_size)}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">SHA-256 Digest:</span>
                  <div className="font-mono text-[10px] text-slate-700 break-all bg-slate-50 p-1 rounded border border-slate-200">
                    {successResult.sha256_hash}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="px-3 py-1.5 rounded bg-white border border-teal-300 text-teal-900 text-xs font-medium hover:bg-teal-100 cursor-pointer"
                >
                  Upload Another Document
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded bg-teal-800 text-white text-xs font-medium hover:bg-teal-900 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2">
              <MaterialIcon name="error" className="text-rose-700 text-[18px] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Upload Error</div>
                <div className="text-[11px] mt-0.5">{errorMessage}</div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {!successResult && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={documentCategory}
                  onChange={(e) => setDocumentCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gov-navy cursor-pointer"
                  disabled={isUploading}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Application & Institution IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-gov-navy"
                    disabled={isUploading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-gov-navy"
                    disabled={isUploading}
                    required
                  />
                </div>
              </div>

              {/* Drag and drop upload zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statutory PDF Document <span className="text-rose-600">*</span>
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-md p-5 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-gov-navy bg-slate-50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <MaterialIcon name="cloud_upload" className="text-3xl text-gov-navy mb-1" />
                  <div className="font-semibold text-slate-800 text-xs">
                    {selectedFile ? selectedFile.name : 'Click to select or drag and drop statutory PDF'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Accepted format: <strong>PDF (.pdf) only</strong> • Maximum file size: <strong>10 MB</strong>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-xs font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded inline-block border border-teal-200">
                      Selected: {formatFileSize(selectedFile.size)}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 text-xs hover:bg-slate-100 cursor-pointer"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-1.5 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <MaterialIcon name="sync" className="animate-spin text-[14px]" />
                      <span>Hashing &amp; Uploading...</span>
                    </>
                  ) : (
                    <>
                      <MaterialIcon name="upload" className="text-[14px]" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
