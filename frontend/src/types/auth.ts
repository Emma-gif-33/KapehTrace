export type UserRole = 
  | 'ADMIN_COMERCIAL' 
  | 'Q_GRADER' 
  | 'JEFE_LOGISTICA' 
  | 'AUDITOR_CALIDAD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar?: string;
  licenseNumber?: string;
  organization: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

