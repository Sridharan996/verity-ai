import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MaterialIcon } from '../common/MaterialIcon';

export const HeaderNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border border-slate-200 rounded-lg shadow-sm mb-6 overflow-hidden">
      {/* Top Tricolour Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

      {/* Institutional Top Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">GOVERNMENT OF INDIA</span>
          <span className="text-slate-300">|</span>
          <span>Ministry of Education</span>
          <span className="text-slate-300">|</span>
          <span className="text-gov-navy font-semibold">AICTE Smart India Hackathon</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>Academic Year 2026–27</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            Portal Active
          </span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-md bg-gov-navy text-white flex items-center justify-center shadow-sm">
            <MaterialIcon name="account_balance" className="text-[22px]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-gov-navy tracking-tight">VERITY AI</span>
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-semibold border border-slate-200">
                AICTE Regulatory Portal
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Statutory Application Review &amp; Compliance System
            </span>
          </div>
        </Link>

        {/* Navigation links - Desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-700">
          <a className="text-gov-navy font-semibold hover:text-gov-navy transition-colors" href="#overview">
            Overview
          </a>
          <a className="hover:text-gov-navy transition-colors" href="#regulatory-scope">
            Regulatory Scope
          </a>
          <a className="hover:text-gov-navy transition-colors" href="#verification-pillars">
            Verification Pillars
          </a>
          <a className="hover:text-gov-navy transition-colors" href="#handbook-norms">
            Handbook Norms
          </a>
          <a className="hover:text-gov-navy transition-colors" href="#helpdesk">
            Helpdesk
          </a>
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer"
          >
            <MaterialIcon name="login" className="text-[16px]" />
            <span>Sign In to Portal</span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <MaterialIcon name={mobileMenuOpen ? 'close' : 'menu'} className="text-[20px]" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex flex-col gap-2 lg:hidden text-xs font-medium text-slate-700">
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 px-2 rounded hover:bg-slate-200 transition-colors"
            href="#overview"
          >
            Overview
          </a>
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 px-2 rounded hover:bg-slate-200 transition-colors"
            href="#regulatory-scope"
          >
            Regulatory Scope
          </a>
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 px-2 rounded hover:bg-slate-200 transition-colors"
            href="#verification-pillars"
          >
            Verification Pillars
          </a>
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 px-2 rounded hover:bg-slate-200 transition-colors"
            href="#handbook-norms"
          >
            Handbook Norms
          </a>
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 px-2 rounded hover:bg-slate-200 transition-colors"
            href="#helpdesk"
          >
            Helpdesk
          </a>
        </div>
      )}
    </header>
  );
};
