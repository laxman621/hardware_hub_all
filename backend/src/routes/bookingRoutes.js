import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getAllBookings,
  getBookingById,
  getUserBookings,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  deleteBooking
} from '../controllers/bookingController.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAllBookings);
router.get('/user/:userId', authenticate, authorize('user', 'admin'), getUserBookings);
router.get('/:id', authenticate, authorize('user', 'professional', 'admin'), getBookingById);
router.post('/', authenticate, authorize('user', 'admin'), createBooking);
router.put('/:id/cancel', authenticate, authorize('user', 'admin'), cancelBooking);
router.put('/:id/status', authenticate, authorize('professional', 'admin'), updateBookingStatus);
router.delete('/:id', authenticate, authorize('user', 'professional', 'admin'), deleteBooking);

export default router;
