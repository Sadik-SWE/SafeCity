import { Router } from 'express';
import {
  getEmergencyServices,
  createEmergencyService,
  updateEmergencyService,
  deleteEmergencyService,
} from '../controllers/emergencyController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', getEmergencyServices);
router.post('/', protect, authorize('ADMIN'), createEmergencyService);
router.put('/:id', protect, authorize('ADMIN'), updateEmergencyService);
router.delete('/:id', protect, authorize('ADMIN'), deleteEmergencyService);

export default router;
