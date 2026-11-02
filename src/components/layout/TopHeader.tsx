import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MaterialIcon } from '../common/MaterialIcon';
import { getActiveUserProfile, clearActiveSession } from '../../services/authSession';

interface TopHeaderProps {
  onMenuToggle?: () => void;
  role?: 'aicte' | 'institution';
  userName?: string;
  userRoleTitle?: string;
  avatarUrl?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMenuToggle,
  role,
  userName,
  userRoleTitle,
  avatarUrl,
}) => {
  const navigate = useNavigate();
  const activeProfile = getActiveUserProfile();
  const currentRole = role || activeProfile.role;
  const currentUserName = userName || activeProfile.name;
  const currentUserRoleTitle = userRoleTitle || activeProfile.userRoleTitle;
  const currentAvatarUrl =
    avatarUrl ||
    (currentRole === 'institution'
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg447LLb11o_h1B3qYtvzYLTPRwKkTSUD1Bg2D49if8dvb-qEJ6tNk7vdng3Bl4i3Ya-0L0wIMJjrVBBiOYO0utbHzwW-xFqkfPiX4XGFQCwrAq3r-kTuISc2N21RZSjFCOJ4ie41MxYsGefTcQB7QePPgoId4eTmXS8x5-khfSyHwyQjBtRz_ewYqFhze2yWsUtKUoR8ySMrFUJe40hSR3e7f_Dt6bqYJZfdJNKQ'
      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIWL7DnJzqdMWAQS01FoyFg1VpwtF5C1hrWPGfJpzC5-MiR6vGQWwUa7QALPb_w-oGGIrVGoWX2TCQuwnDuayC8wtRAfE4toBDzvd_4DrAlxzugibeatnnQTyIVAY7Qj0IKlpUVuQDZlwoWDtp6XoBEP4u-MHKgX-iZ-xVYrc_I3H7K1DHjB0YCVn28k5KGLgxJA7GmpwZXob3nWQCMkUi8Acnscef5z-y3qmOU9c');
  const [searchVal, setSearchVal] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Deficiency Notice Issued — SVCE',
      desc: 'Laboratory photograph missing GPS coordinate metadata (Appendix 5).',
      time: '12m ago',
      unread: true,
      link: '/document-verification?appId=AICTE-EOA-2026-001',
    },
    {
      id: 2,
      title: 'Approval Process Handbook Gazette Update',
      desc: 'AICTE Approval Process Handbook (APH 2026-27) norms published.',
      time: '1h ago',
      unread: true,
      link: '/compliance',
    },
    {
      id: 3,
      title: 'Scrutiny Committee Hearing Scheduled',
      desc: 'Southern Regional Office Bench 3 hearing scheduled for 22 Oct 2026.',
      time: '3h ago',
      unread: false,
      link: '/applications/AICTE-EOA-2026-001',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSearchSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    if (searchVal.trim()) {
      navigate(`/applications?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Mobile menu toggle + System Title & Review Cycle */}
      <div className="flex items-center gap-3 flex-1 max-w-3xl">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle navigation drawer"
        >
          <MaterialIcon name="menu" className="text-[20px]" />
        </button>

        {/* Portal Breadcrumb / Header Title */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-gov-navy tracking-tight hidden sm:inline">
            VERITY AI
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <span className="hidden md:inline">Regulatory Application Review System</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-semibold whitespace-nowrap">
              AY 2026–27 Review Cycle
            </span>
          </div>
        </div>

        {/* Global application search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden md:block max-w-sm ml-2">
          <MaterialIcon
            name="search"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
          />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs focus:outline-none focus:border-gov-navy focus:bg-white transition-colors"
            placeholder="Search applications by ID, institution..."
            type="text"
          />
        </form>
      </div>

      {/* Right side: Role badge + Notification + User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden xl:flex items-center px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium">
          <MaterialIcon name="verified_user" className="text-[14px] mr-1 text-gov-navy" />
          <span>Role: {role === 'aicte' ? 'AICTE Regulatory Official' : 'Institutional Applicant'}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            type="button"
            aria-label="View notifications"
          >
            <MaterialIcon name="notifications" className="text-[20px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-lg bg-white shadow-lg border border-slate-200 z-50 overflow-hidden">
              <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-gov-navy hover:underline cursor-pointer font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link}
                    onClick={() => setNotificationsOpen(false)}
                    className={`p-3 block hover:bg-slate-50 transition-colors ${
                      n.unread ? 'bg-white' : 'opacity-80 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-900 leading-tight">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {n.desc}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="p-2 border-t border-slate-200 bg-slate-50 text-center">
                <Link
                  to="/audit-trail"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-gov-navy font-semibold hover:underline"
                >
                  View Review History &amp; Audit Log
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 cursor-pointer select-none"
          >
            <img
              alt="User Avatar"
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
              src={currentAvatarUrl}
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUserName}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">
                {currentUserRoleTitle}
              </div>
            </div>
            <MaterialIcon
              name="expand_more"
              className={`text-slate-400 text-[16px] transition-transform ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-11 w-64 rounded-lg bg-white shadow-lg border border-slate-200 z-50 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <div className="font-bold text-xs text-slate-900">{currentUserName}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">{currentUserRoleTitle}</div>
                <div className="mt-1 text-[10px] text-slate-500 font-mono">
                  Role: {currentRole === 'aicte' ? 'AICTE Regulatory Official' : 'Institutional Applicant'}
                </div>
              </div>

              <div className="p-1.5 space-y-0.5 text-xs">
                <Link
                  to="/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-100"
                >
                  <MaterialIcon name="dashboard" className="text-[16px] text-gov-navy" />
                  <span>Regulatory Dashboard</span>
                </Link>
                <Link
                  to="/applications"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-100"
                >
                  <MaterialIcon name="assignment" className="text-[16px] text-slate-500" />
                  <span>Applications Registry</span>
                </Link>
                <Link
                  to="/institution-dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-100"
                >
                  <MaterialIcon name="domain" className="text-[16px] text-slate-500" />
                  <span>Institution Portal View</span>
                </Link>
              </div>

              <div className="p-1.5 border-t border-slate-200 bg-slate-50">
                <Link
                  to="/login"
                  onClick={() => {
                    clearActiveSession();
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded text-rose-700 hover:bg-rose-50 font-medium text-xs"
                >
                  <MaterialIcon name="logout" className="text-[16px] text-rose-600" />
                  <span>Sign Out / Switch Portal</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
