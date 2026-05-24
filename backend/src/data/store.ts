import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  userId: string;
  password: string;
  role: 'General User' | 'Admin';
  name: string;
  email: string;
  department: string;
  createdAt: string;
  active: boolean;
}

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

const hashSync = (pw: string) => bcrypt.hashSync(pw, 10);

export const usersDB: User[] = [
  {
    id: uuidv4(),
    userId: 'admin01',
    password: hashSync('admin123'),
    role: 'Admin',
    name: 'Alexandra Reid',
    email: 'admin@valence.io',
    department: 'Platform Engineering',
    createdAt: '2024-01-15T08:00:00Z',
    active: true,
  },
  {
    id: uuidv4(),
    userId: 'user01',
    password: hashSync('user123'),
    role: 'General User',
    name: 'Marcus Chen',
    email: 'marcus@valence.io',
    department: 'Product Design',
    createdAt: '2024-02-10T09:30:00Z',
    active: true,
  },
  {
    id: uuidv4(),
    userId: 'user02',
    password: hashSync('user123'),
    role: 'General User',
    name: 'Priya Nair',
    email: 'priya@valence.io',
    department: 'Data Analytics',
    createdAt: '2024-03-05T11:00:00Z',
    active: true,
  },
  {
    id: uuidv4(),
    userId: 'user03',
    password: hashSync('user123'),
    role: 'General User',
    name: 'Jordan Blake',
    email: 'jordan@valence.io',
    department: 'DevOps',
    createdAt: '2024-03-20T14:00:00Z',
    active: false,
  },
];

export const recordsDB: Record[] = [
  {
    id: uuidv4(),
    title: 'Quarterly Infrastructure Review',
    description: 'Assess all production servers for Q3 performance metrics.',
    status: 'Active',
    priority: 'High',
    assignedTo: 'Platform Engineering',
    createdAt: '2024-07-01T10:00:00Z',
    accessLevel: 'public',
  },
  {
    id: uuidv4(),
    title: 'User Onboarding Flow Redesign',
    description: 'Redesign the onboarding UX based on user feedback surveys.',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Product Design',
    createdAt: '2024-07-05T09:00:00Z',
    accessLevel: 'public',
  },
  {
    id: uuidv4(),
    title: 'Analytics Pipeline Migration',
    description: 'Migrate legacy ETL pipelines to the new data lake architecture.',
    status: 'Active',
    priority: 'High',
    assignedTo: 'Data Analytics',
    createdAt: '2024-07-08T11:00:00Z',
    accessLevel: 'public',
  },
  {
    id: uuidv4(),
    title: 'CI/CD Pipeline Overhaul',
    description: 'Implement GitHub Actions workflows across all microservices.',
    status: 'Closed',
    priority: 'Low',
    assignedTo: 'DevOps',
    createdAt: '2024-06-20T08:00:00Z',
    accessLevel: 'public',
  },
  {
    id: uuidv4(),
    title: '[ADMIN] Security Audit Report',
    description: 'Confidential: Full penetration testing results and remediation plan.',
    status: 'Active',
    priority: 'High',
    assignedTo: 'Platform Engineering',
    createdAt: '2024-07-10T07:00:00Z',
    accessLevel: 'admin-only',
  },
  {
    id: uuidv4(),
    title: '[ADMIN] User Access Permissions Matrix',
    description: 'Confidential: Full RBAC matrix for all system resources.',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Platform Engineering',
    createdAt: '2024-07-12T15:00:00Z',
    accessLevel: 'admin-only',
  },
  {
    id: uuidv4(),
    title: 'Mobile App Beta Launch',
    description: 'Coordinate cross-team efforts for beta rollout to 500 testers.',
    status: 'Pending',
    priority: 'High',
    assignedTo: 'Product Design',
    createdAt: '2024-07-14T12:00:00Z',
    accessLevel: 'public',
  },
  {
    id: uuidv4(),
    title: 'Database Indexing Optimisation',
    description: 'Analyse slow query logs and add appropriate indexes.',
    status: 'Active',
    priority: 'Medium',
    assignedTo: 'Data Analytics',
    createdAt: '2024-07-15T10:30:00Z',
    accessLevel: 'public',
  },
];
