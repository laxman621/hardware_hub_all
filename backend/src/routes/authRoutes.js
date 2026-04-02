import express from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken, verifySession, authenticate ,authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes working!' 
  });
});

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes (authentication required)
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword);




// // Anyone logged in can browse hardware (customers, professionals, admin)
// router.get('/hardware', authenticate, authorize('user', 'professional', 'admin'), getAllHardware);

// // Only customers can book a rental
// router.post('/rentals/book', authenticate, authorize('user'), bookRental);

// // Only admin can add new hardware to the store
// router.post('/hardware', authenticate, authorize('admin'), createHardware);

// // Only professionals can update their availability
// router.put('/professional/availability', authenticate, authorize('professional'), updateAvailability);

// // Only customers can hire a professional
// router.post('/bookings', authenticate, authorize('user'), hireProfessional);

// Example: JWT-only protected route
router.get('/jwt-only', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'This route requires JWT token',
    user: req.user
  });
});

// Example: Session-only protected route
router.get('/session-only', verifySession, (req, res) => {
  res.json({
    success: true,
    message: 'This route requires session cookie',
    user: req.user
  });
});

export default router;