import React from 'react';
import { MaterialIcon } from './MaterialIcon';

interface KpiCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: string;
  iconBgClass?: string;
  iconTextClass?: string;
  trendText?: string;
  trendSubtext?: string;
  trendColorClass?: string;
  badgeText?: string;
  badgeClass?: string;
  progressPercent?: number;
  progressBarColorClass?: string;
  valueColorClass?: string;
  helperText?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  iconBgClass = 'bg-slate-100',
  iconTextClass = 'text-slate-700',
  trendText,
  trendSubtext,
  trendColorClass = 'text-slate-600',
  badgeText,
  badgeClass = 'text-slate-600 bg-slate-100',
  progressPercent,
  progressBarColorClass = 'bg-gov-navy',
  valueColorClass = 'text-slate-900',
  helperText,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg bg-white p-4 border border-slate-200 shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:border-gov-navy/40 hover:shadow' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-600 mt-0.5 truncate">
              {subtitle}
            </div>
          )}
          <div className={`text-2xl font-bold mt-1 tracking-tight tabular-nums ${valueColorClass}`}>
            {value}
          </div>
        </div>
        <div
          className={`w-9 h-9 rounded-md ${iconBgClass} ${iconTextClass} flex items-center justify-center shrink-0 border border-slate-200/60`}
        >
          <MaterialIcon name={icon} className="text-[20px]" />
        </div>
      </div>

      {(trendText || badgeText || helperText) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {trendText && (
            <div className={`inline-flex items-center gap-1 font-medium ${trendColorClass}`}>
              <span>{trendText}</span>
              {trendSubtext && <span className="text-slate-500 font-normal">{trendSubtext}</span>}
            </div>
          )}
          {helperText && !trendText && (
            <span className="text-slate-500 truncate">{helperText}</span>
          )}
          {badgeText && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200 ${badgeClass}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}

      {progressPercent !== undefined && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${progressBarColorClass}`}
            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
