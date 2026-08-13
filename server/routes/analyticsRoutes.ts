import { Router } from 'express';
import { getOverviewAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.get('/overview', protect, authorize('ADMIN'), getOverviewAnalytics);

export default router;
