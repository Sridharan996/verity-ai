export interface Application {
  id: string;
  applicationId: string;
  institutionName: string;
  institutionCode: string;
  region: string;
  state: string;
  type: string;
  category: string;
  academicYear: string;
  submissionDate: string;
  status: 'verified' | 'under_review' | 'flagged' | 'pending';
  deficiencyCount?: number;
  complianceScore: number;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  permanentId: string;
  programmes: string[];
  landAreaAcres: number;
  facultyCount: number;
  studentCount: number;
  deficiencies?: {
    id: string;
    tag: string;
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    servedDate: string;
    status: 'open' | 'resolved';
  }[];
  documents?: {
    id: string;
    name: string;
    type: string;
    category: string;
    uploadDate: string;
    status: 'verified' | 'flagged' | 'pending';
    ocrConfidence: number;
    certificateNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuer?: string;
    fileSize: string;
  }[];
  timeline?: {
    date: string;
    time: string;
    title: string;
    description: string;
    actor: string;
    type: 'submission' | 'verification' | 'deficiency' | 'review' | 'system';
    hash?: string;
  }[];
}

export const mockApplicationsList: Application[] = [
  {
    id: 'AICTE-EOA-2026-001',
    applicationId: 'AICTE-EOA-2026-001',
    institutionName: 'Sri Venkateswara College of Engineering',
    institutionCode: 'SVCE-1024',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'Extension of Approval & Increase in Intake',
    category: 'Engineering & Technology',
    academicYear: '2026-27',
    submissionDate: '15 Jan 2026',
    status: 'flagged',
    deficiencyCount: 2,
    complianceScore: 94.2,
    contactPerson: 'Dr. M. Senthil Kumar (Principal)',
    contactEmail: 'principal@svce.ac.in',
    phone: '+91 44 2715 2000',
    permanentId: '1-4296181',
    programmes: ['Computer Science & Engineering', 'AI & Data Science', 'Electronics & Communication', 'Mechanical Engineering'],
    landAreaAcres: 12.4,
    facultyCount: 142,
    studentCount: 1960,
    deficiencies: [
      {
        id: 'DEF-01',
        tag: 'INFRA-MECH-04',
        title: 'Missing Laboratory Photographs',
        description: 'Upload clear geo-tagged and timestamped photographs of the Mechanical Fluid Mechanics Lab showcasing required equipment sets per AICTE Norms Appendix 4.',
        severity: 'high',
        servedDate: '2 Days Ago',
        status: 'open',
      },
      {
        id: 'DEF-02',
        tag: 'GOV-NAAC-26',
        title: 'Expired Accreditation Certificate',
        description: 'NAAC Certificate expired on 11 Mar 2026. Upload renewed accreditation copy or institutional undertaking with provisional peer-review receipt.',
        severity: 'medium',
        servedDate: 'Yesterday',
        status: 'open',
      },
    ],
    documents: [
      {
        id: 'DOC-01',
        name: 'Land Title Registered Deed',
        type: 'PDF',
        category: 'Land & Spatial',
        uploadDate: '15 Jan 2026',
        status: 'verified',
        ocrConfidence: 99.4,
        certificateNumber: 'TN-KPM-DEED-2018-9941',
        issueDate: '14 May 2018',
        expiryDate: 'Permanent Freehold',
        issuer: 'Sub-Registrar Office, Sriperumbudur',
        fileSize: '4.2 MB',
      },
      {
        id: 'DOC-02',
        name: 'Cadastral Map Boundary Polygon',
        type: 'GEO/CAD',
        category: 'Land & Spatial',
        uploadDate: '16 Jan 2026',
        status: 'verified',
        ocrConfidence: 99.8,
        certificateNumber: 'GIS-POLY-7721-WZ',
        issueDate: '02 Jan 2026',
        expiryDate: 'AY 2026-27 Validated',
        issuer: 'State Land Survey & Revenue Dept',
        fileSize: '8.1 MB',
      },
      {
        id: 'DOC-03',
        name: 'Building Safety & Stability Certificate',
        type: 'PDF',
        category: 'Infrastructure & Safety',
        uploadDate: '18 Jan 2026',
        status: 'verified',
        ocrConfidence: 97.2,
        certificateNumber: 'PWD-STR-2024-8812',
        issueDate: '10 Oct 2024',
        expiryDate: '09 Oct 2027',
        issuer: 'Superintending Engineer, PWD Buildings',
        fileSize: '2.8 MB',
      },
      {
        id: 'DOC-04',
        name: 'Fire & Rescue Services NOC',
        type: 'PDF',
        category: 'Infrastructure & Safety',
        uploadDate: '18 Jan 2026',
        status: 'verified',
        ocrConfidence: 98.6,
        certificateNumber: 'DFRS-NOC-2025-1102',
        issueDate: '12 Nov 2025',
        expiryDate: '11 Nov 2026',
        issuer: 'Directorate of Fire and Rescue Services',
        fileSize: '1.9 MB',
      },
      {
        id: 'DOC-05',
        name: 'NAAC Accreditation Certificate',
        type: 'PDF',
        category: 'Governance & Quality',
        uploadDate: '19 Jan 2026',
        status: 'flagged',
        ocrConfidence: 94.1,
        certificateNumber: 'NAAC-CYCLE3-A-2021',
        issueDate: '12 Mar 2021',
        expiryDate: '11 Mar 2026 (Expired)',
        issuer: 'National Assessment and Accreditation Council',
        fileSize: '3.4 MB',
      },
      {
        id: 'DOC-06',
        name: 'Fluid Mechanics Lab Setup Photos',
        type: 'IMG',
        category: 'Laboratory Evidence',
        uploadDate: '20 Jan 2026',
        status: 'flagged',
        ocrConfidence: 68.4,
        certificateNumber: 'EXIF-TAG-MISSING',
        issueDate: '19 Jan 2026',
        expiryDate: 'N/A',
        issuer: 'Institutional Department Upload',
        fileSize: '12.5 MB',
      },
    ],
    timeline: [
      {
        date: '15 Jan 2026',
        time: '14:22 IST',
        title: 'Application Submitted Online',
        description: 'Complete regulatory dossier submitted and statutory processing fee acknowledged via Bharatkosh.',
        actor: 'Admin (SVCE)',
        type: 'submission',
        hash: '0x8f2a...c419',
      },
      {
        date: '17 Jan 2026',
        time: '09:40 IST',
        title: 'Automated Document Extraction & Compliance Scrutiny',
        description: 'Automated review system validated land records and GIS boundaries against state revenue ledgers.',
        actor: 'Automated Review System',
        type: 'verification',
        hash: '0x3b1c...99de',
      },
      {
        date: '20 Jan 2026',
        time: '11:15 IST',
        title: 'Deficiency Notice Issued',
        description: 'Two audit items flagged: missing geo-tagged EXIF coordinates in lab photos and NAAC accreditation validity lapsed.',
        actor: 'Dr. R. Sharma (Director Tech Approvals)',
        type: 'deficiency',
        hash: '0x17fa...2201',
      },
      {
        date: '22 Jan 2026',
        time: '16:05 IST',
        title: 'Scrutiny Committee Hearing Scheduled',
        description: 'Institutional hearing slot allocated under Southern Regional Office Committee Bench 3.',
        actor: 'Regional Officer, Southern Camp',
        type: 'review',
        hash: '0xaa42...770f',
      },
    ],
  },
  {
    id: 'AICTE-EOA-2026-002',
    applicationId: 'AICTE-EOA-2026-002',
    institutionName: 'Kumaraguru College of Technology',
    institutionCode: 'KCT-2048',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'Extension of Approval',
    category: 'Engineering & Technology',
    academicYear: '2026-27',
    submissionDate: '21 Oct 2026',
    status: 'verified',
    complianceScore: 98.7,
    contactPerson: 'Dr. D. Saravanan (Principal)',
    contactEmail: 'principal@kct.ac.in',
    phone: '+91 422 2669 401',
    permanentId: '1-1049281',
    programmes: ['Mechanical Engg', 'Computer Science', 'Textile Tech', 'Electronics & Instrumentation'],
    landAreaAcres: 156.0,
    facultyCount: 310,
    studentCount: 4200,
  },
  {
    id: 'AICTE-EOA-2026-003',
    applicationId: 'AICTE-EOA-2026-003',
    institutionName: 'PSG College of Technology',
    institutionCode: 'PSG-3012',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'Increase in Intake',
    category: 'Engineering & Technology',
    academicYear: '2026-27',
    submissionDate: '20 Oct 2026',
    status: 'flagged',
    deficiencyCount: 1,
    complianceScore: 89.3,
    contactPerson: 'Dr. K. Prakasan (Principal)',
    contactEmail: 'principal@psgtech.edu',
    phone: '+91 422 2572 177',
    permanentId: '1-2189032',
    programmes: ['Artificial Intelligence & Data Science', 'Robotics & Automation', 'Production Engg'],
    landAreaAcres: 45.0,
    facultyCount: 285,
    studentCount: 3900,
    deficiencies: [
      {
        id: 'DEF-03',
        tag: 'CADRE-FAC-02',
        title: 'Faculty Cadre Ratio Mismatch',
        description: 'Shortfall of 2 Associate Professors in Dept of AI & Data Science per AICTE 1:2:6 Cadre Norm.',
        severity: 'high',
        servedDate: '3 Days Ago',
        status: 'open',
      },
    ],
  },
  {
    id: 'AICTE-EOA-2026-004',
    applicationId: 'AICTE-EOA-2026-004',
    institutionName: 'Bannari Amman Institute of Tech',
    institutionCode: 'BIT-4096',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'New Programme',
    category: 'Post Graduate (M.Tech)',
    academicYear: '2026-27',
    submissionDate: '19 Oct 2026',
    status: 'pending',
    complianceScore: 92.1,
    contactPerson: 'Dr. C. Palanisamy (Principal)',
    contactEmail: 'principal@bitsathy.ac.in',
    phone: '+91 4295 226 000',
    permanentId: '1-3091823',
    programmes: ['M.Tech AI & Robotics', 'M.Tech Cyber Security'],
    landAreaAcres: 181.0,
    facultyCount: 340,
    studentCount: 4600,
  },
  {
    id: 'AICTE-EOA-2026-005',
    applicationId: 'AICTE-EOA-2026-005',
    institutionName: 'Sona College of Technology',
    institutionCode: 'SONA-5120',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'Extension of Approval',
    category: 'Engineering & Technology',
    academicYear: '2026-27',
    submissionDate: '18 Oct 2026',
    status: 'verified',
    complianceScore: 99.1,
    contactPerson: 'Dr. S. R. R. Senthil Kumar (Principal)',
    contactEmail: 'principal@sonatech.ac.in',
    phone: '+91 427 4099 999',
    permanentId: '1-4192084',
    programmes: ['Civil Engg', 'CSE', 'EEE', 'Fashion Technology'],
    landAreaAcres: 34.5,
    facultyCount: 220,
    studentCount: 3100,
  },
  {
    id: 'AICTE-EOA-2026-006',
    applicationId: 'AICTE-EOA-2026-006',
    institutionName: 'Vellore Institute of Technology',
    institutionCode: 'VIT-6010',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'Extension of Approval',
    category: 'University & Deemed Institute',
    academicYear: '2026-27',
    submissionDate: '17 Oct 2026',
    status: 'verified',
    complianceScore: 99.6,
    contactPerson: 'Dr. V. S. Kanchana Bhaaskaran (VC)',
    contactEmail: 'vc@vit.ac.in',
    phone: '+91 416 220 2000',
    permanentId: '1-5509182',
    programmes: ['School of Computing', 'School of Electrical', 'Mechanical & Bio-Sciences'],
    landAreaAcres: 372.0,
    facultyCount: 920,
    studentCount: 14000,
  },
  {
    id: 'AICTE-EOA-2026-007',
    applicationId: 'AICTE-EOA-2026-007',
    institutionName: 'Thiagarajar College of Engineering',
    institutionCode: 'TCE-7040',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'Extension of Approval & Expansion',
    category: 'Autonomous College',
    academicYear: '2026-27',
    submissionDate: '16 Oct 2026',
    status: 'under_review',
    complianceScore: 95.8,
    contactPerson: 'Dr. M. Palaninatha Rajan (Principal)',
    contactEmail: 'principal@tce.edu',
    phone: '+91 452 248 2240',
    permanentId: '1-6209183',
    programmes: ['Architecture', 'Computer Applications', 'Mechatronics'],
    landAreaAcres: 143.0,
    facultyCount: 260,
    studentCount: 3500,
  },
  {
    id: 'AICTE-EOA-2026-008',
    applicationId: 'AICTE-EOA-2026-008',
    institutionName: 'College of Engineering, Guindy (Anna Univ)',
    institutionCode: 'CEG-8090',
    region: 'Southern Regional Office (SRO)',
    state: 'Tamil Nadu',
    type: 'Extension of Approval',
    category: 'State University Department',
    academicYear: '2026-27',
    submissionDate: '15 Oct 2026',
    status: 'verified',
    complianceScore: 99.9,
    contactPerson: 'Dr. L. Suganthi (Dean)',
    contactEmail: 'dean@ceg.annauniv.edu',
    phone: '+91 44 2235 8491',
    permanentId: '1-7109284',
    programmes: ['Civil Engineering', 'Mechanical', 'Electrical & Information Science'],
    landAreaAcres: 223.0,
    facultyCount: 410,
    studentCount: 5800,
  },
];
