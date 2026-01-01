import { Router } from 'express';
import { PalmistryController } from '../controllers/palmistryController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();
const palmistryController = new PalmistryController();

// Palm photo management
router.post(
  '/upload-palm/:user_id',
  authenticateToken,
  upload.single('image'),
  palmistryController.uploadPalmPhoto
);

router.get(
  '/palm-photos/:user_id',
  authenticateToken,
  palmistryController.getUserPalmPhotos
);

router.get(
  '/palm-analysis/:user_id/:palm_id',
  authenticateToken,
  palmistryController.getPalmAnalysis
);

router.delete(
  '/palm-photos/:user_id/:palm_id',
  authenticateToken,
  palmistryController.deletePalmPhoto
);

// Palm analysis endpoints
router.get(
  '/lines/:palm_id',
  authenticateToken,
  palmistryController.getLineAnalysis
);

router.get(
  '/mounts/:palm_id',
  authenticateToken,
  palmistryController.getMountAnalysis
);

router.get(
  '/fingers/:palm_id',
  authenticateToken,
  palmistryController.getFingerAnalysis
);

router.get(
  '/hand-shape/:palm_id',
  authenticateToken,
  palmistryController.getHandShapeAnalysis
);

router.get(
  '/signs-markings/:palm_id',
  authenticateToken,
  palmistryController.getSignsAndMarkings
);

// Reading and interpretation endpoints
router.get(
  '/personality-profile/:user_id',
  authenticateToken,
  palmistryController.getPersonalityProfile
);

router.get(
  '/life-path/:user_id',
  authenticateToken,
  palmistryController.getLifePathAnalysis
);

router.get(
  '/career-guidance/:user_id',
  authenticateToken,
  palmistryController.getCareerGuidance
);

router.get(
  '/relationship-analysis/:user_id',
  authenticateToken,
  palmistryController.getRelationshipAnalysis
);

router.get(
  '/health-assessment/:user_id',
  authenticateToken,
  palmistryController.getHealthAssessment
);

router.get(
  '/destiny-reading/:user_id',
  authenticateToken,
  palmistryController.getDestinyReading
);

// Compatibility
router.post(
  '/palm-compatibility',
  authenticateToken,
  palmistryController.getCompatibilityAnalysis
);

export default router;