import { Router } from 'express';
import { ok } from '../utils/response';
import authRoutes from './auth';
import studentRoutes from './students';
import markRoutes from './marks';
import reportRoutes from './reports';

const router = Router();

router.get('/healthz', (_req, res) => {
  return res.json(ok({ status: 'ok', time: new Date().toISOString() }));
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/marks', markRoutes);
router.use('/reports', reportRoutes);

export default router;
