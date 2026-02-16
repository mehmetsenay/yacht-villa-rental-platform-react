import express from 'express';
import {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    deletePropertyImage,
} from '../controllers/propertyController';
import { authenticateToken } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected routes (Admin only)
router.post('/', authenticateToken, upload.array('images', 10), createProperty);
router.put('/:id', authenticateToken, upload.array('images', 10), updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);
router.delete('/:id/images/:imageId', authenticateToken, deletePropertyImage);

export default router;
