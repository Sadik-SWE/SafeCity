import { Router } from 'express';
import {
  updateIncidentStatus,
  verifyIncident,
  deleteIncident,
  getAllUsers,
  toggleUserActive,
  updateUserRole,
  deleteUser,
} from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.put('/incidents/:id/status', updateIncidentStatus);
router.put('/incidents/:id/verify', verifyIncident);
router.delete('/incidents/:id', deleteIncident);
router.get('/users', getAllUsers);
router.put('/users/:id/active', toggleUserActive);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
