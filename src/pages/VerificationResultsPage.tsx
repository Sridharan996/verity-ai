import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { isOfficial } from '../services/authSession';

interface AuditFinding {
  id: string;
  category: string;
  sourceDoc: string;
  sourceDocId?: string;
  finding: string;
  severity: 'high' | 'moderate' | 'low';
  impact: string;
  recommendation: string;
  officialDecision?: string;
  isDecided?: boolean;
}

const mockFindings: AuditFinding[] = [
  {
    id: 'FND-01',
    category: 'Infrastructure Verification',
    sourceDoc: 'Fluid Mechanics Lab Photos (DOC-06)',
    sourceDocId: 'doc-lab-fluid',
    finding: 'Photographic evidence lacks embedded GPS EXIF coordinate metadata and timestamp hash.',
    severity: 'high',
    impact: 'Stalls automated computer vision sign-off under Appendix 5.',
    recommendation: 'Issue deficiency notice for re-upload with geotagged coordinates.',
    officialDecision: 'Deficiency Notice Drafted • Awaiting Institution Re-Upload',
    isDecided: true,
  },
  {
    id: 'FND-02',
    category: 'Faculty Cadre & Ratio',
    sourceDoc: 'Faculty Cadre Roll vs AISHE Data',
    finding: 'Shortfall of 2 Associate Professors in Department of AI & Data Science (Ratio 1:1:8 vs required 1:2:6).',
    severity: 'moderate',
    impact: 'Cadre hierarchy shortfall under AICTE Approval Process Handbook Clause 7.2.3.',
    recommendation: 'Allow 60-day institutional undertaking for faculty recruitment before next semester.',
    officialDecision: 'Provisional Undertaking Accepted Pending Scrutiny Hearing',
    isDecided: true,
  },
  {
    id: 'FND-03',
    category: 'Document Verification',
    sourceDoc: 'NAAC Accreditation Certificate (DOC-05)',
    sourceDocId: 'doc-affidavit',
    finding: 'Accreditation cycle expired on 11 Mar 2026. Provisional IIQA submission receipt verified.',
    severity: 'moderate',
    impact: 'May restrict entitlement for 10% supernumerary seat quota.',
    recommendation: 'Accept provisional undertaking pending Peer Team Visit outcome.',
    officialDecision: 'Decision Pending Committee Review',
    isDecided: false,
  },
  {
    id: 'FND-04',
    category: 'Land & Spatial Verification',
    sourceDoc: 'State Revenue & Survey of India GIS Registry',
    sourceDocId: 'doc-land',
    finding: '12.40 Acres verified as continuous single parcel with zero perimeter encumbrance.',
    severity: 'low',
    impact: 'Full statutory compliance with institutional land norms.',
    recommendation: 'Endorse land title requirement without further hearing.',
    officialDecision: 'Statutory Land Title Cleared & Endorsed',
    isDecided: true,
  },
  {
    id: 'FND-05',
    category: 'Safety & Clearances',
    sourceDoc: 'PWD Stability & Fire Services NOC (DOC-03, DOC-04)',
    sourceDocId: 'doc-pwd',
    finding: 'Valid structural stability certified through Oct 2027 and Fire NOC verified through Nov 2026.',
    severity: 'low',
    impact: '100% building safety clearance satisfied.',
    recommendation: 'Endorse building safety audit dossier.',
    officialDecision: 'Building Safety Cleared',
    isDecided: true,
  },
];

export const VerificationResultsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [decisionNotice, setDecisionNotice] = useState<string | null>(null);

  const filteredFindings = mockFindings.filter((item) => {
    if (severityFilter === 'all') return true;
    return item.severity === severityFilter;
  });

  const handleDecision = (text: string) => {
    setDecisionNotice(text);
    setTimeout(() => setDecisionNotice(null), 4000);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="verification-results"
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
                  <MaterialIcon name="fact_check" className="text-[16px]" />
                  <span>Regulatory Verification Summary • Scrutiny Bureau</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Verification Summary &amp; Decision Record
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  Synthesized verification summary for application <strong>AICTE-EOA-2026-001</strong> (Sri Venkateswara College of Engineering).
                  Automated review findings are linked to primary evidence documents and distinguished from official Scrutiny Committee decisions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to="/reports"
                  className="px-3.5 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <MaterialIcon name="summarize" className="text-[16px] text-gov-navy" />
                  <span>Generate Official Report</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDecision('Formally Endorsed Statutory Approval Order AY 2026-27.')}
                  className="px-3.5 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="verified" className="text-[16px]" />
                  <span>Record Official Decision</span>
                </button>
              </div>
            </div>

            {/* Notification Alert */}
            {decisionNotice && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-4 py-2.5 rounded-md flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MaterialIcon name="check_circle" className="text-teal-600 text-[16px]" />
                  {decisionNotice}
                </span>
                <button onClick={() => setDecisionNotice(null)} className="text-teal-700 font-bold">✕</button>
              </div>
            )}

            {/* Findings Overview & Severity Filter Bar */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>Verification Findings:</span>
                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {filteredFindings.length} Items
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-medium">Filter by Severity:</span>
                {[
                  { key: 'all', label: 'All Findings' },
                  { key: 'high', label: 'High Priority (1)' },
                  { key: 'moderate', label: 'Moderate (2)' },
                  { key: 'low', label: 'Low / Cleared (2)' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSeverityFilter(item.key)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                      severityFilter === item.key
                        ? 'bg-gov-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Findings Table */}
            <div className="space-y-3">
              {filteredFindings.map((finding) => {
                const isHigh = finding.severity === 'high';
                const isModerate = finding.severity === 'moderate';

                return (
                  <div
                    key={finding.id}
                    className={`rounded-lg bg-white border p-4 shadow-sm space-y-3 ${
                      isHigh
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : isModerate
                        ? 'border-amber-300'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-gov-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {finding.id}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {finding.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <MaterialIcon name="attach_file" className="text-[14px]" />
                          <span>Supporting Document: <strong>{finding.sourceDoc}</strong></span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isHigh ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px]">
                            HIGH ATTENTION
                          </span>
                        ) : isModerate ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                            MODERATE ATTENTION
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[11px]">
                            SATISFIED &amp; CLEARED
                          </span>
                        )}

                        {finding.sourceDocId && (
                          <Link
                            to={`/document-verification?appId=AICTE-EOA-2026-001&docId=${finding.sourceDocId}`}
                            className="text-gov-navy font-semibold hover:underline text-xs flex items-center gap-0.5"
                          >
                            <span>Inspect</span>
                            <MaterialIcon name="arrow_forward" className="text-[12px]" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* 2-Part Distinction: Automated Review Finding vs Committee Decision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Left: Automated Observation */}
                      <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="text-[11px] font-bold text-gov-navy uppercase tracking-wider flex items-center gap-1">
                          <MaterialIcon name="analytics" className="text-[14px]" />
                          <span>Automated Review Finding</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {finding.finding}
                        </p>
                        <div className="text-slate-500 text-[11px]">
                          <strong>Regulatory Impact:</strong> {finding.impact}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          <strong>System Recommendation:</strong> {finding.recommendation}
                        </div>
                      </div>

                      {/* Right: Official Committee Decision */}
                      <div className="p-3 rounded-md bg-white border border-slate-200 space-y-1.5 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            <MaterialIcon name="gavel" className="text-[14px] text-gov-navy" />
                            <span>Scrutiny Committee Decision</span>
                          </div>
                          <div className="mt-1 font-semibold text-slate-900">
                            {finding.officialDecision || 'Pending Official Sign-off'}
                          </div>
                        </div>

                        {/* Action buttons (restricted to AICTE Scrutiny Officers) */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                          {isOfficial() ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDecision(`Issued Formal Notice for ${finding.id}`)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 cursor-pointer"
                              >
                                Draft Notice
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecision(`Approved & Cleared Finding ${finding.id}`)}
                                className="px-2.5 py-1 rounded bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold cursor-pointer shadow-sm"
                              >
                                Endorse Decision
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">
                              Committee Action Reserved for Regulatory Officials
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
