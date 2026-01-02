import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get complete dashboard data
router.get('/', dashboardController.getDashboard);

// Get cross-module insights
router.get('/insights', dashboardController.getDashboardInsights);

// Get readings summary across all modules
router.get('/readings-summary', dashboardController.getReadingsSummary);

// Get quick insight cards
router.get('/quick-cards', dashboardController.getQuickCards);

// Dashboard preferences
router.get('/preferences', dashboardController.getDashboardPreferences);
router.put('/preferences', dashboardController.updateDashboardPreferences);

// Refresh dashboard data
router.post('/refresh', dashboardController.refreshDashboard);

export default router;
