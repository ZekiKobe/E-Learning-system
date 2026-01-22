import { Router } from 'express';
import { generateCertificate, downloadCertificate } from '../controllers/certificateController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/course/:courseId', authenticate, generateCertificate);
router.get('/:certificateId/download', authenticate, downloadCertificate);

export default router;

