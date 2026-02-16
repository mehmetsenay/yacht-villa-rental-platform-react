import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function main() {
    const prisma = new PrismaClient();
    try {
        const count = await prisma.admin.count();
        console.log('Admin count:', count);
        const admins = await prisma.admin.findMany();
        console.log('Admins:', admins);

        const bookingCount = await prisma.booking.count();
        console.log('Booking count:', bookingCount);
        const bookings = await prisma.booking.findMany();
        console.log('Bookings:', bookings);
    } catch (e) {
        console.error(e);
    }
}

main();
