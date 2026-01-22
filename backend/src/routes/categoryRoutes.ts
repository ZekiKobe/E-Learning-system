import { Router } from 'express';
import { getPublicCategories } from '../controllers/categoryController';

const router = Router();

router.get('/', getPublicCategories);

export default router;

