import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { createRental, getUserRentals, getRentalById, returnRental, getAllRentals, updateRentalStatus } from '../controllers/rentalController.js';

const router = Router();

router.post('/', authenticate, createRental);
router.get('/user/:userId', authenticate, getUserRentals);
router.put('/:id/return', authenticate, returnRental);
router.put('/:id/status', authenticate, authorize('admin'), updateRentalStatus);
router.get('/', authenticate, authorize('admin'), getAllRentals);
router.get('/:id', authenticate, getRentalById);

export default router;
