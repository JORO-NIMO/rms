import { Router } from 'express';
import { login, register } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticate, (req, res) => {
  // Invalidate token (client-side, or blacklist)
  res.json({ success: true, data: { message: 'Logged out' }, errors: null, meta: null });
});

export default router;
