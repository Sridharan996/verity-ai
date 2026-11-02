import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MaterialIcon } from '../common/MaterialIcon';
import { getActiveRole } from '../../services/authSession';

export type ActiveNavPath =
  | 'dashboard'
  | 'applications'
  | 'document-verification'
  | 'compliance'
  | 'infrastructure'
  | 'verification-results'
  | 'reports'
  | 'audit-trail'
  | 'institution-portal';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePath?: ActiveNavPath | string;
}

interface NavItemConfig {
  path: string;
  target: string;
  label: string;
  icon: string;
  count?: number;
  countType?: 'neutral' | 'amber' | 'rose' | 'teal';
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    path: 'dashboard',
    target: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    path: 'applications',
    target: '/applications',
    label: 'Applications',
    icon: 'assignment',
    count: 248,
    countType: 'neutral',
  },
  {
    path: 'document-verification',
    target: '/document-verification',
    label: 'Document Verification',
    icon: 'verified',
    count: 18,
    countType: 'amber',
  },
  {
    path: 'compliance',
    target: '/compliance',
    label: 'Compliance Review',
    icon: 'rule',
    count: 7,
    countType: 'rose',
  },
  {
    path: 'infrastructure',
    target: '/infrastructure',
    label: 'Infrastructure Verification',
    icon: 'apartment',
  },
  {
    path: 'verification-results',
    target: '/verification-results',
    label: 'Verification Summary',
    icon: 'fact_check',
  },
  {
    path: 'reports',
    target: '/reports',
    label: 'Reports',
    icon: 'summarize',
  },
  {
    path: 'audit-trail',
    target: '/audit-trail',
    label: 'Review History & Audit Log',
    icon: 'history_edu',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  activePath = 'dashboard',
}) => {
  const getNavClass = (path: string, isActive: boolean) => {
    const isCurrent = isActive || activePath === path;
    return `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
      isCurrent
        ? 'bg-gov-navy text-white shadow-sm'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;
  };

  const getBadgeClass = (type: NavItemConfig['countType'], isCurrent: boolean) => {
    if (isCurrent) {
      return 'bg-white/20 text-white';
    }
    switch (type) {
      case 'rose':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'teal':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Official Emblem & Portal Identity */}
          <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-gov-navy flex items-center justify-center text-white shrink-0 shadow-sm">
                <MaterialIcon name="account_balance" className="text-[18px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-gov-navy tracking-tight leading-tight">
                  VERITY AI
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate leading-tight">
                  AICTE Regulatory Portal
                </span>
              </div>
            </Link>

            {/* Close button for mobile */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <MaterialIcon name="close" className="text-[18px]" />
            </button>
          </div>

          {/* Academic Year Banner & Current Portal Session */}
          <div className="px-3 py-2 border-b border-slate-100 bg-white space-y-1.5">
            <div className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-700 truncate">
                  AY 2026–27 REVIEW CYCLE
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 border border-slate-200 rounded">
                ACTIVE
              </span>
            </div>

            <div className="px-2 py-1 rounded bg-slate-100/70 border border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-medium">Active Session:</span>
              <span className="font-semibold text-gov-navy font-mono">
                {getActiveRole() === 'institution' ? 'Institution Applicant' : 'AICTE Scrutiny Officer'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Regulatory Navigation
            </div>
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const isCurrent = activePath === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.target}
                    onClick={onClose}
                    className={({ isActive }) => getNavClass(item.path, isActive)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MaterialIcon
                        name={item.icon}
                        className={`text-[18px] shrink-0 ${isCurrent ? 'text-white' : 'text-slate-500'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums ${getBadgeClass(
                          item.countType,
                          isCurrent
                        )}`}
                      >
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              <div className="my-2 border-t border-slate-200" />

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Applicant Access
              </div>

              <NavLink
                to="/institution-dashboard"
                onClick={onClose}
                className={({ isActive }) => getNavClass('institution-portal', isActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MaterialIcon
                    name="domain"
                    className={`text-[18px] shrink-0 ${
                      activePath === 'institution-portal' ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">Institution Portal</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded border ${
                    activePath === 'institution-portal'
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Applicant
                </span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Regulatory Governance Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60 m-2 rounded-md border text-slate-600">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <MaterialIcon name="verified_user" className="text-[16px] text-gov-navy" />
            <span>AICTE Regulatory Portal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Statutory Approval Bureau • Central Clearing System
          </p>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <Link
              to="/reports"
              className="text-gov-navy font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Verification Summary <MaterialIcon name="arrow_forward" className="text-[12px]" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
