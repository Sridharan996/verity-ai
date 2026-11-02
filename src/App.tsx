import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Original 4 Stitch screens
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AicteDashboardPage } from './pages/AicteDashboardPage';
import { InstitutionDashboardPage } from './pages/InstitutionDashboardPage';

// Newly implemented 8 screens
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailsPage } from './pages/ApplicationDetailsPage';
import { DocumentVerificationPage } from './pages/DocumentVerificationPage';
import { CompliancePage } from './pages/CompliancePage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { VerificationResultsPage } from './pages/VerificationResultsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Original Screens */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<AicteDashboardPage />} />
        <Route path="/aicte-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />
        <Route path="/institution" element={<Navigate to="/institution-dashboard" replace />} />

        {/* 8 New Full-Featured Screens */}
        {/* 1. Applications Registry */}
        <Route path="/applications" element={<ApplicationsPage />} />

        {/* 2. Application Details */}
        <Route path="/applications/:id" element={<ApplicationDetailsPage />} />

        {/* 3. Document Verification Workspace */}
        <Route path="/document-verification" element={<DocumentVerificationPage />} />

        {/* 4. Statutory Compliance Engine */}
        <Route path="/compliance" element={<CompliancePage />} />

        {/* 5. Physical Infrastructure & CAD Analysis */}
        <Route path="/infrastructure" element={<InfrastructurePage />} />

        {/* 6. Verification Results & Risk Indicators */}
        <Route path="/verification-results" element={<VerificationResultsPage />} />

        {/* 7. Statutory Reports & Proof Packs */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* 8. Chronological Audit Trail Ledger */}
        <Route path="/audit-trail" element={<AuditTrailPage />} />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
