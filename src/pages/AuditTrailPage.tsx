import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';

interface AuditEvent {
  id: string;
  applicationId: string;
  timestamp: string;
  time: string;
  category: 'submission' | 'document' | 'validation' | 'reviewer' | 'status';
  categoryLabel: string;
  title: string;
  actor: string;
  role: string;
  description: string;
  hash: string;
  ipAddress: string;
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: 'EVT-1008',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '22 Oct 2026',
    time: '16:05:12 IST',
    category: 'reviewer',
    categoryLabel: 'Reviewer Action',
    title: 'Scrutiny Committee Hearing Slot Scheduled',
    actor: 'Dr. Anand Kumar',
    role: 'Regional Regulatory Officer, Southern Camp',
    description:
      'Scheduled institutional hearing under Southern Regional Office Committee Bench 3 for resolution of Fluid Mechanics Lab EXIF photo and NAAC certificate undertaking.',
    hash: '0xaa4278b919de4421bca9082103f192b1928374a981273928192a8b9812739281',
    ipAddress: '10.24.18.92 (NIC Intranet)',
  },
  {
    id: 'EVT-1007',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '21 Oct 2026',
    time: '11:15:40 IST',
    category: 'status',
    categoryLabel: 'Status Transition',
    title: 'Application Status Updated to Deficiency Identified (2 Items)',
    actor: 'Approval Bureau Review System',
    role: 'Automated Regulatory Scrutiny Daemon',
    description:
      'Application status transitioned from Under Initial Review to Deficiency Identified following photo EXIF metadata absence and expired NAAC accreditation.',
    hash: '0x17fa2b0918237498192083910283910293819203810293810293810293810293',
    ipAddress: '10.0.4.1 (AICTE Central Server)',
  },
  {
    id: 'EVT-1006',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '20 Oct 2026',
    time: '18:42:19 IST',
    category: 'validation',
    categoryLabel: 'Automated Verification',
    title: 'CAD Carpet Area & Building Overlay Verified',
    actor: 'Automated Spatial Analysis Subsystem',
    role: 'Computer Vision Scrutiny Service',
    description:
      'Extracted 38,420 sq.m built-up area across Blocks A, B, and C against PWD approved floor plans. 2.0m fire exit stairways confirmed.',
    hash: '0x8839102938102938102938102938102938102938102938102938102938102938',
    ipAddress: '10.0.4.5 (Spatial Inference Node)',
  },
  {
    id: 'EVT-1005',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '19 Oct 2026',
    time: '14:10:02 IST',
    category: 'document',
    categoryLabel: 'Document Upload',
    title: 'Fire & Rescue Services NOC & PWD Certificate Uploaded',
    actor: 'Admin (SVCE)',
    role: 'Institutional Applicant Representative',
    description:
      'Uploaded certified PDF of Fire Safety NOC (DFRS-NOC-2025-1102) and Superintending Engineer PWD Structural Stability Certificate.',
    hash: '0xbb2938a192837491029381029381029381029381029381029381029381029381',
    ipAddress: '182.73.12.44 (SVCE Campus IP)',
  },
  {
    id: 'EVT-1004',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '18 Oct 2026',
    time: '09:30:15 IST',
    category: 'validation',
    categoryLabel: 'Automated Verification',
    title: 'Optical Text Extraction on Land Freehold Deed',
    actor: 'Automated Document Review Service',
    role: 'Text Extraction & Analysis Daemon',
    description:
      'Extracted 12.40 Acres across Survey Nos. 42/1B, 42/2, 43/1A with 99.4% precision. Zero encumbrance confirmed against state revenue records.',
    hash: '0x3c99f1a8842e1091823749819283749102938102938102938102938102938102',
    ipAddress: '10.0.4.2 (Extraction Node 1)',
  },
  {
    id: 'EVT-1003',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '17 Oct 2026',
    time: '16:22:48 IST',
    category: 'document',
    categoryLabel: 'Document Upload',
    title: 'Land Title Registered Deed & Cadastral GIS Polygon Uploaded',
    actor: 'Admin (SVCE)',
    role: 'Institutional Applicant Representative',
    description:
      'Uploaded 14-page freehold deed (TN-KPM-DEED-2018-9941) and ESRI shapefile cadastral boundary map.',
    hash: '0x8a92f8c4491b2e19283749102938102938102938102938102938102938102938',
    ipAddress: '182.73.12.44 (SVCE Campus IP)',
  },
  {
    id: 'EVT-1002',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '16 Oct 2026',
    time: '11:05:30 IST',
    category: 'validation',
    categoryLabel: 'Automated Verification',
    title: 'Faculty Biometric & APAAR Teacher Registry Reconciled',
    actor: 'National Faculty Database Sync',
    role: 'MeitY Biometric API Gateway',
    description:
      '142 faculty Aadhaar credentials reconciled against APAAR teacher registry. Overall Student-to-Faculty Ratio computed at 1:13.8.',
    hash: '0x6619283749102938102938102938102938102938102938102938102938102938',
    ipAddress: '10.12.0.8 (National API Gateway)',
  },
  {
    id: 'EVT-1001',
    applicationId: 'AICTE-EOA-2026-001',
    timestamp: '15 Jan 2026',
    time: '14:22:00 IST',
    category: 'submission',
    categoryLabel: 'Application Submission',
    title: 'Initial Application Submission for AY 2026–27',
    actor: 'Admin (SVCE)',
    role: 'Institutional Applicant Representative',
    description:
      'Extension of Approval and Increase in Intake application (AICTE-EOA-2026-001) filed online. Bharatkosh fee transaction verified.',
    hash: '0x8f2ac41928374910293810293810293810293810293810293810293810293810',
    ipAddress: '182.73.12.44 (SVCE Campus IP)',
  },
];

export const AuditTrailPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredEvents = mockAuditEvents.filter((evt) => {
    const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.applicationId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleExport = () => {
    const headers = 'Event ID,Timestamp,Category,Title,Application ID,Actor,Role,Description,Hash,IP Address\n';
    const rows = filteredEvents
      .map(
        (e) =>
          `"${e.id}","${e.timestamp} ${e.time}","${e.categoryLabel}","${e.title}","${e.applicationId}","${e.actor}","${e.role}","${e.description}","${e.hash}","${e.ipAddress}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_Review_History_Audit_Log_AY2026-27.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported ${filteredEvents.length} audit log entries to CSV.`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="audit-trail"
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader
          role="aicte"
          userName="Dr. R. Sharma"
          userRoleTitle="Director, Approval Bureau"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="w-full pt-16 bg-slate-50 flex-1">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            {/* Page Header */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gov-navy">
                  <MaterialIcon name="history_edu" className="text-[16px]" />
                  <span>Central Regulatory Ledger • Immutable Audit Record</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Review History &amp; Audit Log
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  Chronological record of statutory submissions, document uploads, automated verification runs,
                  deficiency notices, and scrutiny committee decisions for AY 2026–27.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-3.5 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="download" className="text-[16px] text-gov-navy" />
                  <span>Export Audit Log</span>
                </button>
              </div>
            </div>

            {/* Notification Alert */}
            {exportNotice && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-4 py-2.5 rounded-md flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MaterialIcon name="check_circle" className="text-teal-600 text-[16px]" />
                  {exportNotice}
                </span>
                <button onClick={() => setExportNotice(null)} className="text-teal-700 font-bold">✕</button>
              </div>
            )}

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <MaterialIcon
                    name="search"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Action, User, Application ID, or Digest..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gov-navy transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <span>Displaying {filteredEvents.length} of {mockAuditEvents.length} events</span>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="font-medium text-slate-500 mr-1 text-[11px] uppercase tracking-wider">
                  Event Category:
                </span>
                {[
                  { key: 'all', label: 'All Events' },
                  { key: 'submission', label: 'Submissions' },
                  { key: 'document', label: 'Document Uploads' },
                  { key: 'validation', label: 'Automated Verifications' },
                  { key: 'reviewer', label: 'Reviewer Actions' },
                  { key: 'status', label: 'Status Transitions' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategoryFilter(item.key)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      categoryFilter === item.key
                        ? 'bg-gov-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Professional Audit Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-2.5 px-3">Date &amp; Timestamp</th>
                      <th className="py-2.5 px-3">Application ID</th>
                      <th className="py-2.5 px-3">Action &amp; Category</th>
                      <th className="py-2.5 px-3">User / Actor</th>
                      <th className="py-2.5 px-3">Action Details</th>
                      <th className="py-2.5 px-3 text-right">Audit Digest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{evt.timestamp}</div>
                          <div className="font-mono text-[11px] text-slate-500">{evt.time}</div>
                        </td>

                        <td className="py-3 px-3 font-mono font-semibold text-gov-navy whitespace-nowrap">
                          {evt.applicationId}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 leading-snug">
                            {evt.title}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-600">
                            {evt.categoryLabel}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{evt.actor}</div>
                          <div className="text-[11px] text-slate-500">{evt.role}</div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 max-w-xs sm:max-w-md leading-relaxed">
                          {evt.description}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Source: {evt.ipAddress}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {evt.hash.slice(0, 10)}...
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyHash(evt.hash)}
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="Copy Full SHA-256 Digest"
                            >
                              <MaterialIcon
                                name={copiedHash === evt.hash ? 'check' : 'content_copy'}
                                className="text-[14px]"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
