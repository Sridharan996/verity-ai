import React from 'react';
import { MaterialIcon } from './MaterialIcon';

export type StandardStatus =
  | 'Submitted'
  | 'Under Initial Review'
  | 'Documents Pending'
  | 'Verification In Progress'
  | 'Awaiting Official Review'
  | 'Deficiency Identified'
  | 'Verified'
  | 'Closed';

export type StatusType =
  | StandardStatus
  | 'submitted'
  | 'under_initial_review'
  | 'documents_pending'
  | 'verification_in_progress'
  | 'awaiting_official_review'
  | 'deficiency_identified'
  | 'verified'
  | 'closed'
  | 'under_review'
  | 'pending'
  | 'flagged'
  | 'deficiencies'
  | 'approved';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  count?: number;
  className?: string;
  size?: 'sm' | 'md';
}

interface StatusConfig {
  displayName: StandardStatus;
  description: string;
  badgeClass: string;
  icon: string;
  iconColor: string;
}

export function normalizeStatus(raw: string): StandardStatus {
  const norm = raw.trim().toLowerCase().replace(/[\s-_]+/g, '');
  if (norm === 'submitted') return 'Submitted';
  if (norm === 'underinitialreview' || norm === 'initialreview') return 'Under Initial Review';
  if (norm === 'documentspending' || norm === 'docspending') return 'Documents Pending';
  if (norm === 'verificationinprogress' || norm === 'inprogress') return 'Verification In Progress';
  if (norm === 'awaitingofficialreview' || norm === 'underreview' || norm === 'review' || norm === 'pendingreview') {
    return 'Awaiting Official Review';
  }
  if (norm === 'deficiencyidentified' || norm === 'flagged' || norm === 'deficiencies' || norm === 'deficiency') {
    return 'Deficiency Identified';
  }
  if (norm === 'verified' || norm === 'passed' || norm === 'compliant') return 'Verified';
  if (norm === 'closed' || norm === 'approved' || norm === 'resolved') return 'Closed';
  if (norm === 'pending') return 'Awaiting Official Review';
  return 'Under Initial Review';
}

export const STATUS_CONFIGS: Record<StandardStatus, StatusConfig> = {
  'Submitted': {
    displayName: 'Submitted',
    description: 'Application successfully received in the central registry',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: 'send',
    iconColor: 'text-slate-500',
  },
  'Under Initial Review': {
    displayName: 'Under Initial Review',
    description: 'Preliminary scrutiny of application dossier in progress',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300',
    icon: 'manage_search',
    iconColor: 'text-sky-600',
  },
  'Documents Pending': {
    displayName: 'Documents Pending',
    description: 'Awaiting mandatory statutory documents from applicant institution',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: 'pending_actions',
    iconColor: 'text-amber-600',
  },
  'Verification In Progress': {
    displayName: 'Verification In Progress',
    description: 'Automated extraction and cross-document verification underway',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    icon: 'sync',
    iconColor: 'text-blue-600',
  },
  'Awaiting Official Review': {
    displayName: 'Awaiting Official Review',
    description: 'Verification findings compiled; queued for Scrutiny Committee review',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    icon: 'schedule',
    iconColor: 'text-amber-700',
  },
  'Deficiency Identified': {
    displayName: 'Deficiency Identified',
    description: 'Regulatory or documentary shortfall identified; action required',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    icon: 'report_problem',
    iconColor: 'text-rose-600',
  },
  'Verified': {
    displayName: 'Verified',
    description: 'All statutory norms and evidence verified and satisfied',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
    icon: 'check_circle',
    iconColor: 'text-teal-700',
  },
  'Closed': {
    displayName: 'Closed',
    description: 'Final regulatory order issued and formal review concluded',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: 'task',
    iconColor: 'text-slate-600',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  count,
  className = '',
  size = 'sm',
}) => {
  const standardStatus = normalizeStatus(status);
  const config = STATUS_CONFIGS[standardStatus];
  const displayText = label || (count && standardStatus === 'Deficiency Identified'
    ? `Deficiency Identified (${count})`
    : config.displayName);

  return (
    <span
      title={config.description}
      className={`inline-flex items-center gap-1.5 font-medium border rounded whitespace-nowrap transition-colors ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${config.badgeClass} ${className}`}
    >
      <MaterialIcon
        name={config.icon}
        className={`${size === 'sm' ? 'text-[14px]' : 'text-[16px]'} ${config.iconColor} shrink-0`}
      />
      <span>{displayText}</span>
    </span>
  );
};
