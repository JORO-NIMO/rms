import { Router } from 'express';
import {
  getMarks,
  createMark,
  bulkCreateMarks,
  updateMark,
  importMarks,
} from '../controllers/marks';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMarks);
router.post('/', authorize(['admin', 'teacher']), createMark);
router.post('/bulk', authorize(['admin', 'teacher']), bulkCreateMarks);
router.put('/:id', authorize(['admin', 'teacher']), updateMark);
router.post('/import', importMarks);

export default router;
