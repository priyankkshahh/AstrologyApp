import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/preferences', authenticate, profileController.getPreferences);
router.put('/preferences', authenticate, profileController.updatePreferences);

export default router;
