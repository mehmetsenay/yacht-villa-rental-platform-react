import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendBookingNotification } from '../services/mailService';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
    const { propertyId, startDate, endDate, customerName, customerEmail, customerPhone, guests } = req.body;

    try {
        if (!propertyId || !startDate || !endDate || !customerName || !customerEmail) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Fetch property to get daily price
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            res.status(400).json({ error: 'Invalid date range' });
            return;
        }

        // Check for collisions — only CONFIRMED bookings block new reservations
        const existingBooking = await prisma.booking.findFirst({
            where: {
                propertyId: propertyId,
                status: { in: ['CONFIRMED'] },
                startDate: { lt: end },
                endDate: { gt: start }
            }
        });

        if (existingBooking) {
            res.status(400).json({ error: 'Selected dates are not available.' });
            return;
        }

        // Calculate total price based on DB data for security
        const totalPrice = nights * property.dailyPrice;

        const booking = await prisma.booking.create({
            data: {
                property: { connect: { id: propertyId } },
                startDate: start,
                endDate: end,
                totalPrice,
                status: 'PENDING',
                customerName,
                customerEmail,
                customerPhone,
                guests: Number(guests)
            },
        });

        // Mock Payment Initialization (Skeleton)
        const initializePayment = (bookingId: string, amount: number) => {
            // In a real scenario, this would contact Iyzico/Stripe API
            // Returns a checkout URL
            return `https://mock-payment-gateway.com/pay/${bookingId}?amount=${amount}`;
        };

        const paymentUrl = initializePayment(booking.id, totalPrice);

        // Fetch settings for dynamic recipient
        const settings = await prisma.settings.findFirst();
        const recipientEmail = settings?.notificationEmail || settings?.contactEmail || process.env.SMTP_USER;

        // Send Notification Email
        await sendBookingNotification({
            propertyName: property.name,
            customerName,
            customerEmail,
            customerPhone,
            startDate: start,
            endDate: end,
            totalPrice,
            nights,
            recipientEmail: recipientEmail || undefined
        });

        res.status(201).json({ ...booking, paymentUrl });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                property: {
                    select: { name: true, type: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be PENDING, CONFIRMED, or CANCELLED.' });
        return;
    }

    try {
        const updated = await prisma.booking.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
};
