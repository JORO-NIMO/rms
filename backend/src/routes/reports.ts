import { Router } from 'express';
import { getStudentReport } from '../controllers/reports';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/student/:id', getStudentReport);

export default router;
