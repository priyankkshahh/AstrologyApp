import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import { profileUpdateSchema } from '../utils/validators';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(profileUpdateSchema), userController.updateProfile);
router.post('/complete-onboarding', authenticate, userController.completeOnboarding);
router.delete('/account', authenticate, userController.deleteAccount);

export default router;
