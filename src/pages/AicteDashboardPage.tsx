import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { StatusBadge } from '../components/common/StatusBadge';
import { KpiCard } from '../components/common/KpiCard';

interface ApplicationRow {
  id: string;
  index: string;
  name: string;
  subname: string;
  appId: string;
  category: string;
  submission: string;
  status: 'under_review' | 'verified' | 'flagged' | 'pending';
  priorityLevel?: 'high' | 'medium' | 'normal';
  priorityReason?: string;
}

const mockApplications: ApplicationRow[] = [
  {
    id: '1',
    index: '01',
    name: 'Sri Venkateswara College of Engineering',
    subname: 'Autonomous • Tamil Nadu • Southern Region',
    appId: 'AICTE-EOA-2026-001',
    category: 'Extension of Approval & Intake Expansion',
    submission: '15 Jan 2026',
    status: 'flagged',
    priorityLevel: 'high',
    priorityReason: 'Deficiency: Missing laboratory geotag & expired NAAC certificate',
  },
  {
    id: '2',
    index: '02',
    name: 'Kumaraguru College of Technology',
    subname: 'Non-Minority • Coimbatore • Southern Region',
    appId: 'AICTE-EOA-2026-002',
    category: 'Extension of Approval',
    submission: '21 Oct 2026',
    status: 'verified',
    priorityLevel: 'normal',
    priorityReason: 'All statutory norms and evidence verified',
  },
  {
    id: '3',
    index: '03',
    name: 'PSG College of Technology',
    subname: 'Autonomous • Coimbatore • Southern Region',
    appId: 'AICTE-EOA-2026-003',
    category: 'Increase in Intake (AI & Data Science)',
    submission: '20 Oct 2026',
    status: 'flagged',
    priorityLevel: 'high',
    priorityReason: 'Cadre Discrepancy: Shortfall of 2 Associate Professors in AI & DS',
  },
  {
    id: '4',
    index: '04',
    name: 'Bannari Amman Institute of Tech',
    subname: 'Autonomous • Erode • Southern Region',
    appId: 'AICTE-EOA-2026-004',
    category: 'New Post Graduate Programme (M.Tech)',
    submission: '19 Oct 2026',
    status: 'pending',
    priorityLevel: 'medium',
    priorityReason: 'Awaiting Scrutiny Committee review slot allocation',
  },
  {
    id: '5',
    index: '05',
    name: 'Sona College of Technology',
    subname: 'Established 1997 • Salem • Southern Region',
    appId: 'AICTE-EOA-2026-005',
    category: 'Extension of Approval',
    submission: '18 Oct 2026',
    status: 'verified',
    priorityLevel: 'normal',
    priorityReason: 'Compliant with land and faculty cadre standards',
  },
  {
    id: '6',
    index: '06',
    name: 'Thiagarajar College of Engineering',
    subname: 'Autonomous • Madurai • Southern Region',
    appId: 'AICTE-EOA-2026-007',
    category: 'Extension of Approval & Expansion',
    submission: '16 Oct 2026',
    status: 'under_review',
    priorityLevel: 'medium',
    priorityReason: 'Under review by Southern Regional Office Committee Bench',
  },
];

const priorityActionItems = [
  {
    appId: 'AICTE-EOA-2026-001',
    institution: 'Sri Venkateswara College of Engineering',
    issue: 'Laboratory evidence missing GPS EXIF tags; NAAC certificate expired 11 Mar 2026.',
    actionRequired: 'Review deficiency response and decide on provisional undertaking.',
    targetRoute: '/applications/AICTE-EOA-2026-001',
    deadline: 'Hearing: 22 Oct 2026',
    severity: 'critical',
  },
  {
    appId: 'AICTE-EOA-2026-003',
    institution: 'PSG College of Technology',
    issue: 'Cadre ratio shortfall: Short 2 Associate Professors per AICTE 1:2:6 norm.',
    actionRequired: 'Assess institutional recruitment undertaking for semester AY 2026-27.',
    targetRoute: '/compliance',
    deadline: 'Decision SLA: 24h',
    severity: 'critical',
  },
  {
    appId: 'AICTE-EOA-2026-004',
    institution: 'Bannari Amman Institute of Tech',
    issue: 'New Programme dossier awaiting Scrutiny Committee bench allocation.',
    actionRequired: 'Assign scrutiny officer and verify AI laboratory infrastructure.',
    targetRoute: '/document-verification?appId=AICTE-EOA-2026-004',
    deadline: 'Queue: In Next Batch',
    severity: 'pending',
  },
];

export const AicteDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'review' | 'flagged'>('all');
  const [tablePage, setTablePage] = useState(1);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportGazette = () => {
    const csvContent =
      'Index,Institution Name,Subname,Application ID,Category,Submission Date,Status\n' +
      mockApplications
        .map(
          (a) =>
            `"${a.index}","${a.name}","${a.subname}","${a.appId}","${a.category}","${a.submission}","${a.status}"`
        )
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_Approval_Order_AY2026-27.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportNotice('Exported Gazette Approval Order (AY 2026–27) to CSV.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const filteredApps = mockApplications.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'verified') return app.status === 'verified';
    if (filter === 'review') return app.status === 'under_review' || app.status === 'pending';
    if (filter === 'flagged') return app.status === 'flagged';
    return true;
  });

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      {/* Fixed Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="dashboard"
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <TopHeader
          role="aicte"
          userName="Dr. R. Sharma"
          userRoleTitle="Director, Approval Bureau"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Dashboard Main Canvas */}
        <main className="w-full pt-16 bg-slate-50 flex-1">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Title & Administrative Context */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gov-navy">
                  <MaterialIcon name="account_balance" className="text-[16px]" />
                  <span>AICTE Regulatory Oversight Desk • Central Clearinghouse</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Regulatory Application Review Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Central supervisory cockpit for the 2026–27 technical approval cycle. Review automated
                  evidence extraction, monitor statutory norm compliance, and issue formal regulatory decisions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to="/applications"
                  className="px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <MaterialIcon name="assignment" className="text-[16px] text-slate-500" />
                  <span>All Applications (248)</span>
                </Link>
                <button
                  type="button"
                  onClick={handleExportGazette}
                  className="px-3.5 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="file_download" className="text-[16px]" />
                  <span>Export Review Gazette</span>
                </button>
              </div>
            </div>

            {/* Notification Alert if exported */}
            {exportNotice && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-4 py-2.5 rounded-md flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MaterialIcon name="check_circle" className="text-teal-600 text-[16px]" />
                  {exportNotice}
                </span>
                <button onClick={() => setExportNotice(null)} className="text-teal-700 font-bold">✕</button>
              </div>
            )}

            {/* 4 Summary Metrics Answering Key Operational Questions */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Question 1: How many applications have been received? */}
              <KpiCard
                title="1. Applications Received"
                subtitle="Total Submissions (AY 2026–27)"
                value="248"
                icon="inbox"
                iconBgClass="bg-slate-100"
                iconTextClass="text-gov-navy"
                helperText="100% of cycle intake registered"
                badgeText="All Regions"
                progressPercent={100}
                progressBarColorClass="bg-gov-navy"
              />

              {/* Question 2: How many are awaiting review? */}
              <KpiCard
                title="2. Awaiting Review"
                subtitle="Under Scrutiny or Queue"
                value="68"
                icon="schedule"
                iconBgClass="bg-amber-50"
                iconTextClass="text-amber-700"
                trendText="27.4%"
                trendSubtext="of received dossiers"
                trendColorClass="text-amber-800"
                badgeText="Review Pending"
                badgeClass="bg-amber-50 text-amber-800 border-amber-200"
                progressPercent={27.4}
                progressBarColorClass="bg-amber-500"
              />

              {/* Question 3: How many have completed verification? */}
              <KpiCard
                title="3. Completed Verification"
                subtitle="Norms Satisfied & Cleared"
                value="142"
                icon="check_circle"
                iconBgClass="bg-teal-50"
                iconTextClass="text-teal-700"
                trendText="57.3%"
                trendSubtext="scrutiny concluded"
                trendColorClass="text-teal-800"
                badgeText="Verified"
                badgeClass="bg-teal-50 text-teal-800 border-teal-200"
                progressPercent={57.3}
                progressBarColorClass="bg-teal-600"
              />

              {/* Question 4: How many require attention? */}
              <KpiCard
                title="4. Requiring Attention"
                subtitle="Deficiencies or Shortfalls"
                value="38"
                valueColorClass="text-rose-700"
                icon="report_problem"
                iconBgClass="bg-rose-50"
                iconTextClass="text-rose-700"
                trendText="15.3%"
                trendSubtext="action required"
                trendColorClass="text-rose-700 font-semibold"
                badgeText="Immediate Action"
                badgeClass="bg-rose-50 text-rose-800 border-rose-200"
                progressPercent={15.3}
                progressBarColorClass="bg-rose-600"
              />
            </section>

            {/* Question 5: What should the official review next? */}
            <section className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-600" />
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Applications Requiring Immediate Attention
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                    Priority Queue (3)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dossiers flagged with documentary deficiencies or statutory ratio mismatches
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {priorityActionItems.map((item) => (
                  <div
                    key={item.appId}
                    className="p-3.5 rounded-md border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-semibold text-gov-navy">
                          {item.appId}
                        </span>
                        <span className="text-slate-500 font-medium">{item.deadline}</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.institution}
                      </h3>
                      <p className="text-xs text-rose-700 mt-1 line-clamp-2 leading-relaxed">
                        {item.issue}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 truncate max-w-[170px]">
                        {item.actionRequired}
                      </span>
                      <Link
                        to={item.targetRoute}
                        className="px-2.5 py-1 rounded bg-gov-navy text-white text-[11px] font-medium hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Review</span>
                        <MaterialIcon name="arrow_forward" className="text-[12px]" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Main Operational Split: Recent Applications Table & Review Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Recent Applications Table (8 cols) */}
              <section className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Recent Applications
                    </h2>
                    <p className="text-xs text-slate-500">
                      Applications awaiting regulatory review across AICTE Regional Offices
                    </p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilter('all')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        filter === 'all'
                          ? 'bg-gov-navy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      All (248)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter('verified')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        filter === 'verified'
                          ? 'bg-gov-navy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      Verified (142)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter('review')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        filter === 'review'
                          ? 'bg-gov-navy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      Awaiting Review (68)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter('flagged')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        filter === 'flagged'
                          ? 'bg-gov-navy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      Requiring Attention (38)
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Institution Name</th>
                        <th className="py-2.5 px-3">Application ID</th>
                        <th className="py-2.5 px-3">Application Type</th>
                        <th className="py-2.5 px-3">Submitted</th>
                        <th className="py-2.5 px-3">Review Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => navigate(`/applications/${app.appId}`)}
                        >
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {app.index}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 hover:text-gov-navy">
                              {app.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {app.subname}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                            {app.appId}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                              {app.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {app.submission}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <Link
                              to={`/applications/${app.appId}`}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium inline-flex items-center gap-1 border border-slate-200"
                            >
                              <MaterialIcon name="visibility" className="text-[14px]" />
                              <span>Open</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Bottom Navigation */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    Showing {filteredApps.length} of 248 registered applications in AY 2026–27
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={tablePage === 1}
                      onClick={() => setTablePage(Math.max(1, tablePage - 1))}
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 cursor-pointer text-xs"
                    >
                      Previous
                    </button>
                    <span className="px-2 text-slate-700 font-medium">Page {tablePage}</span>
                    <button
                      type="button"
                      onClick={() => setTablePage(tablePage + 1)}
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer text-xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>

              {/* Right Column: Workload Distribution & Regional Breakdown (4 cols) */}
              <aside className="lg:col-span-4 space-y-4">
                {/* Status Distribution Summary */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Application Status Distribution
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      248 Total
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-teal-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                          Verified
                        </span>
                        <span className="font-mono text-slate-700">142 (57.3%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-full rounded-full" style={{ width: '57.3%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-amber-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Awaiting Review
                        </span>
                        <span className="font-mono text-slate-700">68 (27.4%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '27.4%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-rose-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          Deficiency Identified
                        </span>
                        <span className="font-mono text-slate-700">38 (15.3%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-600 h-full rounded-full" style={{ width: '15.3%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regional Workload Distribution */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Workload by Regional Office
                    </h3>
                    <MaterialIcon name="place" className="text-slate-400 text-[18px]" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Southern Region (SRO)</div>
                        <div className="text-[11px] text-slate-500">Tamil Nadu, Kerala, Puducherry</div>
                      </div>
                      <span className="font-mono font-bold text-gov-navy text-xs bg-white px-2 py-1 rounded border border-slate-200">
                        112 Dossiers
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Western Region (WRO)</div>
                        <div className="text-[11px] text-slate-500">Maharashtra, Goa, Gujarat</div>
                      </div>
                      <span className="font-mono font-bold text-gov-navy text-xs bg-white px-2 py-1 rounded border border-slate-200">
                        64 Dossiers
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Northern Region (NRO)</div>
                        <div className="text-[11px] text-slate-500">Uttar Pradesh, Bihar, Uttarakhand</div>
                      </div>
                      <span className="font-mono font-bold text-gov-navy text-xs bg-white px-2 py-1 rounded border border-slate-200">
                        48 Dossiers
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Eastern Region (ERO)</div>
                        <div className="text-[11px] text-slate-500">West Bengal, Odisha, Assam</div>
                      </div>
                      <span className="font-mono font-bold text-gov-navy text-xs bg-white px-2 py-1 rounded border border-slate-200">
                        24 Dossiers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Regulatory Links */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Regulatory Workspaces
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      to="/document-verification"
                      className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <MaterialIcon name="verified" className="text-[16px] text-gov-navy" />
                      <span>Document Scrutiny</span>
                    </Link>
                    <Link
                      to="/compliance"
                      className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <MaterialIcon name="rule" className="text-[16px] text-gov-navy" />
                      <span>Compliance Review</span>
                    </Link>
                    <Link
                      to="/infrastructure"
                      className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <MaterialIcon name="apartment" className="text-[16px] text-gov-navy" />
                      <span>Infrastructure</span>
                    </Link>
                    <Link
                      to="/verification-results"
                      className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <MaterialIcon name="fact_check" className="text-[16px] text-gov-navy" />
                      <span>Verification Summary</span>
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
