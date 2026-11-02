import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockApplicationsList, Application } from '../data/mockData';
import { isOfficial, isInstitution } from '../services/authSession';

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'verification' | 'compliance' | 'timeline'>('overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const userIsOfficial = isOfficial();
  const userIsInstitution = isInstitution();

  // Look up application
  const foundApplication: Application | undefined =
    mockApplicationsList.find((app) => app.id === id || app.applicationId === id);

  const isOwnInstitution =
    foundApplication &&
    (foundApplication.permanentId === '1-4296181' || foundApplication.id === 'AICTE-EOA-2026-001');

  // Enforce institutional boundary: applicant institution cannot inspect external dossiers
  if (userIsInstitution && !isOwnInstitution && foundApplication) {
    return (
      <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePath="institution-portal" />
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <TopHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="w-full pt-16 bg-slate-50 flex-1">
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
              <div className="bg-white rounded-lg border border-rose-200 p-8 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                  <MaterialIcon name="lock" className="text-[28px]" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">Institutional Access Boundary</h1>
                <p className="text-xs text-slate-600 max-w-lg mx-auto">
                  You are signed in under applicant credentials for Sri Venkateswara College of Engineering (Permanent ID: 1-4296181). Applicants are strictly restricted to inspecting their own institution's submissions.
                </p>
                <div className="pt-2">
                  <Link
                    to="/institution-dashboard"
                    className="px-4 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light inline-flex items-center gap-2 shadow-sm"
                  >
                    <MaterialIcon name="arrow_back" className="text-[16px]" />
                    <span>Return to Institutional Desk</span>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!foundApplication) {
    return (
      <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePath="applications"
        />

        <div className="lg:pl-64 flex flex-col min-h-screen">
          <TopHeader
            role="aicte"
            userName="Dr. R. Sharma"
            userRoleTitle="Director, Approval Bureau"
            onMenuToggle={() => setSidebarOpen(true)}
          />

          <main className="w-full pt-16 bg-slate-50 flex-1">
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Link to="/applications" className="hover:text-gov-navy transition-colors flex items-center gap-1 font-medium">
                  <MaterialIcon name="arrow_back" className="text-[14px]" />
                  <span>Applications Registry</span>
                </Link>
                <span>/</span>
                <span className="font-mono text-rose-700 font-semibold">Not Found ({id})</span>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                  <MaterialIcon name="folder_off" className="text-[28px]" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  Application Dossier Not Found
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  No statutory application record matches the identifier <strong className="font-mono text-slate-900">{id}</strong> in the AY 2026–27 centralized regulatory database.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Link
                    to="/applications"
                    className="px-4 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors"
                  >
                    Return to Applications Registry
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const application = foundApplication;

  const handleOfficialAction = (action: string) => {
    setActionNotice(`Official Action Logged: ${action} for application ${application.applicationId}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="applications"
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
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Link to="/applications" className="hover:text-gov-navy transition-colors flex items-center gap-1 font-medium">
                  <MaterialIcon name="arrow_back" className="text-[14px]" />
                  <span>Applications Registry</span>
                </Link>
                <span>/</span>
                <span className="font-mono text-gov-navy font-semibold">{application.applicationId}</span>
              </div>
              <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                AICTE Scrutiny Dossier
              </span>
            </div>

            {/* Notification Alert */}
            {actionNotice && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-4 py-2.5 rounded-md flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MaterialIcon name="verified" className="text-teal-600 text-[16px]" />
                  {actionNotice}
                </span>
                <button onClick={() => setActionNotice(null)} className="text-teal-700 font-bold">✕</button>
              </div>
            )}

            {/* Master Application Header Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gov-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {application.applicationId}
                    </span>
                    <StatusBadge status={application.status} count={application.deficiencyCount} />
                    <span className="text-xs text-slate-500 font-medium">
                      Cycle: <strong>{application.academicYear}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      Submitted on: {application.submissionDate}
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {application.institutionName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span>Permanent ID: <strong className="font-mono text-slate-900">{application.permanentId}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Institution Code: <strong>{application.institutionCode}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>{application.region}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-medium text-gov-navy">{application.type}</span>
                  </div>
                </div>

                {/* Primary Official Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    to={`/document-verification?appId=${application.id}`}
                    className="px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <MaterialIcon name="find_in_page" className="text-[16px] text-gov-navy" />
                    <span>Document Verification</span>
                  </Link>
                  <Link
                    to={`/compliance?appId=${application.id}`}
                    className="px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <MaterialIcon name="rule" className="text-[16px] text-gov-navy" />
                    <span>Compliance Review</span>
                  </Link>
                  <Link
                    to={`/reports?appId=${application.id}`}
                    className="px-3 py-1.5 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <MaterialIcon name="summarize" className="text-[16px]" />
                    <span>Evidence Report</span>
                  </Link>
                </div>
              </div>

              {/* Deficiencies Alert Strip (if flagged) */}
              {application.deficiencies && application.deficiencies.length > 0 && (
                <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MaterialIcon name="report_problem" className="text-rose-700 text-[18px] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-900">
                        {application.deficiencies.length} Deficiencies Identified in Regulatory Scrutiny
                      </div>
                      <div className="text-rose-800 mt-0.5">
                        Documentary shortfall identified during automated text extraction. Institutional explanation or hearing required.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {userIsOfficial ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOfficialAction('Schedule Hearing')}
                          className="px-2.5 py-1 rounded bg-white border border-rose-300 text-rose-900 font-medium hover:bg-rose-100/60 cursor-pointer text-xs"
                        >
                          Schedule Hearing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOfficialAction('Issue Deficiency Notice')}
                          className="px-2.5 py-1 rounded bg-rose-700 text-white font-medium hover:bg-rose-800 cursor-pointer text-xs shadow-xs"
                        >
                          Issue Deficiency Notice
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/institution-dashboard"
                        className="px-2.5 py-1 rounded bg-gov-navy text-white font-medium hover:bg-gov-navy-light cursor-pointer text-xs inline-flex items-center gap-1 shadow-xs"
                      >
                        <MaterialIcon name="upload" className="text-[14px]" />
                        <span>Upload Remediation Evidence</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dossier Tabs Container */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 flex flex-wrap gap-1">
                {[
                  { key: 'overview', label: 'Institutional Overview', icon: 'info' },
                  { key: 'documents', label: `Submitted Documents (${application.documents?.length || 6})`, icon: 'description' },
                  { key: 'verification', label: 'Verification Summary', icon: 'fact_check' },
                  { key: 'compliance', label: `Compliance Review (${application.complianceScore}%)`, icon: 'rule' },
                  { key: 'timeline', label: 'Review History & Audit Log', icon: 'history' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.key
                        ? 'border-gov-navy text-gov-navy bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <MaterialIcon name={tab.icon} className="text-[16px]" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50">
                        <div className="text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                          Campus Land Area
                        </div>
                        <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                          {application.landAreaAcres} Acres
                        </div>
                        <div className="text-teal-700 font-medium mt-0.5">
                          ✓ Satisfies 7.50 Acres Urban Norm
                        </div>
                      </div>

                      <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50">
                        <div className="text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                          Faculty Count
                        </div>
                        <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                          {application.facultyCount} Members
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          Aadhaar &amp; APAAR authenticated
                        </div>
                      </div>

                      <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50">
                        <div className="text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                          Student Enrollment
                        </div>
                        <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                          {application.studentCount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-teal-700 font-medium mt-0.5">
                          1:13.8 Student-to-Faculty Ratio
                        </div>
                      </div>

                      <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50">
                        <div className="text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                          Automated Review Score
                        </div>
                        <div className="text-xl font-bold text-gov-navy mt-1 tabular-nums">
                          {application.complianceScore}%
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          AICTE Norms Scrutiny Baseline
                        </div>
                      </div>
                    </div>

                    {/* Details Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-md border border-slate-200 bg-white space-y-2">
                        <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                          <MaterialIcon name="apartment" className="text-gov-navy text-[16px]" />
                          <span>Institutional Profile</span>
                        </h3>
                        <div className="space-y-1.5 divide-y divide-slate-100">
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Permanent Institute ID:</span>
                            <span className="font-mono font-semibold text-slate-900">{application.permanentId}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">State / Territory:</span>
                            <span className="font-semibold text-slate-900">{application.state}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Regional Jurisdiction:</span>
                            <span className="text-slate-900">{application.region}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Institutional Category:</span>
                            <span className="text-slate-900">{application.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-md border border-slate-200 bg-white space-y-2">
                        <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                          <MaterialIcon name="person" className="text-gov-navy text-[16px]" />
                          <span>Principal &amp; Administrative Contact</span>
                        </h3>
                        <div className="space-y-1.5 divide-y divide-slate-100">
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Principal / Director:</span>
                            <span className="font-semibold text-slate-900">{application.contactPerson}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Official Email:</span>
                            <span className="font-mono text-gov-navy">{application.contactEmail}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Telephone Contact:</span>
                            <span className="text-slate-900">{application.phone}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Current Review Stage:</span>
                            <StatusBadge status={application.status} count={application.deficiencyCount} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved Programmes */}
                    <div className="p-4 rounded-md border border-slate-200 bg-slate-50 text-xs">
                      <div className="font-bold text-slate-900 mb-2">
                        Programmes Listed Under This Application
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {application.programmes.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800 text-xs"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SUBMITTED DOCUMENTS */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Submitted Statutory Documents
                        </h3>
                        <p className="text-slate-500">
                          Documents uploaded by the institution and processed through automated text extraction
                        </p>
                      </div>
                      <Link
                        to={`/document-verification?appId=${application.id}`}
                        className="px-3 py-1 rounded bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light inline-flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <MaterialIcon name="open_in_new" className="text-[14px]" />
                        <span>Open Document Workspace</span>
                      </Link>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                            <th className="py-2 px-3">Document Title</th>
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3">Certificate / Reg #</th>
                            <th className="py-2 px-3">Text Extraction</th>
                            <th className="py-2 px-3">Validity</th>
                            <th className="py-2 px-3">Review Status</th>
                            <th className="py-2 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(application.documents || []).map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
                                  {doc.type}
                                </span>
                                {doc.name}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{doc.category}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-700 text-[11px]">
                                {doc.certificateNumber || 'N/A'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono text-xs text-teal-800 font-medium">
                                  {doc.ocrConfidence}% Confidence
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                {doc.expiryDate || 'N/A'}
                              </td>
                              <td className="py-2.5 px-3">
                                <StatusBadge status={doc.status} />
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <Link
                                  to={`/document-verification?appId=${application.id}&docId=${doc.id}`}
                                  className="text-gov-navy hover:underline font-semibold text-xs"
                                >
                                  Inspect
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: VERIFICATION SUMMARY */}
                {activeTab === 'verification' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Automated Review Findings &amp; Evidence Cross-Checks
                        </h3>
                        <p className="text-slate-500">
                          Automated cross-referencing against state land registries, APAAR portal, and municipal approvals
                        </p>
                      </div>
                      <Link
                        to="/verification-results"
                        className="text-gov-navy font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Full Verification Summary</span>
                        <MaterialIcon name="chevron_right" className="text-[14px]" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <MaterialIcon name="terrain" className="text-gov-navy text-[16px]" />
                            Land Title &amp; Spatial Registry Match
                          </span>
                          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            VERIFIED
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          State Revenue Registry confirms freehold registered sale deed (Doc # TN-KPM-DEED-2018-9941)
                          for 12.40 contiguous acres with zero encumbrance.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <MaterialIcon name="school" className="text-gov-navy text-[16px]" />
                            Faculty Cadre &amp; Student Ratio
                          </span>
                          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            COMPLIANT
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          142 faculty members validated via Aadhaar / APAAR national database. Computed SFR is 1:13.8,
                          fully complying with the AICTE mandatory 1:15 norm.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <MaterialIcon name="apartment" className="text-gov-navy text-[16px]" />
                            Building &amp; Structural Safety Clearances
                          </span>
                          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            CERTIFIED
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Superintending Engineer PWD structural stability certificate verified through Oct 2027.
                          Fire &amp; Rescue Services NOC verified through Nov 2026.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-md border border-rose-200 bg-rose-50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900 flex items-center gap-1.5">
                            <MaterialIcon name="warning" className="text-rose-700 text-[16px]" />
                            Laboratory Photographic Evidence
                          </span>
                          <span className="text-[11px] font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">
                            DEFICIENCY
                          </span>
                        </div>
                        <p className="text-rose-800 leading-relaxed">
                          Fluid Mechanics Lab photographs lack embedded GPS coordinates. Deficiency notice served to
                          institution for re-upload with geotag.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: COMPLIANCE REVIEW */}
                {activeTab === 'compliance' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          AICTE Approval Process Handbook (APH 2026–27) Standards
                        </h3>
                        <p className="text-slate-500">
                          Automated evaluation against statutory norms defined in the Approval Process Handbook
                        </p>
                      </div>
                      <Link
                        to="/compliance"
                        className="text-gov-navy font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Open Compliance Workspace</span>
                        <MaterialIcon name="chevron_right" className="text-[14px]" />
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 rounded-md border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-mono text-[11px] font-semibold text-gov-navy">
                            APH 2026–27 • Appendix 4, Clause 4.1
                          </div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            Minimum Land Area Requirement
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            Requirement: 7.50 Acres contiguous land parcel. Verified: 12.40 Acres registered title deed.
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200 text-[11px]">
                          COMPLIANT
                        </span>
                      </div>

                      <div className="p-3 rounded-md border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-mono text-[11px] font-semibold text-gov-navy">
                            APH 2026–27 • Appendix 7, Table 7.1
                          </div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            Student to Faculty Ratio (SFR) 1:15
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            Mandatory maximum: 1:15. Computed ratio: 1:13.8 based on 142 authenticated faculty.
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200 text-[11px]">
                          COMPLIANT
                        </span>
                      </div>

                      <div className="p-3 rounded-md border border-rose-200 bg-rose-50 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-mono text-[11px] font-semibold text-rose-800">
                            APH 2026–27 • Appendix 5, Clause 5.3
                          </div>
                          <div className="font-bold text-rose-900 mt-0.5">
                            Geospatial Verification of Laboratory Apparatus
                          </div>
                          <div className="text-rose-800 mt-0.5">
                            Uploaded photographs must include embedded GPS coordinate tags. Fluid Mechanics Lab lacks coordinates.
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-semibold border border-rose-300 text-[11px]">
                          DEFICIENCY IDENTIFIED
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: TIMELINE */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Application Review History &amp; Audit Log
                        </h3>
                        <p className="text-slate-500">
                          Chronological record of statutory submissions, automated review runs, and official notices
                        </p>
                      </div>
                      <Link
                        to="/audit-trail"
                        className="text-gov-navy font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Full Central Audit Log</span>
                        <MaterialIcon name="chevron_right" className="text-[14px]" />
                      </Link>
                    </div>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {(application.timeline || []).map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-gov-navy border-2 border-white" />
                          <div className="p-3 rounded-md border border-slate-200 bg-slate-50 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="font-bold text-slate-900">{item.title}</span>
                              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                                <span>{item.date} • {item.time}</span>
                                {item.hash && (
                                  <span className="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                    {item.hash}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{item.description}</p>
                            <div className="pt-1 text-[11px] text-slate-500">
                              Actor: <strong className="text-slate-800">{item.actor}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
