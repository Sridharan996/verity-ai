import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 pt-4 pb-6 border-t border-slate-200 text-slate-500 text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MaterialIcon name="account_balance" className="text-gov-navy text-[18px]" />
          <span>
            All India Council for Technical Education (AICTE) • Ministry of Education, Government of India
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a
            className="hover:text-gov-navy hover:underline transition-colors"
            href="https://www.aicte-india.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            AICTE Official Portal
          </a>
          <span className="text-slate-300">•</span>
          <a className="hover:text-gov-navy hover:underline transition-colors" href="#handbook">
            Approval Process Handbook
          </a>
          <span className="text-slate-300">•</span>
          <a className="hover:text-gov-navy hover:underline transition-colors" href="#support">
            Regulatory Helpdesk
          </a>
        </div>
      </div>
    </footer>
  );
};
