// src/app/shared/models/user.model.ts
export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'General User' | 'Admin';
  department: string;
  createdAt: string;
  active: boolean;
}

export interface LoginRequest {
  userId: string;
  password: string;
  role: 'General User' | 'Admin';
  delay?: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// src/app/shared/models/record.model.ts
export interface Record {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Pending' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  createdAt: string;
  accessLevel: 'public' | 'admin-only';
}

export interface RecordsResponse {
  records: Record[];
  total: number;
  role: string;
}

export interface AdminSummary {
  total: number;
  byStatus: { Active: number; Pending: number; Closed: number };
  byPriority: { High: number; Medium: number; Low: number };
  adminOnly: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}
