import express from 'express';
import { createBooking, getBookings } from '../controllers/bookingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Public route to create a booking (no auth required for customers)
router.post('/', createBooking);

// Protected routes (Admin only)
router.get('/', authenticateToken, getBookings);

export default router;
