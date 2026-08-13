import { Router } from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
} from '../controllers/incidentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', protect, createIncident);
router.put('/:id', protect, updateIncident);
router.delete('/:id', protect, deleteIncident);

export default router;
