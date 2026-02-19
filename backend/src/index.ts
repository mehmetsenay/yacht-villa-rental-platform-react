import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import bookingRoutes from './routes/bookingRoutes';
import settingsRoutes from './routes/settingsRoutes';

import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://yacht-villa-rental-platform-react.vercel.app',
    'https://yacht-villa-rental-platform-react.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
// Serve uploaded images statically
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Keep for backward compatibility
app.use('/villalar-foto', express.static(path.join(process.cwd(), 'villalar-foto'))); // Correct active directory

app.use('/api/admin', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
    res.send('Backend Server is Running');
});

import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
