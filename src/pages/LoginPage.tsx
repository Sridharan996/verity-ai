import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MaterialIcon } from '../components/common/MaterialIcon';
import { setActiveRole } from '../services/authSession';

type RoleType = 'aicte' | 'institution';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType>('aicte');
  const [userId, setUserId] = useState('r.sharma@aicte.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7NX4K');
  const [rememberSession, setRememberSession] = useState(true);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    if (role === 'aicte') {
      setUserId('r.sharma@aicte.gov.in');
    } else {
      setUserId('admin@svce.ac.in');
    }
  };

  const handleRefreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let newCode = '';
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(newCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveRole(selectedRole, userId);
    if (selectedRole === 'institution') {
      navigate('/institution-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-screen flex items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-4xl">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Tricolour Header Line */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Primary Login Form (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                {/* Official Masthead */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded bg-gov-navy text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MaterialIcon name="account_balance" className="text-[20px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gov-navy tracking-tight">VERITY AI</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        AY 2026–27
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      AICTE Regulatory Application Review System
                    </p>
                  </div>
                </div>

                {/* Heading */}
                <div className="mt-4 mb-4">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Official Portal Sign In
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select your authorized regulatory role to proceed with application review
                  </p>
                </div>

                {/* Role Selection */}
                <div className="space-y-2 mb-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Select Portal Role:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('aicte')}
                      className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                        selectedRole === 'aicte'
                          ? 'border-gov-navy bg-slate-50 ring-2 ring-gov-navy text-gov-navy'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded bg-gov-navy/10 text-gov-navy flex items-center justify-center">
                          <MaterialIcon name="policy" className="text-[20px]" />
                        </div>
                        {selectedRole === 'aicte' && (
                          <span className="w-5 h-5 rounded-full bg-gov-navy text-white flex items-center justify-center">
                            <MaterialIcon name="check" className="text-[14px]" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs mt-2.5 text-slate-900">AICTE Official</div>
                      <div className="text-[11px] text-slate-600 font-medium">Regulatory Scrutiny Desk</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-tight">Central evaluation &amp; statutory compliance review</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleChange('institution')}
                      className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                        selectedRole === 'institution'
                          ? 'border-gov-navy bg-slate-50 ring-2 ring-gov-navy text-gov-navy'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                          <MaterialIcon name="domain" className="text-[20px]" />
                        </div>
                        {selectedRole === 'institution' && (
                          <span className="w-5 h-5 rounded-full bg-gov-navy text-white flex items-center justify-center">
                            <MaterialIcon name="check" className="text-[14px]" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs mt-2.5 text-slate-900">Institution</div>
                      <div className="text-[11px] text-slate-600 font-medium">Applicant Portal</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-tight">Application submission, faculty data &amp; deficiency responses</div>
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form className="space-y-3.5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="uid">
                      Official User ID / Email
                    </label>
                    <div className="relative">
                      <MaterialIcon
                        name="badge"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
                      />
                      <input
                        id="uid"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gov-navy transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700" htmlFor="pwd">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotNotice(`Password reset instructions sent to registered official contact for ${userId}`);
                          setTimeout(() => setForgotNotice(null), 4000);
                        }}
                        className="text-[11px] text-gov-navy hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    {forgotNotice && (
                      <div className="mb-2 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        {forgotNotice}
                      </div>
                    )}
                    <div className="relative">
                      <MaterialIcon
                        name="lock"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
                      />
                      <input
                        id="pwd"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full pl-8 pr-9 py-2 rounded-md bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gov-navy transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle password visibility"
                      >
                        <MaterialIcon
                          name={showPassword ? 'visibility_off' : 'visibility'}
                          className="text-[16px]"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Captcha */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Security Captcha
                    </label>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5 h-9 rounded bg-slate-100 border border-slate-300 flex items-center justify-between px-3 select-none font-mono font-bold tracking-widest text-slate-800 text-sm">
                        <span>{captchaCode}</span>
                        <button
                          type="button"
                          onClick={handleRefreshCaptcha}
                          className="text-slate-500 hover:text-slate-800 p-0.5"
                          title="Refresh Captcha"
                        >
                          <MaterialIcon name="refresh" className="text-[14px]" />
                        </button>
                      </div>
                      <div className="col-span-7">
                        <input
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          maxLength={6}
                          placeholder="Enter characters"
                          className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-xs text-slate-900 uppercase tracking-wider focus:outline-none focus:border-gov-navy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remember Session */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-gov-navy border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">
                      Remember this terminal session for 24 hours
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-md bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="login" className="text-[16px]" />
                    <span>
                      Sign In to{' '}
                      {selectedRole === 'institution'
                        ? 'Institution Applicant Portal'
                        : 'AICTE Regulatory Scrutiny Portal'}
                    </span>
                  </button>
                </form>
              </div>

              {/* Bottom Security Note */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <MaterialIcon name="security" className="text-[16px] text-slate-600 shrink-0 mt-0.5" />
                <span>
                  National Cyber Security Guidelines Compliant. Automated review findings serve as
                  decision support for authorized AICTE Scrutiny Committees.
                </span>
              </div>
            </div>

            {/* Right Information Panel (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-semibold text-gov-navy">
                  <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                  <span>Academic Review Cycle 2026–27</span>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Current Cycle Timeline
                  </h3>
                  <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <div className="flex justify-between pb-1 border-b border-slate-100">
                      <span>Online Applications:</span>
                      <span className="font-semibold text-slate-900">Open until 15 Mar 2026</span>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-slate-100">
                      <span>Automated Document Review:</span>
                      <span className="font-semibold text-slate-900">Active Stage</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Regional Scrutiny Hearings:</span>
                      <span className="font-semibold text-slate-900">Commencing 20 Oct 2026</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <MaterialIcon name="campaign" className="text-gov-navy text-[16px]" />
                    <span>Regulatory Advisories</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>All laboratory photographs must contain verifiable GPS coordinates (Appendix 5).</li>
                    <li>Student-to-Faculty Ratio (SFR) 1:15 strictly enforced for UG technical approvals.</li>
                    <li>Fire Safety NOC renewals must be submitted 30 days prior to expiry.</li>
                  </ul>
                </div>
              </div>

              {/* Helpdesk Contacts */}
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-900">AICTE Regulatory Helpdesk</div>
                <div>Telephone: 011-2958-1000 (09:30 – 17:30 IST)</div>
                <div>Email: regulatory-helpdesk@aicte-india.org</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
