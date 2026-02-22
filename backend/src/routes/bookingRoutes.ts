import express from 'express';
import { createBooking, getBookings, updateBookingStatus } from '../controllers/bookingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Public route to create a booking (no auth required for customers)
router.post('/', createBooking);

// Protected routes (Admin only)
router.get('/', authenticateToken, getBookings);
router.patch('/:id/status', authenticateToken, updateBookingStatus);

export default router;
