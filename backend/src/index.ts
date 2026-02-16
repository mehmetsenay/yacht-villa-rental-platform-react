import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import bookingRoutes from './routes/bookingRoutes';
import settingsRoutes from './routes/settingsRoutes';

import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: [/localhost:517\d/],
    credentials: true
}));
app.use(express.json());
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
