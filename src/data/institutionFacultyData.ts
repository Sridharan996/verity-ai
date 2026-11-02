/**
 * VERITY AI — Institutional Academic & Faculty Master Dataset
 * Institutional applicant data for Sri Venkateswara College of Engineering (1-4296181).
 * AICTE Approval Process Handbook (APH 2026–27) Chapter 3 Norms.
 */

export interface FacultyMember {
  id: string;
  name: string;
  designation: 'Professor & Head' | 'Professor' | 'Associate Professor' | 'Assistant Professor';
  cadre: 'Professor' | 'Associate Professor' | 'Assistant Professor';
  qualification: string;
  specialization: string;
  experienceYears: number;
  appointmentType: 'Regular Full-Time' | 'Tenured' | 'Adjunct';
  joiningDate: string;
  apaarId: string;
  apaarVerified: boolean;
  salaryDisbursalVerified: boolean;
}

export interface DepartmentFacultyInfo {
  code: string;
  name: string;
  shortName: string;
  hodName: string;
  hodEmail: string;
  sanctionedIntake: number;
  totalStudents: number;
  facultyCount: number;
  sfr: string;
  sfrStatus: 'compliant' | 'attention_required';
  cadreDistribution: {
    professors: number;
    normProfessors: number;
    associateProfessors: number;
    normAssociateProfessors: number;
    assistantProfessors: number;
    normAssistantProfessors: number;
  };
  cadreStatus: 'compliant' | 'attention_required';
  deficiencyNotice?: {
    tag: string;
    title: string;
    description: string;
    servedDate: string;
    hearingDate: string;
    requiredDocument: string;
  };
  supportingDocuments: {
    id: string;
    name: string;
    category: string;
    fileSize: string;
    uploadDate: string;
    status: 'Verified' | 'Under Review';
    hash: string;
  }[];
  facultyRoster: FacultyMember[];
}

export const INSTITUTION_DEPARTMENTS: DepartmentFacultyInfo[] = [
  {
    code: 'CSE',
    name: 'Department of Computer Science & Engineering',
    shortName: 'Computer Science & Engg',
    hodName: 'Dr. S. Ramesh, Ph.D.',
    hodEmail: 'hod.cse@svce.ac.in',
    sanctionedIntake: 180,
    totalStudents: 720,
    facultyCount: 48,
    sfr: '1:15.0',
    sfrStatus: 'compliant',
    cadreDistribution: {
      professors: 4,
      normProfessors: 3,
      associateProfessors: 12,
      normAssociateProfessors: 10,
      assistantProfessors: 32,
      normAssistantProfessors: 30,
    },
    cadreStatus: 'compliant',
    supportingDocuments: [
      {
        id: 'DOC-FAC-CSE-01',
        name: 'CSE_Faculty_Cadre_Roll_AY2026-27.pdf',
        category: 'Faculty Cadre Roll & Service Register',
        fileSize: '2.4 MB',
        uploadDate: '12 Jan 2026',
        status: 'Verified',
        hash: 'e4b2a19c8f1a55093dfb2014cd78a109',
      },
      {
        id: 'DOC-FAC-CSE-02',
        name: 'CSE_APAAR_Biometric_Attendance_Summary.pdf',
        category: 'Faculty Experience & APAAR Biometric Sync',
        fileSize: '1.8 MB',
        uploadDate: '14 Jan 2026',
        status: 'Verified',
        hash: '9c1a884210e77b218f4309ba24de5512',
      },
      {
        id: 'DOC-FAC-CSE-03',
        name: 'CSE_Form16_Salary_Bank_Disbursal_Summary.pdf',
        category: 'Form 16 & Bank Salary Disbursal Statement',
        fileSize: '4.1 MB',
        uploadDate: '15 Jan 2026',
        status: 'Verified',
        hash: '3d9f0012bb56a12df081c4728e901452',
      },
    ],
    facultyRoster: [
      {
        id: 'FAC-CSE-001',
        name: 'Dr. S. Ramesh',
        designation: 'Professor & Head',
        cadre: 'Professor',
        qualification: 'Ph.D. (IIT Madras)',
        specialization: 'Distributed Systems & Cloud Computing',
        experienceYears: 19,
        appointmentType: 'Regular Full-Time',
        joiningDate: '14 Jul 2007',
        apaarId: '9812-4421-8819',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-CSE-002',
        name: 'Dr. P. Malini',
        designation: 'Professor',
        cadre: 'Professor',
        qualification: 'Ph.D. (Anna University)',
        specialization: 'Information Security & Cryptography',
        experienceYears: 16,
        appointmentType: 'Regular Full-Time',
        joiningDate: '02 Aug 2010',
        apaarId: '6721-9902-1456',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-CSE-003',
        name: 'Dr. V. K. Karthik',
        designation: 'Associate Professor',
        cadre: 'Associate Professor',
        qualification: 'Ph.D. (NIT Trichy)',
        specialization: 'Compiler Design & Parallel Architectures',
        experienceYears: 11,
        appointmentType: 'Regular Full-Time',
        joiningDate: '18 Jun 2015',
        apaarId: '4310-8821-3901',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-CSE-004',
        name: 'Dr. K. Anuradha',
        designation: 'Associate Professor',
        cadre: 'Associate Professor',
        qualification: 'Ph.D. (CEG Anna Univ)',
        specialization: 'Database Systems & Data Mining',
        experienceYears: 12,
        appointmentType: 'Regular Full-Time',
        joiningDate: '05 Jan 2014',
        apaarId: '7721-3301-4456',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-CSE-005',
        name: 'Mrs. R. Anitha',
        designation: 'Assistant Professor',
        cadre: 'Assistant Professor',
        qualification: 'M.Tech (College of Engg Guindy)',
        specialization: 'Software Engineering & Testing',
        experienceYears: 7,
        appointmentType: 'Regular Full-Time',
        joiningDate: '22 Jun 2019',
        apaarId: '8812-1102-4490',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-CSE-006',
        name: 'Mr. G. Praveen Kumar',
        designation: 'Assistant Professor',
        cadre: 'Assistant Professor',
        qualification: 'M.E. (PSG Tech Coimbatore)',
        specialization: 'Computer Networks & IoT',
        experienceYears: 5,
        appointmentType: 'Regular Full-Time',
        joiningDate: '10 Aug 2021',
        apaarId: '5541-2290-7812',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
    ],
  },
  {
    code: 'AIDS',
    name: 'Department of Artificial Intelligence & Data Science',
    shortName: 'AI & Data Science',
    hodName: 'Dr. K. Revathi, Ph.D.',
    hodEmail: 'hod.aids@svce.ac.in',
    sanctionedIntake: 60,
    totalStudents: 240,
    facultyCount: 16,
    sfr: '1:15.0',
    sfrStatus: 'compliant',
    cadreDistribution: {
      professors: 1,
      normProfessors: 1,
      associateProfessors: 2,
      normAssociateProfessors: 3,
      assistantProfessors: 13,
      normAssistantProfessors: 12,
    },
    cadreStatus: 'attention_required',
    deficiencyNotice: {
      tag: 'CADRE-ADS-02',
      title: 'Cadre Ratio Rebalancing Notice — Associate Professor Vacancy',
      description:
        'AICTE Chapter 3 Cadre Ratio (1:2:6 benchmark) requires 3 Associate Professors for the sanctioned intake. Current in-position count is 2. Upload Board of Governance Selection Committee proceedings or undertaking for regular recruitment.',
      servedDate: '3 Days Ago',
      hearingDate: '22 Oct 2026',
      requiredDocument: 'Selection Committee Call Letter & Recruitment Undertaking',
    },
    supportingDocuments: [
      {
        id: 'DOC-FAC-ADS-01',
        name: 'AIDS_Faculty_Cadre_Roll_AY2026-27.pdf',
        category: 'Faculty Cadre Roll & Service Register',
        fileSize: '1.9 MB',
        uploadDate: '14 Jan 2026',
        status: 'Verified',
        hash: '8a2d19bc33e144501a287dfa4421bc09',
      },
      {
        id: 'DOC-FAC-ADS-02',
        name: 'AIDS_Selection_Committee_Proceedings.pdf',
        category: 'Faculty Experience & APAAR Biometric Sync',
        fileSize: '3.2 MB',
        uploadDate: '18 Jan 2026',
        status: 'Under Review',
        hash: '5f110099bc3321908aa19284102efb11',
      },
    ],
    facultyRoster: [
      {
        id: 'FAC-ADS-001',
        name: 'Dr. K. Revathi',
        designation: 'Professor & Head',
        cadre: 'Professor',
        qualification: 'Ph.D. (IISc Bangalore)',
        specialization: 'Deep Learning & Neural Architectures',
        experienceYears: 17,
        appointmentType: 'Regular Full-Time',
        joiningDate: '08 Nov 2018',
        apaarId: '3319-8802-5514',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-ADS-002',
        name: 'Dr. N. Sundaram',
        designation: 'Associate Professor',
        cadre: 'Associate Professor',
        qualification: 'Ph.D. (Anna University)',
        specialization: 'Natural Language Processing & LLMs',
        experienceYears: 10,
        appointmentType: 'Regular Full-Time',
        joiningDate: '15 Jul 2020',
        apaarId: '7812-3341-9901',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-ADS-003',
        name: 'Dr. M. Deepa',
        designation: 'Associate Professor',
        cadre: 'Associate Professor',
        qualification: 'Ph.D. (NIT Warangal)',
        specialization: 'Big Data Analytics & Spark',
        experienceYears: 9,
        appointmentType: 'Regular Full-Time',
        joiningDate: '03 Feb 2021',
        apaarId: '5501-9923-1184',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-ADS-004',
        name: 'Mr. T. Arun Kumar',
        designation: 'Assistant Professor',
        cadre: 'Assistant Professor',
        qualification: 'M.Tech (BITS Pilani)',
        specialization: 'Reinforcement Learning & Robotics',
        experienceYears: 6,
        appointmentType: 'Regular Full-Time',
        joiningDate: '12 Sep 2021',
        apaarId: '1102-9983-4412',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-ADS-005',
        name: 'Ms. S. Divya',
        designation: 'Assistant Professor',
        cadre: 'Assistant Professor',
        qualification: 'M.E. (MIT Anna Univ)',
        specialization: 'Computer Vision & Image Processing',
        experienceYears: 4,
        appointmentType: 'Regular Full-Time',
        joiningDate: '15 Jul 2022',
        apaarId: '4490-1123-7721',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
    ],
  },
  {
    code: 'ECE',
    name: 'Department of Electronics & Communication Engineering',
    shortName: 'Electronics & Comm. Engg',
    hodName: 'Dr. M. Gopinath, Ph.D.',
    hodEmail: 'hod.ece@svce.ac.in',
    sanctionedIntake: 180,
    totalStudents: 680,
    facultyCount: 46,
    sfr: '1:14.7',
    sfrStatus: 'compliant',
    cadreDistribution: {
      professors: 4,
      normProfessors: 3,
      associateProfessors: 11,
      normAssociateProfessors: 10,
      assistantProfessors: 31,
      normAssistantProfessors: 30,
    },
    cadreStatus: 'compliant',
    supportingDocuments: [
      {
        id: 'DOC-FAC-ECE-01',
        name: 'ECE_Faculty_Cadre_Roll_AY2026-27.pdf',
        category: 'Faculty Cadre Roll & Service Register',
        fileSize: '2.6 MB',
        uploadDate: '11 Jan 2026',
        status: 'Verified',
        hash: '11c49021aa90441289dfb33201456a09',
      },
      {
        id: 'DOC-FAC-ECE-02',
        name: 'ECE_Form16_Salary_Statements.pdf',
        category: 'Form 16 & Bank Salary Disbursal Statement',
        fileSize: '3.8 MB',
        uploadDate: '14 Jan 2026',
        status: 'Verified',
        hash: '7e9011bc4421aa8091df0033241289af',
      },
    ],
    facultyRoster: [
      {
        id: 'FAC-ECE-001',
        name: 'Dr. M. Gopinath',
        designation: 'Professor & Head',
        cadre: 'Professor',
        qualification: 'Ph.D. (IIT Delhi)',
        specialization: 'VLSI Design & Embedded Systems',
        experienceYears: 22,
        appointmentType: 'Regular Full-Time',
        joiningDate: '05 Aug 2004',
        apaarId: '8871-3320-1145',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-ECE-002',
        name: 'Dr. L. Jayashree',
        designation: 'Professor',
        cadre: 'Professor',
        qualification: 'Ph.D. (Anna University)',
        specialization: 'Wireless Sensor Networks & 5G Comm.',
        experienceYears: 18,
        appointmentType: 'Regular Full-Time',
        joiningDate: '10 Jun 2008',
        apaarId: '2210-9943-5512',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-ECE-003',
        name: 'Dr. C. Balasubramanian',
        designation: 'Associate Professor',
        cadre: 'Associate Professor',
        qualification: 'Ph.D. (NIT Warangal)',
        specialization: 'RF & Microwave Engineering',
        experienceYears: 12,
        appointmentType: 'Regular Full-Time',
        joiningDate: '14 Jul 2014',
        apaarId: '9941-6672-8813',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-ECE-004',
        name: 'Mrs. V. Uma',
        designation: 'Assistant Professor',
        cadre: 'Assistant Professor',
        qualification: 'M.E. (CEG Chennai)',
        specialization: 'Digital Signal Processing',
        experienceYears: 8,
        appointmentType: 'Regular Full-Time',
        joiningDate: '19 Aug 2018',
        apaarId: '5512-3390-4411',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
    ],
  },
  {
    code: 'MECH',
    name: 'Department of Mechanical Engineering',
    shortName: 'Mechanical Engineering',
    hodName: 'Dr. R. Balaji, Ph.D.',
    hodEmail: 'hod.mech@svce.ac.in',
    sanctionedIntake: 120,
    totalStudents: 480,
    facultyCount: 32,
    sfr: '1:15.0',
    sfrStatus: 'compliant',
    cadreDistribution: {
      professors: 3,
      normProfessors: 2,
      associateProfessors: 8,
      normAssociateProfessors: 7,
      assistantProfessors: 21,
      normAssistantProfessors: 20,
    },
    cadreStatus: 'compliant',
    supportingDocuments: [
      {
        id: 'DOC-FAC-MEC-01',
        name: 'MECH_Faculty_Cadre_Roll_AY2026-27.pdf',
        category: 'Faculty Cadre Roll & Service Register',
        fileSize: '2.1 MB',
        uploadDate: '10 Jan 2026',
        status: 'Verified',
        hash: '33a100bb561124df0812998a12bc4431',
      },
      {
        id: 'DOC-FAC-MEC-02',
        name: 'MECH_Lab_Faculty_Incharge_Orders.pdf',
        category: 'Faculty Experience & APAAR Biometric Sync',
        fileSize: '1.4 MB',
        uploadDate: '12 Jan 2026',
        status: 'Verified',
        hash: '6d8822aa9901445b12dfa8820145ef20',
      },
    ],
    facultyRoster: [
      {
        id: 'FAC-MEC-001',
        name: 'Dr. R. Balaji',
        designation: 'Professor & Head',
        cadre: 'Professor',
        qualification: 'Ph.D. (IIT Madras)',
        specialization: 'Thermal Sciences & CFD',
        experienceYears: 20,
        appointmentType: 'Regular Full-Time',
        joiningDate: '02 Jul 2006',
        apaarId: '1190-4432-6671',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-MEC-002',
        name: 'Dr. K. Saravanan',
        designation: 'Professor',
        cadre: 'Professor',
        qualification: 'Ph.D. (NIT Trichy)',
        specialization: 'Advanced Manufacturing & Robotics',
        experienceYears: 15,
        appointmentType: 'Regular Full-Time',
        joiningDate: '11 Aug 2011',
        apaarId: '3341-8890-2214',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-MEC-003',
        name: 'Dr. N. Vijayakumar',
        designation: 'Associate Professor',
        cadre: 'Associate Professor',
        qualification: 'Ph.D. (Annamalai University)',
        specialization: 'Composite Materials & FEA',
        experienceYears: 11,
        appointmentType: 'Regular Full-Time',
        joiningDate: '16 Jun 2015',
        apaarId: '7712-4450-9981',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
      {
        id: 'FAC-MEC-004',
        name: 'Mr. P. Vignesh',
        designation: 'Assistant Professor',
        cadre: 'Assistant Professor',
        qualification: 'M.E. (MIT Chennai)',
        specialization: 'Automobile Engineering & EV Tech',
        experienceYears: 5,
        appointmentType: 'Regular Full-Time',
        joiningDate: '20 Jul 2021',
        apaarId: '9901-2241-8873',
        apaarVerified: true,
        salaryDisbursalVerified: true,
      },
    ],
  },
];

