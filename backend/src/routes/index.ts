import { Router } from 'express';
import { ok } from '../utils/response';

const router = Router();

router.get('/healthz', (_req, res) => {
  return res.json(ok({ status: 'ok', time: new Date().toISOString() }));
});

export default router;
