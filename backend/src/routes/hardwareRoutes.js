import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getAllHardware, getHardwareById, createHardware, updateHardware, deleteHardware } from '../controllers/hardwareController.js';

const router = Router();

router.get('/', getAllHardware);
router.get('/:id', getHardwareById);
router.post('/', authenticate, authorize('admin'), createHardware);
router.put('/:id', authenticate, authorize('admin'), updateHardware);
router.delete('/:id', authenticate, authorize('admin'), deleteHardware);

export default router;
