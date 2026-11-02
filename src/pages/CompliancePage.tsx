import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';

interface ComplianceRule {
  id: string;
  code: string;
  section: string;
  title: string;
  requirement: string;
  actualValue: string;
  status: 'passed' | 'failed' | 'pending';
  severity?: 'critical' | 'moderate' | 'minor';
  handbookRef: string;
  notes: string;
  sourceDocument?: string;
}

const mockRules: ComplianceRule[] = [
  // Section 1: Land and Spatial Norms
  {
    id: 'R1',
    code: 'APH-2026-N4.1',
    section: 'Land & Spatial Norms',
    title: 'Minimum Contiguous Land Area for Engineering Campus',
    requirement: 'Minimum 7.50 Acres (Urban Category) in a single contiguous parcel',
    actualValue: '12.40 Acres verified via Cadastral DGPS GIS scan',
    status: 'passed',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 4, Clause 4.1.2',
    notes: 'Freehold registered title deed verified with zero encumbrance.',
    sourceDocument: 'Land Title Registered Freehold Deed (DOC-01)',
  },
  {
    id: 'R2',
    code: 'APH-2026-N4.2',
    section: 'Land & Spatial Norms',
    title: 'Public Access Road Width Requirement',
    requirement: 'Minimum 15.0 meters wide all-weather motorable approach road',
    actualValue: '18.0 meters state highway frontage validated',
    status: 'passed',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 4, Clause 4.2.1',
    notes: 'Municipal highway clearance certificate verified.',
    sourceDocument: 'Cadastral GIS Boundary Map (DOC-02)',
  },
  {
    id: 'R3',
    code: 'APH-2026-N4.3',
    section: 'Land & Spatial Norms',
    title: 'Institutional Land Use Conversion Order',
    requirement: 'Government Town & Country Planning order for educational purpose',
    actualValue: 'DTCP Order No. 4410/2012 dated 18 Nov 2012 confirmed',
    status: 'passed',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 4, Clause 4.3.4',
    notes: 'State revenue registry cross-referenced successfully.',
    sourceDocument: 'DTCP Land Conversion Order',
  },

  // Section 2: Faculty Cadre & Student Ratio
  {
    id: 'R4',
    code: 'APH-2026-N7.1',
    section: 'Faculty Cadre & Ratio',
    title: 'Student to Faculty Ratio (SFR) Compliance',
    requirement: 'Undergraduate Engineering maximum 1:15 ratio',
    actualValue: 'Computed ratio 1:13.8 (142 faculty for 1,960 students)',
    status: 'passed',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 7, Table 7.1',
    notes: 'All 142 faculty members Aadhaar / APAAR authenticated against national database.',
    sourceDocument: 'Faculty Cadre Roll & Aadhaar Sync Record',
  },
  {
    id: 'R5',
    code: 'APH-2026-N7.2',
    section: 'Faculty Cadre & Ratio',
    title: 'Cadre Proportion Ratio (1 Professor : 2 Assoc Prof : 6 Asst Prof)',
    requirement: 'Prescribed cadre hierarchy across all approved departments',
    actualValue: 'Shortfall of 2 Associate Professors in Dept of AI & Data Science (Ratio 1:1:8)',
    status: 'failed',
    severity: 'critical',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 7, Clause 7.2.3',
    notes: 'DEFICIENCY EXPLANATION: The Department of Artificial Intelligence & Data Science has only 1 Associate Professor against the mandatory 3 required for its sanctioned intake of 180 seats. Institutional undertaking or deficiency notice required.',
    sourceDocument: 'AISHE Cadre Breakdown Sheet',
  },
  {
    id: 'R6',
    code: 'APH-2026-N7.3',
    section: 'Faculty Cadre & Ratio',
    title: 'Principal / Director Qualification & Experience Norms',
    requirement: 'Ph.D. in relevant engineering discipline with minimum 15 years experience',
    actualValue: 'Dr. M. Senthil Kumar (Ph.D. Mechanical, 22 yrs teaching & research)',
    status: 'passed',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 7, Clause 7.4.1',
    notes: 'Verified via university service records and publication citations.',
    sourceDocument: 'University Approval Order & Ph.D. Degree',
  },

  // Section 3: Built-Up Carpet & Infrastructure
  {
    id: 'R7',
    code: 'APH-2026-N5.1',
    section: 'Infrastructure & Laboratories',
    title: 'Instructional Area per Approved Student Intake',
    requirement: 'Minimum 5.5 sq.m per student built-up carpet area',
    actualValue: '24,800 sq.m verified (Average 6.8 sq.m per student)',
    status: 'passed',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 5, Table 5.2',
    notes: 'PWD certified structural floor plans verified.',
    sourceDocument: 'Approved Municipal Building Plan (DOC-03)',
  },
  {
    id: 'R8',
    code: 'APH-2026-N5.2',
    section: 'Infrastructure & Laboratories',
    title: 'Mandatory Geo-Tagged Equipment Verification for Specialized Labs',
    requirement: 'Photographs must contain verifiable EXIF GPS coordinates and timestamp',
    actualValue: 'Mechanical Fluid Mechanics Lab photographs missing EXIF GPS coordinates',
    status: 'failed',
    severity: 'moderate',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 5, Clause 5.3.6',
    notes: 'DEFICIENCY EXPLANATION: Automated review rejected the uploaded photographs because image metadata lacks latitude, longitude, and timestamp tags. Re-upload with geo-tagging required.',
    sourceDocument: 'Fluid Mechanics Lab Photos (DOC-06)',
  },
  {
    id: 'R9',
    code: 'APH-2026-N5.3',
    section: 'Infrastructure & Laboratories',
    title: 'Barrier-Free Accessibility for Persons with Disabilities (PwD)',
    requirement: 'Tactile paths, dedicated ramps (1:12 slope), and accessible restrooms',
    actualValue: 'PWD Certificate validates universal accessibility across Blocks A, B, and C',
    status: 'passed',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 5, Clause 5.6.1',
    notes: 'Superintending Engineer PWD inspection report confirms compliance.',
    sourceDocument: 'PWD Stability & Safety Certificate',
  },

  // Section 4: Governance & Safety
  {
    id: 'R10',
    code: 'APH-2026-N6.1',
    section: 'Statutory Governance & Safety',
    title: 'Current Fire & Rescue Services Safety NOC',
    requirement: 'Valid unexpired fire safety clearance certificate for academic campus',
    actualValue: 'Certificate DFRS-NOC-2025-1102 expired on 14 Jan 2026',
    status: 'pending',
    severity: 'moderate',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 6, Clause 6.1.1',
    notes: 'DEFICIENCY EXPLANATION: Renewal receipt submitted; awaiting final renewed NOC issuance from District Fire Officer.',
    sourceDocument: 'Fire Safety NOC Renewal Receipt',
  },
  {
    id: 'R11',
    code: 'APH-2026-N6.2',
    section: 'Statutory Governance & Safety',
    title: 'Anti-Ragging Committee & Squad Constitution',
    requirement: 'Mandatory compliance with AICTE Regulations 2009',
    actualValue: 'Anti-Ragging committee roster and 24x7 helpline published on portal',
    status: 'passed',
    handbookRef: 'AICTE Regulations 2009 (F.No. 37-3/Legal/AICTE/2009)',
    notes: 'Institutional statutory affidavit affirmed.',
    sourceDocument: 'Mandatory Disclosure Affidavit (DOC-05)',
  },
  {
    id: 'R12',
    code: 'APH-2026-N6.3',
    section: 'Statutory Governance & Safety',
    title: 'National Accreditation Board (NBA/NAAC) Status',
    requirement: 'Valid accreditation certificate for programmes seeking intake expansion',
    actualValue: 'NAAC Grade A expired 11 Mar 2026; IIQA cycle 4 receipt submitted',
    status: 'pending',
    severity: 'minor',
    handbookRef: 'AICTE Approval Process Handbook (APH 2026–27), Appendix 6, Clause 6.4.2',
    notes: 'Provisional institutional undertaking submitted pending NAAC Peer Team visit.',
    sourceDocument: 'NAAC IIQA Acceptance Receipt',
  },
];

export const CompliancePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const sections = [
    'all',
    'Land & Spatial Norms',
    'Faculty Cadre & Ratio',
    'Infrastructure & Laboratories',
    'Statutory Governance & Safety',
  ];

  const filteredRules = mockRules.filter((rule) => {
    const matchesSection = selectedSection === 'all' || rule.section === selectedSection;
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    return matchesSection && matchesStatus;
  });

  const totalPassed = mockRules.filter((r) => r.status === 'passed').length;
  const totalFailed = mockRules.filter((r) => r.status === 'failed').length;
  const totalPending = mockRules.filter((r) => r.status === 'pending').length;

  const handleExportCSV = () => {
    const headers = 'Rule ID,Section,Title,Requirement,Evidence/Actual Value,Status,Handbook Reference,Notes\n';
    const rows = mockRules
      .map(
        (r) =>
          `"${r.code}","${r.section}","${r.title}","${r.requirement}","${r.actualValue}","${r.status}","${r.handbookRef}","${r.notes}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_Compliance_Review_Report_AY2026-27.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionNotice('Exported Regulatory Compliance Review Report to CSV.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleRuleAction = (ruleCode: string, action: string) => {
    setActionNotice(`Logged Action for ${ruleCode}: ${action}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="compliance"
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
                  <MaterialIcon name="rule" className="text-[16px]" />
                  <span>Regulatory Compliance Review • APH 2026–27</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Approval Process Handbook Compliance Review
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  Systematic evaluation of institutional applications against statutory standards defined in the
                  AICTE Approval Process Handbook (APH 2026–27). Review requirement criteria, supporting evidence,
                  and official findings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="download" className="text-[16px] text-gov-navy" />
                  <span>Export Compliance Ledger</span>
                </button>
                <Link
                  to="/verification-results"
                  className="px-3.5 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <MaterialIcon name="fact_check" className="text-[16px]" />
                  <span>Verification Summary</span>
                </Link>
              </div>
            </div>

            {/* Notification Alert */}
            {actionNotice && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-4 py-2.5 rounded-md flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MaterialIcon name="check_circle" className="text-teal-600 text-[16px]" />
                  {actionNotice}
                </span>
                <button onClick={() => setActionNotice(null)} className="text-teal-700 font-bold">✕</button>
              </div>
            )}

            {/* 4 Compliance Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  Evaluated Requirements
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {mockRules.length}
                </div>
                <div className="text-slate-500 mt-0.5">Across 4 Handbook Chapters</div>
              </div>

              <div className="p-3.5 rounded-md border border-teal-200 bg-teal-50/50 shadow-sm">
                <div className="text-teal-800 font-semibold uppercase tracking-wider text-[11px]">
                  Norms Satisfied
                </div>
                <div className="text-2xl font-bold text-teal-900 mt-1 tabular-nums">
                  {totalPassed}
                </div>
                <div className="text-teal-700 mt-0.5">Compliant with Handbook Norms</div>
              </div>

              <div className="p-3.5 rounded-md border border-rose-200 bg-rose-50/50 shadow-sm">
                <div className="text-rose-800 font-semibold uppercase tracking-wider text-[11px]">
                  Deficiencies Identified
                </div>
                <div className="text-2xl font-bold text-rose-900 mt-1 tabular-nums">
                  {totalFailed}
                </div>
                <div className="text-rose-700 mt-0.5 font-medium">Hearing / Explanation Required</div>
              </div>

              <div className="p-3.5 rounded-md border border-amber-200 bg-amber-50/50 shadow-sm">
                <div className="text-amber-800 font-semibold uppercase tracking-wider text-[11px]">
                  Pending Final Verification
                </div>
                <div className="text-2xl font-bold text-amber-900 mt-1 tabular-nums">
                  {totalPending}
                </div>
                <div className="text-amber-700 mt-0.5">Awaiting Supporting Renewal</div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                <div className="font-bold text-slate-900">
                  Regulatory Category Filter:
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Status Filter:</span>
                  {(['all', 'passed', 'failed', 'pending'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-gov-navy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all'
                        ? 'All'
                        : st === 'passed'
                        ? 'Satisfied'
                        : st === 'failed'
                        ? 'Deficient'
                        : 'Pending'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs">
                {sections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                      selectedSection === sec
                        ? 'bg-gov-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sec === 'all' ? 'All Regulatory Sections' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Compliance Requirements List */}
            <div className="space-y-3">
              {filteredRules.map((rule) => {
                const isDeficient = rule.status === 'failed';
                const isPending = rule.status === 'pending';
                const isPassed = rule.status === 'passed';

                return (
                  <div
                    key={rule.id}
                    className={`rounded-lg border p-4 shadow-sm transition-all bg-white ${
                      isDeficient
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : isPending
                        ? 'border-amber-300'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Handbook Clause & Section */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-gov-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {rule.code}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {rule.section}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {rule.handbookRef}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-sm font-bold text-slate-900">
                          {rule.title}
                        </h2>

                        {/* Requirement Specification */}
                        <div className="text-xs text-slate-600">
                          <strong className="text-slate-700">Requirement:</strong> {rule.requirement}
                        </div>

                        {/* Evidence & Actual Finding */}
                        <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1 mt-2">
                          <div className="flex items-start gap-1.5">
                            <strong className="text-slate-700 shrink-0">Submitted Evidence:</strong>
                            <span className="text-slate-800">{rule.actualValue}</span>
                          </div>
                          {rule.sourceDocument && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MaterialIcon name="attach_file" className="text-[14px]" />
                              <span>Source: <strong>{rule.sourceDocument}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Deficiency Explanation (if failed or pending) */}
                        {rule.notes && (
                          <div
                            className={`p-2.5 rounded text-xs leading-relaxed ${
                              isDeficient
                                ? 'bg-rose-50 text-rose-900 border border-rose-200 font-medium'
                                : isPending
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'text-slate-600 bg-slate-50/60'
                            }`}
                          >
                            {rule.notes}
                          </div>
                        )}
                      </div>

                      {/* Status & Committee Actions */}
                      <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                        <div>
                          {isPassed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold text-xs">
                              <MaterialIcon name="check_circle" className="text-[14px] text-teal-700" />
                              <span>COMPLIANT</span>
                            </span>
                          )}
                          {isDeficient && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs">
                              <MaterialIcon name="report_problem" className="text-[14px] text-rose-700" />
                              <span>DEFICIENCY IDENTIFIED</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                              <MaterialIcon name="schedule" className="text-[14px] text-amber-700" />
                              <span>AWAITING EVIDENCE</span>
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {isDeficient ? (
                            <button
                              type="button"
                              onClick={() => handleRuleAction(rule.code, 'Drafted Deficiency Notice')}
                              className="px-2.5 py-1 rounded bg-rose-700 text-white font-medium hover:bg-rose-800 cursor-pointer text-xs shadow-sm"
                            >
                              Issue Deficiency Notice
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRuleAction(rule.code, 'Confirmed Compliance Sign-Off')}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium cursor-pointer text-xs border border-slate-200"
                            >
                              Confirm Sign-Off
                            </button>
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
