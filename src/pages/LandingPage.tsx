import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderNav } from '../components/layout/HeaderNav';
import { Footer } from '../components/layout/Footer';
import { MaterialIcon } from '../components/common/MaterialIcon';

export const LandingPage: React.FC = () => {
  const handleDownloadHandbook = () => {
    const content = `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
MINISTRY OF EDUCATION, GOVERNMENT OF INDIA
APPROVAL PROCESS HANDBOOK (APH 2026–27)
STATUTORY REGULATORY REQUIREMENTS SUMMARY

1. JURISDICTION & AUTHORITY
   The Approval Process Handbook is published in exercise of powers conferred under Section 23 read with Section 10 of the AICTE Act 1987 (52 of 1987).

2. LAND & SPATIAL NORMS (Appendix 4)
   - Mega & Metro Urban Areas: Minimum 7.50 contiguous acres for Technical Institutions.
   - Title Ownership: Clear, unencumbered registered title deed or government lease (>30 years).
   - Cadastral Geo-Fencing: Accurate boundary coordinates verified via State Revenue & Survey of India records.

3. FACULTY CADRE & STUDENT-TO-FACULTY RATIO (Appendix 7)
   - Undergraduate Engineering SFR: Minimum 1:15 ratio.
   - Cadre Distribution: 1 Professor : 2 Associate Professors : 6 Assistant Professors per department.
   - Verification: APAAR / Aadhaar authenticated faculty records.

4. INFRASTRUCTURE & LABORATORIES (Appendix 5)
   - Instructional Built-Up Area: Minimum 5.50 sq.m per student.
   - Laboratories: Mandated equipment sets per syllabus, geo-tagged and timestamped evidence.
   - Safety: Valid PWD Structural Stability Certificate and Directorate Fire & Rescue Services NOC.

5. VERIFICATION & GRIEVANCE
   Applications undergo automated forensic extraction and cross-document verification before submission to Regional Scrutiny Committees.

Issued by Member Secretary, AICTE, Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AICTE_Approval_Process_Handbook_2026-27_Summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-6xl">
        <div className="flex flex-col w-full">
          {/* Sovereign Header Navigation */}
          <HeaderNav />

          {/* Hero Section: Official Regulatory Banner */}
          <section
            id="overview"
            className="rounded-lg bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-sm mb-6 relative overflow-hidden"
          >
            {/* Subtle administrative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />

            <div className="flex flex-col items-start gap-4 max-w-3xl">
              {/* Sovereign Tag */}
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded text-xs font-semibold text-gov-navy">
                <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                <span>AICTE APPROVAL PROCESS HANDBOOK (APH 2026–27) • OFFICIAL REVIEW SYSTEM</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-slate-900 font-extrabold tracking-tight leading-tight">
                Statutory Application Review &amp; Regulatory Verification Platform
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Official regulatory review portal of the All India Council for Technical Education (AICTE).
                Enables automated text extraction from statutory documents, cross-document verification,
                and transparent compliance checking for technical education institutions nationwide.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold px-5 py-2.5 rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  <MaterialIcon name="login" className="text-[18px]" />
                  <span>Access Official Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={handleDownloadHandbook}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-4 py-2.5 rounded-md border border-slate-300 shadow-sm transition-colors cursor-pointer"
                >
                  <MaterialIcon name="download" className="text-[18px] text-gov-navy" />
                  <span>Download Handbook Norms</span>
                </button>
                <Link
                  to="/institution-dashboard"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2.5 rounded-md border border-slate-300 transition-colors"
                >
                  <MaterialIcon name="domain" className="text-[18px] text-slate-500" />
                  <span>Institution Desk</span>
                </Link>
              </div>

              {/* Regulatory Assurance Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 w-full text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-medium">
                  <MaterialIcon name="gavel" className="text-[14px] text-gov-navy" />
                  AICTE Act 1987 Statutory Compliance
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-medium">
                  <MaterialIcon name="verified" className="text-[14px] text-teal-700" />
                  Evidence-Based Decision Record
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-medium">
                  <MaterialIcon name="security" className="text-[14px] text-blue-700" />
                  National Informatics Centre (NIC) Standards
                </span>
              </div>
            </div>
          </section>

          {/* Key Administrative Statistics Banner */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-gov-navy shrink-0">
                <MaterialIcon name="account_balance" className="text-[24px]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  12,400+
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Technical Institutions Under Review
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <MaterialIcon name="fact_check" className="text-[24px]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  100%
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Document Audit Traceability
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <MaterialIcon name="speed" className="text-[24px]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  68%
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Scrutiny Processing Time Reduction
                </div>
              </div>
            </div>
          </section>

          {/* Core System Capabilities (Regulatory Verification Pillars) */}
          <section id="verification-pillars" className="space-y-4 mb-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                System Capabilities
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Four Pillars of Regulatory Verification
              </h2>
              <p className="text-xs text-slate-500">
                Designed to provide objective, evidence-based review support to AICTE Scrutiny Committees
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1 */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-md bg-slate-100 text-gov-navy flex items-center justify-center border border-slate-200">
                    <MaterialIcon name="find_in_page" className="text-[20px]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Document Verification &amp; Text Extraction
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automated optical text extraction from land title deeds, municipal approved building plans,
                    PWD structural stability certificates, and Fire NOCs. Distinguishes extracted values from
                    institutionally claimed figures.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Supported Formats: PDF (.pdf)</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Max 10 MB
                  </span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                    <MaterialIcon name="rule" className="text-[20px]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Regulatory Compliance Review
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rule-based scrutiny against AICTE Approval Process Handbook (APH 2026–27) standards.
                    Evaluates Student-to-Faculty Ratio (1:15), Cadre Ratio (1:2:6), and urban land area
                    requirements with clear citation of handbook clauses.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Handbook Baseline: APH 2026–27</span>
                  <span className="font-mono text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                    Appendix 4 &amp; 7
                  </span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                    <MaterialIcon name="apartment" className="text-[20px]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Infrastructure Verification
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Structured verification of classrooms, specialized laboratories, computer centers, and heavy
                    machinery workshops. Distinguishes applicant-submitted photographic evidence from automated
                    spatial observations.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Geospatial Evidence Review</span>
                  <span className="font-mono text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                    Appendix 5
                  </span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                    <MaterialIcon name="history_edu" className="text-[20px]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Review History &amp; Audit Log
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Complete, immutable chronological log of every application state change, deficiency notice,
                    scrutiny hearing, and verification summary report. Ensures full transparency and accountability
                    for parliamentary and administrative review.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Audit Grade Integrity</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    SHA-256 Hashing
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Institutional Statutory Strip */}
          <section id="handbook-norms" className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-gov-navy text-white flex items-center justify-center shrink-0">
                <MaterialIcon name="policy" className="text-[20px]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Approval Process Handbook AY 2026–27
                </h4>
                <p className="text-xs text-slate-600">
                  All scrutiny guidelines, cadre ratios, and land contiguity standards reflect gazetted AICTE norms.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/compliance"
                className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-300 transition-colors"
              >
                View Regulatory Norms
              </Link>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-md bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Sign In to Review Desk
              </Link>
            </div>
          </section>

          {/* Institutional Footer */}
          <Footer />
        </div>
      </main>
    </div>
  );
};
