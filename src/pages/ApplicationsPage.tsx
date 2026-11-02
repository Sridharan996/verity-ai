import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockApplicationsList } from '../data/mockData';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const pageSize = 6;

  // Filter applications
  const filteredApplications = mockApplicationsList.filter((app) => {
    const matchesSearch =
      app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.permanentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && app.status === 'verified') ||
      (statusFilter === 'under_review' && (app.status === 'under_review' || app.status === 'pending')) ||
      (statusFilter === 'flagged' && app.status === 'flagged');

    const matchesRegion =
      selectedRegion === 'all' || app.region.includes(selectedRegion);

    return matchesSearch && matchesStatus && matchesRegion;
  });

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + pageSize);

  const handleExportCSV = () => {
    const headers =
      'Application ID,Permanent ID,Institution Name,Region,State,Application Type,Category,Submission Date,Automated Score,Status\n';
    const rows = filteredApplications
      .map(
        (a) =>
          `"${a.applicationId}","${a.permanentId}","${a.institutionName}","${a.region}","${a.state}","${a.type}","${a.category}","${a.submissionDate}","${a.complianceScore}%","${a.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_Applications_Registry_AY2026-27.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported ${filteredApplications.length} application records to CSV.`);
    setTimeout(() => setExportNotice(null), 3500);
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
            {/* Page Header */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gov-navy">
                  <MaterialIcon name="assignment" className="text-[16px]" />
                  <span>Central Applications Registry • AY 2026–27</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Regulatory Applications Registry
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  Consolidated registry of higher technical institutions submitting applications for Extension of Approval,
                  Increase in Intake, or New Programmes. Filter by review status, regional jurisdiction, or application identifier.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="download" className="text-[16px] text-gov-navy" />
                  <span>Export CSV</span>
                </button>
                <Link
                  to="/document-verification"
                  className="px-3.5 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <MaterialIcon name="verified" className="text-[16px]" />
                  <span>Document Verification</span>
                </Link>
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

            {/* Advisory Note */}
            <div className="px-3.5 py-2 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MaterialIcon name="info" className="text-[16px] text-gov-navy shrink-0" />
                <span>
                  <strong>Official Review Notice:</strong> Automated extraction findings and scores serve as advisory review inputs for AICTE Scrutiny Committees.
                </span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
                APH 2026–27 Standards
              </span>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <MaterialIcon
                    name="search"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by Institution, Application ID, or Permanent ID..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gov-navy transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <MaterialIcon name="close" className="text-[14px]" />
                    </button>
                  )}
                </div>

                {/* Region filter */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-slate-600">Regional Office:</span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-gov-navy cursor-pointer"
                  >
                    <option value="all">All Regional Offices (India)</option>
                    <option value="Southern">Southern Regional Office (SRO)</option>
                    <option value="Western">Western Regional Office (WRO)</option>
                    <option value="Northern">Northern Regional Office (NRO)</option>
                    <option value="Eastern">Eastern Regional Office (ERO)</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
                <span className="font-medium text-slate-500 mr-1 text-[11px] uppercase tracking-wider">
                  Review Status:
                </span>
                {[
                  { key: 'all', label: `All (${mockApplicationsList.length})` },
                  { key: 'verified', label: 'Verified' },
                  { key: 'under_review', label: 'Awaiting Official Review' },
                  { key: 'flagged', label: 'Applications Requiring Attention' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(item.key);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      statusFilter === item.key
                        ? 'bg-gov-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>
                  Showing <strong>{filteredApplications.length > 0 ? startIndex + 1 : 0}</strong> to{' '}
                  <strong>{Math.min(startIndex + pageSize, filteredApplications.length)}</strong> of{' '}
                  <strong>{filteredApplications.length}</strong> matching regulatory applications
                </span>
                <span className="font-mono text-[11px]">AY 2026–27 Cycle</span>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-2.5 px-3">Application ID</th>
                      <th className="py-2.5 px-3">Institution Name &amp; Code</th>
                      <th className="py-2.5 px-3">Region &amp; State</th>
                      <th className="py-2.5 px-3">Application Type</th>
                      <th className="py-2.5 px-3">Submitted</th>
                      <th className="py-2.5 px-3">Review Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          <MaterialIcon name="search_off" className="text-2xl mb-1 text-slate-400" />
                          <p>No applications match the search query or selected status filter.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedApplications.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          <td className="py-3 px-3 font-mono font-semibold text-gov-navy whitespace-nowrap">
                            {app.applicationId}
                            <div className="text-[11px] text-slate-500 font-normal">
                              Perm ID: {app.permanentId}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 hover:text-gov-navy">
                              {app.institutionName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Code: {app.institutionCode}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            <div>{app.state}</div>
                            <div className="text-[11px] text-slate-500">{app.region}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-700">
                              {app.type}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-0.5">{app.category}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {app.submissionDate}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <StatusBadge status={app.status} count={app.deficiencyCount} />
                          </td>
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                to={`/applications/${app.id}`}
                                className="px-2.5 py-1 rounded bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-medium inline-flex items-center gap-1 shadow-sm"
                              >
                                <MaterialIcon name="visibility" className="text-[14px]" />
                                <span>Review Application</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Showing Page {safeCurrentPage} of {totalPages} ({filteredApplications.length} total applications)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        safeCurrentPage === pageNum
                          ? 'bg-gov-navy text-white font-medium'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
