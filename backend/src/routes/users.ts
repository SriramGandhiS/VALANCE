import { Router, Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { usersDB, User } from '../data/store';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const safeUser = (u: User) => ({
  id: u.id,
  userId: u.userId,
  name: u.name,
  email: u.email,
  role: u.role,
  department: u.department,
  createdAt: u.createdAt,
  active: u.active,
});

/** GET /api/users — Admin only */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const delayMs = Number(req.query['delay']) || 0;
  if (delayMs > 0) await delay(Math.min(delayMs, 10000));
  res.json({ users: usersDB.map(safeUser), total: usersDB.length });
});

/** GET /api/users/me — Current user profile */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = usersDB.find(u => u.id === req.user?.id);
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  res.json(safeUser(user));
});

/** POST /api/users — Admin creates a new user */
router.post('/', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { userId, password, role, name, email, department } = req.body;
  if (!userId || !password || !role || !name || !email) {
    res.status(400).json({ message: 'userId, password, role, name, email are required' });
    return;
  }
  if (usersDB.find(u => u.userId === userId)) {
    res.status(409).json({ message: 'User ID already exists' });
    return;
  }
  const newUser: User = {
    id: uuidv4(),
    userId,
    password: bcrypt.hashSync(password, 10),
    role: role as 'General User' | 'Admin',
    name,
    email,
    department: department || 'General',
    createdAt: new Date().toISOString(),
    active: true,
  };
  usersDB.push(newUser);
  res.status(201).json(safeUser(newUser));
});

/** PUT /api/users/:id — Admin updates a user */
router.put('/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const idx = usersDB.findIndex(u => u.id === req.params['id']);
  if (idx === -1) { res.status(404).json({ message: 'User not found' }); return; }
  const { name, email, role, department, active, password } = req.body;
  const user = usersDB[idx];
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (department) user.department = department;
  if (typeof active === 'boolean') user.active = active;
  if (password) user.password = bcrypt.hashSync(password, 10);
  res.json(safeUser(user));
});

/** DELETE /api/users/:id — Admin deletes a user */
router.delete('/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const idx = usersDB.findIndex(u => u.id === req.params['id']);
  if (idx === -1) { res.status(404).json({ message: 'User not found' }); return; }
  usersDB.splice(idx, 1);
  res.json({ message: 'User deleted successfully' });
});

export default router;
