import { Router } from 'express';
import * as readingController from '../controllers/readingController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/palm-photos/upload', authenticate, readingController.uploadPalmPhoto);
router.get('/palm-photos', authenticate, readingController.getPalmPhotos);
router.delete('/palm-photos/:id', authenticate, readingController.deletePalmPhoto);
router.get('/palm-photos/:id/status', authenticate, readingController.getPalmPhotoStatus);

export default router;
