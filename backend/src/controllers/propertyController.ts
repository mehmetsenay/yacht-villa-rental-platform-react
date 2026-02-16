import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProperties = async (req: Request, res: Response) => {
    try {
        const { type, location, guests, startDate, endDate } = req.query;

        const where: any = {};

        if (type) {
            where.type = String(type);
        }

        if (location) {
            where.location = {
                contains: String(location),
            }; // Case-insensitive handled by SQLite? No, need explicit mode often, but SQLite default is mixed.
            // For better fuzzy search, usually 'contains'.
        }

        // Guests filter (Capacity should be >= guests)
        if (guests) {
            where.capacity = {
                gte: parseInt(String(guests))
            };
        }

        // Date Availability Filter
        if (startDate && endDate) {
            const start = new Date(String(startDate));
            const end = new Date(String(endDate));

            where.bookings = {
                none: {
                    status: { in: ['CONFIRMED', 'PENDING'] },
                    startDate: { lt: end },
                    endDate: { gt: start }
                }
            };
        }

        const properties = await prisma.property.findMany({
            where,
            include: { images: true, bookings: false }, // Don't need bookings in list view usually, but kept previous behavior? Previous was true.
            // Let's keep images true. Bookings probably not needed for search results.
        });
        res.json(properties);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
};

export const getPropertyById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const propertyId = String(id);
    try {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                images: true,
                bookings: {
                    where: {
                        status: {
                            in: ['CONFIRMED', 'PENDING'] // Lock both confirmed and pending to avoid overlap
                        }
                    },
                    select: {
                        startDate: true,
                        endDate: true
                    }
                }
            },
        });
        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch property' });
    }
};

export const createProperty = async (req: Request, res: Response) => {
    const { name, type, dailyPrice, location, latitude, longitude, description, amenities, capacity, cabins } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        const newProperty = await prisma.property.create({
            data: {
                name,
                type,
                dailyPrice: parseFloat(dailyPrice),
                location,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                description,
                amenities: amenities || "[]",
                capacity: capacity ? parseInt(capacity) : 0,
                cabins: cabins ? parseInt(cabins) : null,
                images: {
                    create: files?.map(file => ({
                        url: `/uploads/${file.filename}` // Save relative path
                    })) || [],
                },
            },
            include: { images: true },
        });
        res.status(201).json(newProperty);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create property' });
    }
};

export const updateProperty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const propertyId = String(id);
    const { name, type, dailyPrice, location, latitude, longitude, description, amenities, capacity, cabins } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        const updatedProperty = await prisma.$transaction(async (prisma) => {
            const property = await prisma.property.update({
                where: { id: propertyId },
                data: {
                    name,
                    type,
                    dailyPrice: parseFloat(dailyPrice),
                    location,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    description,
                    amenities: amenities || "[]",
                    capacity: capacity ? parseInt(capacity) : 0,
                    cabins: cabins ? parseInt(cabins) : null
                },
            });

            if (files && files.length > 0) {
                for (const file of files) {
                    await prisma.image.create({
                        data: {
                            url: `/uploads/${file.filename}`,
                            propertyId: propertyId
                        }
                    });
                }
            }

            return prisma.property.findUnique({
                where: { id: propertyId },
                include: { images: true }
            });
        });

        res.json(updatedProperty);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update property' });
    }
};

export const deleteProperty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const propertyId = String(id);
    try {
        await prisma.$transaction(async (prisma) => {
            // Cascade delete will handle images and bookings automatically
            await prisma.property.delete({
                where: { id: propertyId }
            });
        });

        res.json({ message: 'Mülk ve ilişkili veriler başarıyla silindi.' });
    } catch (error) {
        console.error("Delete Property Error:", error);
        res.status(500).json({ error: 'Silme işlemi sırasında beklenmedik bir hata oluştu.' });
    }
};

export const deletePropertyImage = async (req: Request, res: Response) => {
    const { id, imageId } = req.params;
    try {
        await prisma.image.delete({
            where: { id: String(imageId) }
        });
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};
