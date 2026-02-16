
import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', getSettings);
router.post('/', upload.single('siteLogo'), updateSettings);

export default router;
