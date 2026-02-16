import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing in environment variables.");
} else {
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase Key length:", supabaseKey.length);
    if (!supabaseKey.startsWith("eyJ")) {
        console.warn("WARNING: Supabase Key does not start with 'eyJ'. It might be invalid.");
    }
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

// Helper function to upload file to Supabase
const uploadToSupabase = async (file: Express.Multer.File, folder: string): Promise<string | null> => {
    try {
        const fileContent = await fs.promises.readFile(file.path);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}-${slugify(file.originalname)}`;
        const filePath = `${folder}/${fileName}`;

        console.log(`Attempting upload to Supabase: ${filePath}`);

        const { data, error } = await supabase.storage
            .from('villalar-foto')
            .upload(filePath, fileContent, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            // Log the error details deeply if possible
            if ('statusCode' in error) console.error('Status Code:', (error as any).statusCode);
            if ('message' in error) console.error('Message:', (error as any).message);
            return null;
        }

        // Manually construct public URL to ensure it's correct
        const manualPublicUrl = `${supabaseUrl}/storage/v1/object/public/villalar-foto/${filePath}`;
        console.log("Upload successful. Generated Public URL:", manualPublicUrl);

        // Delete local file after upload
        await fs.promises.unlink(file.path);

        return manualPublicUrl;
    } catch (err) {
        console.error('Error in uploadToSupabase:', err);
        return null;
    }
};

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
            };
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
            include: { images: true, bookings: false },
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
        const slug = slugify(name);

        const uploadedUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const publicUrl = await uploadToSupabase(file, slug);
                if (publicUrl) {
                    uploadedUrls.push(publicUrl);
                }
            }
        }

        // Safe parsing helpers
        const parseNullableFloat = (val: any) => {
            if (!val) return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        };

        const parseNullableInt = (val: any) => {
            if (!val) return null;
            const parsed = parseInt(val);
            return isNaN(parsed) ? null : parsed;
        };

        const newProperty = await prisma.property.create({
            data: {
                name,
                type,
                dailyPrice: parseFloat(dailyPrice),
                location,
                latitude: parseNullableFloat(latitude),
                longitude: parseNullableFloat(longitude),
                description,
                amenities: amenities ? String(amenities) : "[]",
                capacity: capacity ? parseInt(capacity) : 0,
                cabins: parseNullableInt(cabins),
                images: {
                    create: uploadedUrls.map(url => ({ url }))
                },
            },
            include: { images: true },
        });
        res.status(201).json(newProperty);
    } catch (error) {
        console.error("Create Property Error:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        res.status(500).json({ error: 'Failed to create property', details: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updateProperty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const propertyId = String(id);
    const { name, type, dailyPrice, location, latitude, longitude, description, amenities, capacity, cabins } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        // Safe parsing helpers
        const parseNullableFloat = (val: any) => {
            if (!val) return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        };

        const parseNullableInt = (val: any) => {
            if (!val) return null;
            const parsed = parseInt(val);
            return isNaN(parsed) ? null : parsed;
        };

        // 1. Update Property Details (Single DB operation)
        const property = await prisma.property.update({
            where: { id: propertyId },
            data: {
                name,
                type,
                dailyPrice: parseFloat(dailyPrice),
                location,
                latitude: parseNullableFloat(latitude),
                longitude: parseNullableFloat(longitude),
                description,
                amenities: amenities ? String(amenities) : "[]",
                capacity: capacity ? parseInt(capacity) : 0,
                cabins: parseNullableInt(cabins)
            },
        });

        // 2. Handle File Uploads
        if (files && files.length > 0) {
            const targetSlug = slugify(name || property.name);

            const uploadedUrls: string[] = [];
            for (const file of files) {
                const publicUrl = await uploadToSupabase(file, targetSlug);
                if (publicUrl) {
                    uploadedUrls.push(publicUrl);
                }
            }

            // 3. Batch Insert Images
            if (uploadedUrls.length > 0) {
                await prisma.image.createMany({
                    data: uploadedUrls.map(url => ({
                        url,
                        propertyId: propertyId
                    }))
                });
            }
        }

        // 4. Fetch Final State
        const finalProperty = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { images: true }
        });

        res.json(finalProperty);
    } catch (error) {
        console.error("Update Property Error:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        res.status(500).json({ error: 'Failed to update property', details: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const deleteProperty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const propertyId = String(id);
    try {
        // Note: We might want to also delete images from Supabase here
        // But for now, just deleting from DB
        await prisma.$transaction(async (prisma) => {
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
        // Note: Could also delete from Supabase storage using the URL
        await prisma.image.delete({
            where: { id: String(imageId) }
        });
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};
