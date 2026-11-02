import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';

interface ReportCardItem {
  id: string;
  title: string;
  category: string;
  description: string;
  pages: number;
  fileSize: string;
  format: 'PDF' | 'ZIP' | 'CSV';
  hash: string;
  generatedDate: string;
  icon: string;
}

const mockReports: ReportCardItem[] = [
  {
    id: 'rep-val',
    title: 'Document Scrutiny & Extraction Report',
    category: 'Document Verification',
    description:
      'Consolidated multi-engine extraction review of land deeds, cadastral GIS polygons, building stability certificates, and fire safety clearances.',
    pages: 18,
    fileSize: '4.8 MB',
    format: 'PDF',
    hash: '0x9482fa102bc918237491029381029381',
    generatedDate: '22 Oct 2026',
    icon: 'verified',
  },
  {
    id: 'rep-comp',
    title: 'Statutory Norms Compliance Dossier',
    category: 'Regulatory Compliance Review',
    description:
      'Detailed rule-by-rule evaluation against AICTE Approval Process Handbook (APH 2026–27) standards covering SFR 1:15, cadre ratios, and land requirements.',
    pages: 32,
    fileSize: '6.2 MB',
    format: 'PDF',
    hash: '0x3c11d8842ea918237491029381029381',
    generatedDate: '22 Oct 2026',
    icon: 'rule',
  },
  {
    id: 'rep-infra',
    title: 'Infrastructure & Laboratory Verification Report',
    category: 'Infrastructure Verification',
    description:
      'Structured verification results for 64 classrooms, specialized engineering labs, workshop equipment, and universal accessibility clearances.',
    pages: 24,
    fileSize: '14.5 MB',
    format: 'PDF',
    hash: '0x7701e4419de918237491029381029381',
    generatedDate: '21 Oct 2026',
    icon: 'apartment',
  },
  {
    id: 'rep-proof',
    title: 'Verification Evidence Report (Complete Audit)',
    category: 'Central Regulatory Clearing',
    description:
      'Formal regulatory evidence archive containing chronological review logs, cryptographic document digests, government registry verification receipts, and gazette orders.',
    pages: 74,
    fileSize: '28.4 MB',
    format: 'ZIP',
    hash: '0xaa4279931bf918237491029381029381',
    generatedDate: '22 Oct 2026',
    icon: 'history_edu',
  },
];

export const ReportsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('rep-val');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeReport = mockReports.find((r) => r.id === selectedReportId) || mockReports[0];

  const handleDownload = (type: string) => {
    const content = `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
MINISTRY OF EDUCATION, GOVERNMENT OF INDIA
STATUTORY DOSSIER REPORT: ${activeReport.title}
REF NO: AICTE/SRO/EOA-2026-001/REGULATORY-REPORT
CATEGORY: ${activeReport.category}
SHA-256 HASH: ${activeReport.hash}
GENERATION TIMESTAMP: ${activeReport.generatedDate} 14:02:19 IST
APPLICANT INSTITUTION: Sri Venkateswara College of Engineering (Permanent ID: 1-4296181)

1. EXECUTIVE SUMMARY:
${activeReport.description}

2. STATUTORY EVALUATION STANDARD:
AICTE Approval Process Handbook (APH 2026–27) Gazetted Regulations.
Evaluated in accordance with powers under Section 10 and 23 of AICTE Act 1987.

3. VERIFICATION INTEGRITY:
- Format: ${activeReport.format}
- Cryptographic Proof Standard: SHA-256 Digest
- Verification Status: Digitally Sealed via Central Regulatory Clearinghouse

Digitally Endorsed by Dr. R. Sharma, Director, Approval Bureau (AICTE), New Delhi.`;

    const ext = activeReport.format === 'ZIP' ? 'zip' : 'txt';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_${activeReport.id}_${activeReport.title.replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice(`Generated & Downloaded ${type} for "${activeReport.title}".`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="reports"
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
                  <MaterialIcon name="summarize" className="text-[16px]" />
                  <span>Statutory Reports &amp; Verification Evidence</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Regulatory Scrutiny Reports &amp; Evidence Dossiers
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  Generate official verification evidence reports, compliance dossiers, and scrutiny orders for
                  AICTE approval bureau proceedings. All reports include cryptographic document hashes and timestamped decision records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload('Master Regulatory Bundle (All 4 Dossiers)')}
                  className="px-3.5 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="folder_zip" className="text-[16px]" />
                  <span>Download Complete Evidence Pack</span>
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

            {/* 4 Report Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mockReports.map((report) => {
                const isSelected = report.id === activeReport.id;
                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    className={`text-left p-4 rounded-lg transition-all border flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 border-gov-navy ring-1 ring-gov-navy shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded bg-slate-100 text-gov-navy flex items-center justify-center border border-slate-200">
                          <MaterialIcon name={report.icon} className="text-[18px]" />
                        </div>
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {report.format}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {report.category}
                      </div>
                      <h2 className="text-xs font-bold text-slate-900 leading-snug">
                        {report.title}
                      </h2>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {report.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{report.pages} Pages</span>
                      <span className={`font-semibold ${isSelected ? 'text-gov-navy' : 'text-slate-400'}`}>
                        {isSelected ? 'Viewing' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Report Preview & Download Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Preview Window (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {activeReport.title}
                    </h3>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                      SHA-256 Digest: {activeReport.hash}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200">
                      {activeReport.generatedDate}
                    </span>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <MaterialIcon name="print" className="text-[14px]" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* Formal Letterhead Preview */}
                <div className="border border-slate-200 rounded p-6 bg-slate-50/50 space-y-5 text-xs text-slate-800">
                  {/* Government Header */}
                  <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                    <div className="font-bold text-xs uppercase tracking-widest text-slate-900">
                      ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                    </div>
                    <div className="text-[11px] text-slate-600">
                      (A Statutory Body Under Ministry of Education, Government of India)
                    </div>
                    <div className="font-mono text-[11px] text-gov-navy font-semibold">
                      NELSON MANDELA MARG, VASANT KUNJ, NEW DELHI – 110070
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="p-3 rounded bg-white border border-slate-200 text-[11px] space-y-1">
                    <div>
                      <strong>REF NO:</strong> AICTE/SRO/EOA-2026-001/SCRUTINY-REPORT
                    </div>
                    <div>
                      <strong>APPLICANT:</strong> SRI VENKATESWARA COLLEGE OF ENGINEERING (PERMANENT ID: 1-4296181)
                    </div>
                    <div>
                      <strong>SUBJECT:</strong> STATUTORY APPROVAL PROCESS HANDBOOK 2026–27 COMPLIANCE &amp; VERIFICATION REPORT
                    </div>
                  </div>

                  {/* Summary Findings */}
                  <div className="space-y-2 leading-relaxed">
                    <h4 className="font-bold text-xs uppercase text-gov-navy">
                      I. Regulatory Scrutiny Executive Summary
                    </h4>
                    <p className="text-slate-700">
                      The Approval Bureau of AICTE has evaluated the application submitted by Sri Venkateswara College
                      of Engineering for Extension of Approval (EoA) and Increase in Intake for Academic Year 2026–27.
                      Automated text extraction was completed across registered title deeds, municipal building safety
                      plans, and APAAR faculty biometrics.
                    </p>

                    <div className="p-3 rounded bg-white border border-slate-200 space-y-1.5 my-2 text-[11px]">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>Overall Compliance Score:</span>
                        <span className="font-mono text-gov-navy">94.2% Satisfied</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Statutory Norms Evaluated:</span>
                        <span>48 Checklist Requirements</span>
                      </div>
                      <div className="flex justify-between text-teal-800 font-medium">
                        <span>Norms Cleared without Defect:</span>
                        <span>42 Requirements Satisfied</span>
                      </div>
                      <div className="flex justify-between text-rose-800 font-medium">
                        <span>Deficiencies Identified:</span>
                        <span>2 Items (Notice Dispatched)</span>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Box */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 text-[11px]">
                    <div className="text-slate-500 font-mono text-[10px]">
                      <div>DIGITALLY VERIFIED VIA NIC AUDIT CHAIN</div>
                      <div>TIMESTAMP: 2026-10-22 14:02:19 IST</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">Dr. R. Sharma</div>
                      <div className="text-slate-600">Director, Approval Bureau (AICTE)</div>
                      <div className="font-mono text-[10px] text-gov-navy">GOV-IN-DIGISIGN-VALID</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Options (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">
                  Download Official Documents
                </h3>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleDownload('Digitally Signed Regulatory Dossier')}
                    className="w-full py-2.5 px-3 rounded-md bg-gov-navy hover:bg-gov-navy-light text-white font-semibold transition-colors flex items-center justify-between shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MaterialIcon name="picture_as_pdf" className="text-[18px]" />
                      <span>Download Signed Report</span>
                    </span>
                    <span className="font-mono text-[11px] opacity-80">{activeReport.fileSize}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload('Verification Evidence Report Archive')}
                    className="w-full py-2.5 px-3 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium transition-colors flex items-center justify-between shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MaterialIcon name="inventory_2" className="text-[18px] text-gov-navy" />
                      <span>Evidence Archive (.zip)</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">28.4 MB</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Legal Admissibility</div>
                  <p className="leading-relaxed">
                    Reports generated by the AICTE Regulatory Application Review System satisfy Section 65B of the Indian Evidence Act for statutory administrative proceedings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
