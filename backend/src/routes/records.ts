import { Router, Response } from 'express';
import { recordsDB } from '../data/store';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * GET /api/records?delay=ms
 * General users see public records; Admins see all.
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const delayMs = Number(req.query['delay']) || 0;
  if (delayMs > 0) await delay(Math.min(delayMs, 10000));

  const isAdmin = req.user?.role === 'Admin';
  const records = isAdmin
    ? recordsDB
    : recordsDB.filter(r => r.accessLevel === 'public');

  res.json({ records, total: records.length, role: req.user?.role });
});

/**
 * GET /api/records/admin-summary (Admin only)
 */
router.get('/admin-summary', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const summary = {
    total: recordsDB.length,
    byStatus: {
      Active: recordsDB.filter(r => r.status === 'Active').length,
      Pending: recordsDB.filter(r => r.status === 'Pending').length,
      Closed: recordsDB.filter(r => r.status === 'Closed').length,
    },
    byPriority: {
      High: recordsDB.filter(r => r.priority === 'High').length,
      Medium: recordsDB.filter(r => r.priority === 'Medium').length,
      Low: recordsDB.filter(r => r.priority === 'Low').length,
    },
    adminOnly: recordsDB.filter(r => r.accessLevel === 'admin-only').length,
  };
  res.json(summary);
});

export default router;
