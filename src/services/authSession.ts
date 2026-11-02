/**
 * VERITY AI — Client-Side Regulatory Portal Session Manager
 * Manages active portal role ('aicte' | 'institution') with session storage.
 * Enforces role boundaries across applicant and official scrutiny views.
 */

export type UserRole = 'aicte' | 'institution';

export interface AuthUserProfile {
  role: UserRole;
  name: string;
  userRoleTitle: string;
  email: string;
  institutionId?: string;
  institutionName?: string;
  permanentId?: string;
}

const STORAGE_KEY_ROLE = 'verity_user_role';
const STORAGE_KEY_EMAIL = 'verity_user_email';

export function getActiveRole(): UserRole {
  if (typeof window === 'undefined') return 'aicte';
  const stored = window.sessionStorage.getItem(STORAGE_KEY_ROLE) || window.localStorage.getItem(STORAGE_KEY_ROLE);
  if (stored === 'institution') return 'institution';
  return 'aicte';
}

export function setActiveRole(role: UserRole, email?: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY_ROLE, role);
  if (email) {
    window.sessionStorage.setItem(STORAGE_KEY_EMAIL, email.trim());
  } else {
    window.sessionStorage.setItem(
      STORAGE_KEY_EMAIL,
      role === 'institution' ? 'admin@svce.ac.in' : 'r.sharma@aicte.gov.in'
    );
  }
}

export function getActiveUserProfile(): AuthUserProfile {
  const role = getActiveRole();
  const email =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem(STORAGE_KEY_EMAIL) || (role === 'institution' ? 'admin@svce.ac.in' : 'r.sharma@aicte.gov.in')
      : 'r.sharma@aicte.gov.in';

  if (role === 'institution') {
    return {
      role: 'institution',
      name: 'Registrar (SVCE)',
      userRoleTitle: 'Sri Venkateswara College of Engineering',
      email,
      institutionId: 'INST-TN-8841',
      institutionName: 'Sri Venkateswara College of Engineering',
      permanentId: '1-4296181',
    };
  }

  return {
    role: 'aicte',
    name: 'Dr. R. Sharma',
    userRoleTitle: 'Director, Approval Bureau',
    email,
  };
}

export function isOfficial(): boolean {
  return getActiveRole() === 'aicte';
}

export function isInstitution(): boolean {
  return getActiveRole() === 'institution';
}

export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY_ROLE);
  window.sessionStorage.removeItem(STORAGE_KEY_EMAIL);
}

