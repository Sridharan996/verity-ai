import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { StatusBadge } from '../components/common/StatusBadge';
import { DocumentUploadModal } from '../components/common/DocumentUploadModal';
import { DocumentMetadata } from '../services/documentApi';
import {
  INSTITUTION_DEPARTMENTS,
  DepartmentFacultyInfo,
} from '../data/institutionFacultyData';

export const InstitutionDashboardPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('land_deed');

  // Navigation tabs within Institution Portal
  const [activeMainTab, setActiveMainTab] = useState<'applications' | 'faculty'>('applications');

  // Academic & Faculty Information state
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>('CSE');
  const [cadreFilter, setCadreFilter] = useState<'all' | 'Professor' | 'Associate Professor' | 'Assistant Professor'>('all');
  const [facultySearch, setFacultySearch] = useState('');

  const currentDepartment: DepartmentFacultyInfo =
    INSTITUTION_DEPARTMENTS.find((d) => d.code === selectedDeptCode) || INSTITUTION_DEPARTMENTS[0];

  const handleDownloadHandbook = () => {
    const content = `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
MINISTRY OF EDUCATION, GOVERNMENT OF INDIA
APPROVAL PROCESS HANDBOOK (APH 2026–27)
INSTITUTIONAL GUIDELINES & STATUTORY TIMELINE

1. EXTENSION OF APPROVAL (EoA) TIMELINE
   - Online submission deadline: 15 March 2026
   - Scrutiny hearing window: 20 October 2026 onwards

2. MANDATORY STATUTORY CHECKLIST:
   - Registered Freehold Title Deed (Nil encumbrance)
   - Cadastral GIS Boundary Map & Geo-fencing
   - PWD Structural Stability Certificate (IS 1893:2016)
   - Directorate Fire & Rescue Services NOC
   - Approved Municipal Building Floor Plans
   - Faculty Biometric Aadhaar / APAAR Sync (1:15 SFR Mandate)
   - Geo-Tagged Laboratory Apparatus Evidence (Appendix 5)

3. REGIONAL OFFICE CONTACT:
   Southern Regional Office (SRO), Shastri Bhavan, 26 Haddows Road, Nungambakkam, Chennai - 600006
   Telephone: 044-2827-5650 | Helpdesk: 011-2958-1000`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AICTE_Approval_Process_Handbook_2026-27_Institutions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice('Downloaded AICTE Approval Process Handbook (AY 2026–27) Guidelines.');
    setTimeout(() => setNotice(null), 3500);
  };

  const handleHelpDesk = () => {
    setNotice('Regulatory Helpdesk: Regional Officer SRO (Dr. Anand Kumar) at 011-2958-1000 or helpdesk@aicte-india.org.');
    setTimeout(() => setNotice(null), 5000);
  };

  const handleExportApplications = () => {
    const csvContent =
      'Application ID,Type,Department/Programme,Submission Date,Review Status\n' +
      '"AICTE-EOA-2026-001","Extension of Approval & Intake Expansion","UG Engg (CSE, AI&DS)","15 Jan 2026","Deficiency Identified (2 Items)"\n' +
      '"AICTE-INT-2026-089","New Programme Introduction","M.Tech Cyber Security","02 Feb 2026","Awaiting Official Review"\n' +
      '"AICTE-NRI-2025-014","NRI/PIO Quota Approval","Institutional Quota Allotment","10 Nov 2025","Verified & Approved (AY 25-26)"\n' +
      '"AICTE-DIV-2025-042","Division Addition - ECE","UG Engg (ECE 2nd Shift)","22 Aug 2025","Closed"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SVCE_AICTE_Applications_Ledger.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice('Exported 4 institutional application records to CSV.');
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExportFacultyCsv = (dept: DepartmentFacultyInfo) => {
    let csv =
      'Faculty ID,Name,Designation,Cadre,Qualification,Specialization,Experience (Years),Appointment Type,APAAR ID,APAAR Status,Salary Disbursal\n';
    dept.facultyRoster.forEach((f) => {
      csv += `"${f.id}","${f.name}","${f.designation}","${f.cadre}","${f.qualification}","${f.specialization}",${f.experienceYears},"${f.appointmentType}","${f.apaarId}","${
        f.apaarVerified ? 'Verified' : 'Pending'
      }","${f.salaryDisbursalVerified ? 'Bank NEFT Verified' : 'Pending'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dept.code}_Faculty_Roster_AY2026-27.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice(`Exported ${dept.shortName} faculty roster (${dept.facultyRoster.length} records) to CSV.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleUploadSuccess = (meta: DocumentMetadata) => {
    setNotice(`Statutory document '${meta.original_filename}' uploaded and queued for review.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const openUploadModalWithCategory = (cat: string) => {
    setUploadCategory(cat);
    setIsUploadModalOpen(true);
  };

  // Filtered faculty list
  const filteredFaculty = currentDepartment.facultyRoster.filter((f) => {
    const matchesCadre = cadreFilter === 'all' || f.cadre === cadreFilter;
    const matchesSearch =
      facultySearch === '' ||
      f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.qualification.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.specialization.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.apaarId.includes(facultySearch);
    return matchesCadre && matchesSearch;
  });

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="institution-portal"
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader
          role="institution"
          userName="Registrar (SVCE)"
          userRoleTitle="Sri Venkateswara College of Engineering"
          avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBg447LLb11o_h1B3qYtvzYLTPRwKkTSUD1Bg2D49if8dvb-qEJ6tNk7vdng3Bl4i3Ya-0L0wIMJjrVBBiOYO0utbHzwW-xFqkfPiX4XGFQCwrAq3r-kTuISc2N21RZSjFCOJ4ie41MxYsGefTcQB7QePPgoId4eTmXS8x5-khfSyHwyQjBtRz_ewYqFhze2yWsUtKUoR8ySMrFUJe40hSR3e7f_Dt6bqYJZfdJNKQ"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="w-full pt-16 bg-slate-50 flex-1">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            {/* Institution Master Banner */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gov-navy">
                  <MaterialIcon name="domain" className="text-[16px]" />
                  <span>Institutional Applicant Portal • AY 2026–27</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sri Venkateswara College of Engineering
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span>
                    Permanent Institute ID: <strong className="font-mono text-slate-900">1-4296181</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>Southern Regional Office (SRO)</span>
                  <span className="text-slate-300">•</span>
                  <span>Affiliated to Anna University, Chennai</span>
                </div>
              </div>

              {/* Top Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openUploadModalWithCategory('land_deed')}
                  className="px-3.5 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="upload_file" className="text-[16px]" />
                  <span>Upload Statutory Document</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadHandbook}
                  className="px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="menu_book" className="text-[16px] text-gov-navy" />
                  <span>Handbook Guidelines</span>
                </button>
                <button
                  type="button"
                  onClick={handleHelpDesk}
                  className="px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="support_agent" className="text-[16px] text-slate-500" />
                  <span>Regulatory Helpdesk</span>
                </button>
              </div>
            </div>

            {/* Notification Alert */}
            {notice && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-4 py-2.5 rounded-md flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MaterialIcon name="info" className="text-teal-600 text-[16px]" />
                  {notice}
                </span>
                <button onClick={() => setNotice(null)} className="text-teal-700 font-bold cursor-pointer">
                  ✕
                </button>
              </div>
            )}

            {/* Primary Section Tabs: Applications & Scrutiny vs Academic & Faculty Information */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-4 pt-3 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveMainTab('applications')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeMainTab === 'applications'
                    ? 'border-gov-navy text-gov-navy font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MaterialIcon name="assignment" className="text-[18px]" />
                <span>Applications &amp; Review Progress</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                  3 Active
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('faculty')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeMainTab === 'faculty'
                    ? 'border-gov-navy text-gov-navy font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MaterialIcon name="school" className="text-[18px]" />
                <span>Academic &amp; Faculty Information</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-mono font-bold">
                  142 Faculty • 4 Departments
                </span>
              </button>
            </div>

            {/* TAB 1: APPLICATIONS & REVIEW PROGRESS */}
            {activeMainTab === 'applications' && (
              <div className="space-y-5">
                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1">
                    <div className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      Submitted Applications
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tabular-nums">3</div>
                    <div className="text-slate-500 text-[11px]">AY 2026–27 Cycle Applications</div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1">
                    <div className="text-amber-800 font-semibold uppercase tracking-wider text-[11px]">
                      Awaiting Review
                    </div>
                    <div className="text-2xl font-bold text-amber-900 tabular-nums">1</div>
                    <div className="text-amber-700 text-[11px]">In Regional Scrutiny Queue</div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-rose-200 shadow-sm space-y-1 bg-rose-50/40">
                    <div className="text-rose-800 font-semibold uppercase tracking-wider text-[11px]">
                      Applications Requiring Attention
                    </div>
                    <div className="text-2xl font-bold text-rose-900 tabular-nums">2 Items</div>
                    <div className="text-rose-700 font-medium text-[11px]">Deficiency Notices Pending Response</div>
                  </div>

                  {/* Quick Card pointing to Faculty Data */}
                  <div className="p-4 rounded-lg bg-white border border-teal-200 shadow-sm space-y-1 bg-teal-50/30 flex flex-col justify-between">
                    <div>
                      <div className="text-teal-800 font-semibold uppercase tracking-wider text-[11px]">
                        Faculty &amp; Cadre Roster
                      </div>
                      <div className="text-2xl font-bold text-teal-900 tabular-nums">142</div>
                      <div className="text-teal-700 font-medium text-[11px]">SFR 1:13.8 (APH Compliant)</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('faculty')}
                      className="text-gov-navy text-[11px] font-bold hover:underline inline-flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <span>Manage Academic Records</span>
                      <MaterialIcon name="arrow_forward" className="text-[12px]" />
                    </button>
                  </div>
                </div>

                {/* 4-Stage Regulatory Workflow Progress Stepper */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-gov-navy uppercase tracking-wider">
                        Current Application
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                        Extension of Approval &amp; Increase in Intake (CSE, AI&amp;DS) • AICTE-EOA-2026-001
                      </h2>
                    </div>
                    <Link
                      to="/audit-trail"
                      className="text-gov-navy font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Review History &amp; Audit Log</span>
                      <MaterialIcon name="chevron_right" className="text-[14px]" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    {/* Stage 1: Completed */}
                    <div className="p-3 rounded-md bg-teal-50 border border-teal-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-900">1. Submitted</span>
                        <MaterialIcon name="check_circle" className="text-teal-700 text-[16px]" />
                      </div>
                      <div className="text-[11px] text-teal-800">15 Jan 2026 • Fee Verified</div>
                    </div>

                    {/* Stage 2: In Progress */}
                    <div className="p-3 rounded-md bg-blue-50 border border-blue-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900">2. Verification In Progress</span>
                        <MaterialIcon name="sync" className="text-blue-700 text-[16px]" />
                      </div>
                      <div className="text-[11px] text-blue-800">Automated Scrutiny Active</div>
                    </div>

                    {/* Stage 3: Deficiency Resolution */}
                    <div className="p-3 rounded-md bg-rose-50 border border-rose-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900">3. Action Required</span>
                        <MaterialIcon name="report_problem" className="text-rose-700 text-[16px]" />
                      </div>
                      <div className="text-[11px] text-rose-800 font-semibold">2 Deficiencies Served</div>
                    </div>

                    {/* Stage 4: Final Order */}
                    <div className="p-3 rounded-md bg-slate-50 border border-slate-200 opacity-70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">4. Final Decision</span>
                        <span className="text-[10px] text-slate-500 font-mono">Pending</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Gazette Order Issuance</div>
                    </div>
                  </div>
                </div>

                {/* Deficiencies Requiring Immediate Attention */}
                <div className="bg-white rounded-lg border border-rose-300 shadow-sm p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-100 text-xs">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="report_problem" className="text-rose-700 text-[20px]" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Deficiencies Requiring Immediate Institutional Response
                        </h3>
                        <p className="text-slate-500 text-[11px]">
                          Upload required evidence or institutional undertaking prior to the Scrutiny Committee hearing
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                      2 Open Notices
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Item 1 */}
                    <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Missing Geotagged Laboratory Photos</span>
                          <span className="font-mono text-[10px] text-rose-800 font-semibold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            INFRA-MECH-04
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Upload clear geo-tagged and timestamped photographs of the <strong>Mechanical Fluid Mechanics Lab</strong> showcasing required equipment sets per AICTE Norms Appendix 5.
                        </p>
                        <div className="text-[11px] text-slate-500">
                          Notice Served: 2 Days Ago • Hearing Slot: 22 Oct 2026
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => openUploadModalWithCategory('other')}
                          className="px-3 py-1.5 rounded bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light inline-flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <MaterialIcon name="upload" className="text-[14px]" />
                          <span>Upload Geotagged Photos</span>
                        </button>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Expired NAAC Accreditation Certificate</span>
                          <span className="font-mono text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            GOV-NAAC-26
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          NAAC Certificate expired on 11 Mar 2026. Upload provisional institutional undertaking with peer-review visit acknowledgment receipt.
                        </p>
                        <div className="text-[11px] text-slate-500">
                          Notice Served: Yesterday • Signed by Principal
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => openUploadModalWithCategory('aicte_affidavit')}
                          className="px-3 py-1.5 rounded bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light inline-flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <MaterialIcon name="upload" className="text-[14px]" />
                          <span>Upload Undertaking</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900">Institutional Submissions Ledger</h3>
                      <p className="text-slate-500 text-[11px]">
                        Submissions across Academic Cycles 2025–26 and 2026–27
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterActive(!filterActive)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer ${
                          filterActive
                            ? 'bg-gov-navy text-white border-gov-navy'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {filterActive ? 'Showing Active Cycle' : 'Filter Cycle'}
                      </button>
                      <button
                        type="button"
                        onClick={handleExportApplications}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <MaterialIcon name="download" className="text-[14px]" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                          <th className="py-2.5 px-3">Application ID</th>
                          <th className="py-2.5 px-3">Type &amp; Department</th>
                          <th className="py-2.5 px-3">Submission Date</th>
                          <th className="py-2.5 px-3">Review Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-semibold text-gov-navy">
                            AICTE-EOA-2026-001
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">
                              Extension of Approval &amp; Intake Expansion
                            </div>
                            <div className="text-[11px] text-slate-500">UG Engg (CSE, AI&amp;DS)</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">15 Jan 2026</td>
                          <td className="py-3 px-3">
                            <StatusBadge status="Deficiency Identified" count={2} />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                to="/applications/AICTE-EOA-2026-001"
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200"
                              >
                                Dossier
                              </Link>
                              <button
                                type="button"
                                onClick={() => openUploadModalWithCategory('other')}
                                className="px-2.5 py-1 rounded bg-gov-navy text-white text-xs font-medium hover:bg-gov-navy-light shadow-sm cursor-pointer"
                              >
                                Resolve
                              </button>
                            </div>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-semibold text-gov-navy">
                            AICTE-INT-2026-089
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">New Course Introduction</div>
                            <div className="text-[11px] text-slate-500">M.Tech Cyber Security</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">02 Feb 2026</td>
                          <td className="py-3 px-3">
                            <StatusBadge status="Awaiting Official Review" />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              to="/applications/AICTE-EOA-2026-004"
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200"
                            >
                              View Status
                            </Link>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-semibold text-slate-600">
                            AICTE-NRI-2025-014
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">NRI / PIO Supernumerary Quota</div>
                            <div className="text-[11px] text-slate-500">Institutional Quota Allotment</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">10 Nov 2025</td>
                          <td className="py-3 px-3">
                            <StatusBadge status="Closed" label="Approved & Concluded (AY 25-26)" />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              to="/reports"
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200"
                            >
                              Order Copy
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC & FACULTY INFORMATION */}
            {activeMainTab === 'faculty' && (
              <div className="space-y-5">
                {/* Section Header & Explanatory Notice */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gov-navy">
                      <MaterialIcon name="school" className="text-[18px]" />
                      <span>Academic &amp; Faculty Administration</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      Department-Wise Faculty Cadre &amp; Student-to-Faculty Ratio (SFR)
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Managed and submitted by authorized institution administrators per AICTE Approval Process Handbook (APH 2026–27) Chapter 3 norms.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openUploadModalWithCategory('faculty_cadre')}
                      className="px-3 py-1.5 rounded bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <MaterialIcon name="upload_file" className="text-[15px]" />
                      <span>Upload Department Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportFacultyCsv(currentDepartment)}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <MaterialIcon name="download" className="text-[15px]" />
                      <span>Export Roster CSV</span>
                    </button>
                  </div>
                </div>

                {/* Department Selection Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {INSTITUTION_DEPARTMENTS.map((dept) => {
                    const isSelected = dept.code === selectedDeptCode;
                    return (
                      <button
                        key={dept.code}
                        type="button"
                        onClick={() => {
                          setSelectedDeptCode(dept.code);
                          setCadreFilter('all');
                          setFacultySearch('');
                        }}
                        className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-gov-navy text-white border-gov-navy shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{dept.shortName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : dept.cadreStatus === 'attention_required'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {dept.facultyCount} Faculty
                        </span>
                        {dept.cadreStatus === 'attention_required' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Deficiency Notice Active" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Department Overview & Cadre Ratio Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  {/* Card 1: Department Info */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Department Leadership
                    </div>
                    <div className="text-sm font-bold text-slate-900">{currentDepartment.hodName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{currentDepartment.hodEmail}</div>
                    <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                      Sanctioned Intake: <strong>{currentDepartment.sanctionedIntake} seats</strong>
                    </div>
                  </div>

                  {/* Card 2: Student to Faculty Ratio (SFR) */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Student-to-Faculty (SFR)
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                        Compliant
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gov-navy tabular-nums">
                      {currentDepartment.sfr}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Mandatory APH Norm: <strong>1:15</strong> • Total Students: {currentDepartment.totalStudents}
                    </div>
                  </div>

                  {/* Card 3: Cadre Ratio Breakdown */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Cadre Distribution
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          currentDepartment.cadreStatus === 'compliant'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {currentDepartment.cadreStatus === 'compliant' ? '1:2:6 Verified' : 'Action Required'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 space-y-0.5 pt-0.5">
                      <div className="flex justify-between">
                        <span>Professors:</span>
                        <strong className="font-mono text-slate-900">
                          {currentDepartment.cadreDistribution.professors} (Norm: {currentDepartment.cadreDistribution.normProfessors})
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Assoc. Professors:</span>
                        <strong
                          className={`font-mono ${
                            currentDepartment.cadreDistribution.associateProfessors <
                            currentDepartment.cadreDistribution.normAssociateProfessors
                              ? 'text-rose-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {currentDepartment.cadreDistribution.associateProfessors} (Norm: {currentDepartment.cadreDistribution.normAssociateProfessors})
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Asst. Professors:</span>
                        <strong className="font-mono text-slate-900">
                          {currentDepartment.cadreDistribution.assistantProfessors} (Norm: {currentDepartment.cadreDistribution.normAssistantProfessors})
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: APAAR & Salary Disbursal Verification */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Biometric &amp; Form 16 Sync
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold pt-1">
                      <MaterialIcon name="verified" className="text-teal-700 text-[18px]" />
                      <span>100% APAAR ID Linked</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      National Faculty Database authentication completed via Aadhaar e-KYC.
                    </div>
                    <div className="text-[11px] text-slate-500 pt-0.5">
                      Bank NEFT Disbursal: <strong>Verified</strong>
                    </div>
                  </div>
                </div>

                {/* Faculty-Related Deficiency Notice (if any) */}
                {currentDepartment.deficiencyNotice && (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold font-mono text-[11px]">
                          {currentDepartment.deficiencyNotice.tag}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {currentDepartment.deficiencyNotice.title}
                        </h4>
                      </div>
                      <p className="text-slate-700 leading-relaxed max-w-3xl">
                        {currentDepartment.deficiencyNotice.description}
                      </p>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-0.5">
                        <span>Notice Served: {currentDepartment.deficiencyNotice.servedDate}</span>
                        <span>•</span>
                        <span>Hearing Date: <strong>{currentDepartment.deficiencyNotice.hearingDate}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openUploadModalWithCategory('faculty_cadre')}
                      className="px-3.5 py-2 rounded bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                    >
                      <MaterialIcon name="upload" className="text-[16px]" />
                      <span>Upload Cadre Undertaking</span>
                    </button>
                  </div>
                )}

                {/* Department Faculty Roster Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {currentDepartment.name} — Faculty Roster
                      </h3>
                      <p className="text-slate-500 text-[11px]">
                        Cross-referenced with National Faculty Database &amp; APAAR Central Repository
                      </p>
                    </div>

                    {/* Cadre Filter Buttons & Search */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <MaterialIcon
                          name="search"
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]"
                        />
                        <input
                          type="text"
                          value={facultySearch}
                          onChange={(e) => setFacultySearch(e.target.value)}
                          placeholder="Search faculty, qualification..."
                          className="pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gov-navy w-48 sm:w-56"
                        />
                      </div>

                      <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
                        {(['all', 'Professor', 'Associate Professor', 'Assistant Professor'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCadreFilter(c)}
                            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                              cadreFilter === c
                                ? 'bg-gov-navy text-white font-semibold shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {c === 'all' ? 'All' : c.replace('Professor', 'Prof')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                          <th className="py-2.5 px-3">Faculty ID &amp; Name</th>
                          <th className="py-2.5 px-3">Cadre &amp; Designation</th>
                          <th className="py-2.5 px-3">Highest Qualification</th>
                          <th className="py-2.5 px-3">Specialization</th>
                          <th className="py-2.5 px-3">Experience</th>
                          <th className="py-2.5 px-3">APAAR / Aadhaar Status</th>
                          <th className="py-2.5 px-3 text-right">Salary Disbursal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFaculty.map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{f.name}</div>
                              <div className="text-[11px] font-mono text-slate-500">{f.id}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{f.designation}</div>
                              <div className="text-[11px] text-slate-500">{f.appointmentType}</div>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {f.qualification}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {f.specialization}
                            </td>
                            <td className="py-2.5 px-3 text-slate-800 font-mono">
                              {f.experienceYears} Years
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[11px]">
                                <MaterialIcon name="verified" className="text-teal-600 text-[14px]" />
                                <span className="font-mono">{f.apaarId}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                                Bank NEFT Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Department Supporting Documents */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Department-Level Supporting Documents ({currentDepartment.shortName})
                      </h3>
                      <p className="text-slate-500 text-[11px]">
                        Service registers, APAAR attendance logs, and consolidated salary Form 16 statements
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openUploadModalWithCategory('faculty_cadre')}
                      className="px-2.5 py-1 rounded bg-gov-navy text-white text-xs font-medium hover:bg-gov-navy-light inline-flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <MaterialIcon name="upload" className="text-[14px]" />
                      <span>Upload Proof Document</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {currentDepartment.supportingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 truncate" title={doc.name}>
                              {doc.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                                doc.status === 'Verified'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">{doc.category}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {doc.fileSize} • Uploaded {doc.uploadDate}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate" title={doc.hash}>
                            SHA-256: {doc.hash}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setNotice(`Viewing verified cryptographic hash for ${doc.name}: ${doc.hash}`);
                              setTimeout(() => setNotice(null), 4000);
                            }}
                            className="text-gov-navy text-[11px] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Inspect Verification Proof</span>
                            <MaterialIcon name="chevron_right" className="text-[14px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultApplicationId="AICTE-EOA-2026-001"
        defaultInstitutionId="1-4296181"
        defaultCategory={uploadCategory}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};
