import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { StatusBadge } from '../components/common/StatusBadge';

interface FacilityItem {
  id: string;
  title: string;
  category: 'classroom' | 'lab' | 'workshop' | 'cad';
  categoryLabel: string;
  imageUrl: string;
  capacity: string;
  carpetArea: string;
  status: 'verified' | 'flagged' | 'pending';
  complianceTag: string;
  geoCoordinates: string;
  equipmentCount?: string;
  submittedEvidence: {
    claimedCapacity: string;
    claimedArea: string;
    submittedPhotosCount: number;
    uploadDate: string;
    exifStatus: string;
  };
  automatedObservations: string[];
}

const mockFacilities: FacilityItem[] = [
  {
    id: 'fac-1',
    title: 'High-Performance Computing & AI Research Laboratory',
    category: 'lab',
    categoryLabel: 'Computer & AI Laboratories',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB12B9H4IF3L3hkAiAeJqrwWhuK433vCdEEVTnFPnD_KBIfOsBuqYLR_CXte518XOptp-b5o_WZ4s85mMeE60-bgT9Mi0Yq5gy11-PvwKpVECsiQpWU9qfdFdmxfoV8cKZjUjs1zwutrKInBjdJG81Z-rHEW8pF5z32FSpUFNPvJJaj38E34HGkciJW90QXgpWh5grSc5d3Yw7E9524kL6V0pnoyGDKKmXwdL4_iOA',
    capacity: '64 Workstations',
    carpetArea: '220 sq.m',
    status: 'verified',
    complianceTag: 'AICTE Norm Appendix 5 Compliant',
    geoCoordinates: '12.9882° N, 79.9723° E',
    equipmentCount: '64 GPU Workstations, 1 Gbps Fiber Backbone, Dual Online UPS',
    submittedEvidence: {
      claimedCapacity: '60 Terminals',
      claimedArea: '210 sq.m',
      submittedPhotosCount: 6,
      uploadDate: '15 Jan 2026',
      exifStatus: 'Verified (GPS Lat 12.9882, Long 79.9723)',
    },
    automatedObservations: [
      'Automated terminal counting verified 64 active workstations (exceeds claimed 60).',
      'Floor space calculation confirms 3.43 sq.m per terminal, complying with AICTE norms.',
      'Fire-retardant server enclosures and emergency power cutoffs detected.',
    ],
  },
  {
    id: 'fac-2',
    title: 'Advanced Mechanical CNC & Manufacturing Engineering Center',
    category: 'workshop',
    categoryLabel: 'Heavy Engineering Workshops',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ54GWGQJGU7uXNybnr28a5a97JJHJqkiFesghfABR6L6TrKWEN8R5-5M767YnDPUx-CpuHvE7jcjfrQyNFivNqx99mLAq5hV2zaZWSw1SfpZl808_s7XZL_tMeCnyT9EnA6bEIFm8erP0yM6LEQ9fBia85r-yvA-FyfGZU6bddAbU8SCrDqkJIMKK-Fhi05eoQhYi4bQ7TbQumxLULOKCUzZUJxsAY9qeKmHuydA',
    capacity: '90 Students',
    carpetArea: '480 sq.m',
    status: 'verified',
    complianceTag: 'Heavy Machinery Safety Certified',
    geoCoordinates: '12.9875° N, 79.9718° E',
    equipmentCount: '18 Heavy Lathes, 4 CNC Vertical Machining Centers, Emergency Stops',
    submittedEvidence: {
      claimedCapacity: '90 Students',
      claimedArea: '480 sq.m',
      submittedPhotosCount: 8,
      uploadDate: '16 Jan 2026',
      exifStatus: 'Verified (GPS Lat 12.9875, Long 79.9718)',
    },
    automatedObservations: [
      'Machine spacing meets IS 9457 industrial safety clearance guidelines.',
      'Emergency safety eyewash and first aid containment confirmed within 10 meters.',
      'Ventilation air changes satisfy statutory exhaust requirements.',
    ],
  },
  {
    id: 'fac-3',
    title: 'Smart Engineering Lecture Theater (Block B, Level 2)',
    category: 'classroom',
    categoryLabel: 'Smart Classrooms & Theaters',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDs8T6DOQsybt2ufeim7QVS9ECtDSMNoEQby54tXNpbS1oa2zV-1PVC76ZX5myw1LqGZ_AliOC9SUL7--4ME2igXW4Jy4k__md_aXvViFxVNI0wyMimQtaKY9XHIHj46BuIcnlcvABDZHrZqcEEfvU5z1k_XQaUwRtDOIpqPg2Qy2Xf6TlNXbs2fExma_GRjYl8HfwmrLnE4c7DMSGJ6R9SUhZxKj6sZohtCbXhvLQ',
    capacity: '120 Seats',
    carpetArea: '140 sq.m',
    status: 'verified',
    complianceTag: 'Instructional Area Standards Satisfied',
    geoCoordinates: '12.9888° N, 79.9731° E',
    equipmentCount: 'Dual Laser Projection, Interactive Smart Podium, Array Microphones',
    submittedEvidence: {
      claimedCapacity: '120 Seats',
      claimedArea: '140 sq.m',
      submittedPhotosCount: 4,
      uploadDate: '17 Jan 2026',
      exifStatus: 'Verified (GPS Lat 12.9888, Long 79.9731)',
    },
    automatedObservations: [
      'Seating layout allows 1.16 sq.m per student, satisfying AICTE Appendix 5 theater norm.',
      'Dual emergency exits open outward with compliant panic latch bars.',
      'Acoustic reverberation and daylight levels conform to educational guidelines.',
    ],
  },
  {
    id: 'fac-4',
    title: 'Mechanical Fluid Mechanics & Hydraulics Laboratory',
    category: 'workshop',
    categoryLabel: 'Specialized Laboratories',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB12B9H4IF3L3hkAiAeJqrwWhuK433vCdEEVTnFPnD_KBIfOsBuqYLR_CXte518XOptp-b5o_WZ4s85mMeE60-bgT9Mi0Yq5gy11-PvwKpVECsiQpWU9qfdFdmxfoV8cKZjUjs1zwutrKInBjdJG81Z-rHEW8pF5z32FSpUFNPvJJaj38E34HGkciJW90QXgpWh5grSc5d3Yw7E9524kL6V0pnoyGDKKmXwdL4_iOA',
    capacity: '36 Students',
    carpetArea: '160 sq.m',
    status: 'flagged',
    complianceTag: 'Deficiency: Missing GPS EXIF Coordinates',
    geoCoordinates: 'GPS Coordinates Not Found in Uploaded Image Header',
    equipmentCount: 'Pelton Wheel Turbine, Francis Turbine, Venturi Meter, Bernoulli Apparatus',
    submittedEvidence: {
      claimedCapacity: '36 Students',
      claimedArea: '160 sq.m',
      submittedPhotosCount: 3,
      uploadDate: '18 Jan 2026',
      exifStatus: 'DEFICIENT: Missing EXIF Latitude/Longitude and camera timestamp',
    },
    automatedObservations: [
      'Physical equipment visually matches standard hydraulic syllabus requirements.',
      'AUTOMATED AUDIT DEFICIENCY: Uploaded JPEG images lack embedded geodetic coordinates.',
      'Action: Deficiency notice served to applicant institution for re-upload with DGPS verification.',
    ],
  },
];

export const InfrastructurePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [orthoModalOpen, setOrthoModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredFacilities = mockFacilities.filter((fac) => {
    if (categoryFilter === 'all') return true;
    return fac.category === categoryFilter;
  });

  const handleAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="infrastructure"
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
                  <MaterialIcon name="apartment" className="text-[16px]" />
                  <span>Physical Infrastructure Verification • Appendix 5</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Infrastructure &amp; Laboratory Verification
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  Structured scrutiny of classrooms, engineering laboratories, workshops, and barrier-free access.
                  Applicant-submitted evidence is verified against automated spatial measurements and Approval Process Handbook standards.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setOrthoModalOpen(true)}
                  className="px-3.5 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="map" className="text-[16px] text-gov-navy" />
                  <span>Cadastral Boundary Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('Executed Automated Spatial Verification across facilities.')}
                  className="px-3.5 py-2 rounded-md bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MaterialIcon name="sync" className="text-[16px]" />
                  <span>Re-Evaluate Facilities</span>
                </button>
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

            {/* Mandatory Regulatory Disclaimer */}
            <div className="p-3.5 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <MaterialIcon name="info" className="text-gov-navy text-[18px] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Evidence Assessment Guidelines:</strong> Automated observations are computer-assisted extractions presented for Scrutiny Committee review. Automated observations are clearly distinguished from applicant-submitted claims and must be corroborated by official physical or online hearing inspection before final approval.
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'all', label: 'All Campus Facilities' },
                  { key: 'classroom', label: 'Smart Classrooms' },
                  { key: 'lab', label: 'Computer & AI Labs' },
                  { key: 'workshop', label: 'Mechanical Workshops' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCategoryFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                      categoryFilter === tab.key
                        ? 'bg-gov-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="font-mono text-slate-500 text-[11px]">
                Showing {filteredFacilities.length} facilities
              </span>
            </div>

            {/* Facilities Structured Evidence Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredFacilities.map((facility) => {
                const isDeficient = facility.status === 'flagged';

                return (
                  <div
                    key={facility.id}
                    className={`rounded-lg bg-white border shadow-sm overflow-hidden flex flex-col justify-between ${
                      isDeficient ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                    }`}
                  >
                    {/* Facility Photographic Evidence Header */}
                    <div>
                      <div className="relative h-48 w-full bg-slate-200 overflow-hidden border-b border-slate-200">
                        <img
                          src={facility.imageUrl}
                          alt={facility.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-white/95 text-slate-800 text-[11px] font-semibold border border-slate-200 shadow-sm">
                            {facility.categoryLabel}
                          </span>
                          <StatusBadge status={facility.status} size="sm" />
                        </div>

                        <div className="absolute bottom-2 left-2.5 right-2.5 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[11px] font-mono flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MaterialIcon name="place" className="text-[14px] text-amber-400" />
                            <span className="truncate max-w-[220px]">{facility.geoCoordinates}</span>
                          </span>
                          <span>{facility.carpetArea}</span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-3.5 text-xs">
                        <div>
                          <h2 className="font-bold text-sm text-slate-900 leading-snug">
                            {facility.title}
                          </h2>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Equipment: {facility.equipmentCount}
                          </div>
                        </div>

                        {/* Distinction Section 1: Applicant-Submitted Evidence */}
                        <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-gov-navy uppercase tracking-wider flex items-center gap-1">
                            <MaterialIcon name="upload_file" className="text-[14px]" />
                            <span>1. Applicant-Submitted Evidence</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                            <div>
                              <span className="text-slate-500">Claimed Capacity:</span>{' '}
                              <strong className="text-slate-800">{facility.submittedEvidence.claimedCapacity}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Claimed Area:</span>{' '}
                              <strong className="text-slate-800">{facility.submittedEvidence.claimedArea}</strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-500">Geospatial Tag Status:</span>{' '}
                              <span
                                className={`font-mono ${
                                  facility.submittedEvidence.exifStatus.startsWith('DEFICIENT')
                                    ? 'text-rose-700 font-bold'
                                    : 'text-teal-800'
                                }`}
                              >
                                {facility.submittedEvidence.exifStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Distinction Section 2: Automated Review Observations */}
                        <div className="p-3 rounded-md bg-white border border-slate-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-gov-navy uppercase tracking-wider flex items-center gap-1">
                            <MaterialIcon name="analytics" className="text-[14px]" />
                            <span>2. Automated Review Observations</span>
                          </div>
                          <ul className="space-y-1 text-slate-600 list-disc pl-4 text-[11px] leading-relaxed">
                            {facility.automatedObservations.map((obs, i) => (
                              <li key={i}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {facility.complianceTag}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAction(`Recorded observation sign-off for ${facility.title}.`)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 font-medium border border-slate-300 cursor-pointer text-[11px]"
                        >
                          Confirm
                        </button>
                        {isDeficient && (
                          <button
                            type="button"
                            onClick={() => handleAction(`Issued Geotag Deficiency Notice for ${facility.title}.`)}
                            className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-medium cursor-pointer text-[11px] shadow-sm"
                          >
                            Flag Notice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Cadastral Map Modal */}
      {orthoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white border border-slate-300 rounded-lg shadow-xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <MaterialIcon name="map" className="text-gov-navy text-[20px]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cadastral GIS Boundary Map &amp; Geo-Fence
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrthoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <MaterialIcon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Campus Perimeter:</span>{' '}
                  <strong className="text-slate-800">1,420 Meters Closed Boundary</strong>
                </div>
                <div>
                  <span className="text-slate-500">Contiguous Land Area:</span>{' '}
                  <strong className="text-slate-800">12.40 Acres (50,181 sq.m)</strong>
                </div>
                <div>
                  <span className="text-slate-500">Approach Road Width:</span>{' '}
                  <strong className="text-slate-800">18.0 Meters State Highway Frontage</strong>
                </div>
                <div>
                  <span className="text-slate-500">Survey Datum:</span>{' '}
                  <strong className="text-slate-800">WGS 84 / UTM Zone 44N</strong>
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-slate-200 text-slate-700 text-xs">
                State Land Survey &amp; Revenue Records Department cross-reference confirms zero perimeter overlap
                with forest or protected coastal zones. 100% single contiguous parcel validated per Appendix 4.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOrthoModalOpen(false)}
                className="px-4 py-1.5 rounded bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light"
              >
                Close Map View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
