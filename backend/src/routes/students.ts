import { Router } from 'express';
import {
  getStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  importStudents,
} from '../controllers/students';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getStudents);
router.post('/', authorize(['admin', 'teacher']), createStudent);
router.get('/:id', getStudent);
router.put('/:id', authorize(['admin', 'teacher']), updateStudent);
router.delete('/:id', authorize(['admin']), deleteStudent);
router.post('/import', importStudents);

export default router;
