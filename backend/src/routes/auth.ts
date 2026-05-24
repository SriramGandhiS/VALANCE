import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersDB } from '../data/store';
import { JWT_SECRET } from '../middleware/auth';

const router = Router();

// Utility: simulate configurable API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * POST /api/auth/login
 * Body: { userId, password, role, delay? }
 */
router.post('/login', async (req: Request, res: Response) => {
  const { userId, password, role, delay: delayMs = 0 } = req.body;

  // Simulate async delay to demonstrate async processing
  if (delayMs > 0) {
    await delay(Math.min(Number(delayMs), 10000)); // cap at 10s
  }

  if (!userId || !password || !role) {
    res.status(400).json({ message: 'userId, password and role are required' });
    return;
  }

  const user = usersDB.find(u => u.userId === userId && u.role === role);

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials or role mismatch' });
    return;
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({ message: 'Invalid credentials or role mismatch' });
    return;
  }

  if (!user.active) {
    res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, userId: user.userId, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
    },
  });
});

export default router;
