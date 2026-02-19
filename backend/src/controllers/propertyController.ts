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
const uploadToSupabase = async (file: Express.Multer.File, folder: string, bucket: string): Promise<string | null> => {
    try {
        const fileContent = await fs.promises.readFile(file.path);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}-${slugify(file.originalname)}`;
        const filePath = `${folder}/${fileName}`;

        console.log(`Attempting upload to Supabase Bucket: ${bucket}, Path: ${filePath}`);

        // Try to upload
        let { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileContent, {
                contentType: file.mimetype,
                upsert: false
            });

        // If bucket doesn't exist, try to create it (if we have permissions)
        if (error && (error as any).message && (error as any).message.includes('bucket not found')) {
            console.warn(`Bucket '${bucket}' not found. Attempting to create...`);
            const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucket, {
                public: true
            });

            if (bucketError) {
                console.error(`Failed to create bucket '${bucket}':`, bucketError);
                // Return null or throw? Let's return null but log clearly.
                // It might work if the user creates it manually.
                return null;
            }

            console.log(`Bucket '${bucket}' created successfully. Retrying upload...`);
            // Retry upload
            const retry = await supabase.storage
                .from(bucket)
                .upload(filePath, fileContent, {
                    contentType: file.mimetype,
                    upsert: false
                });
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error('Supabase upload error:', error);
            if ('statusCode' in error) console.error('Status Code:', (error as any).statusCode);
            if ('message' in error) console.error('Message:', (error as any).message);
            return null;
        }

        // Manually construct public URL using the dynamic bucket name
        const manualPublicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
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
        // Determine bucket based on type
        const bucketName = (type === 'YACHT') ? 'yatlar-foto' : 'villalar-foto';

        const uploadedUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const publicUrl = await uploadToSupabase(file, slug, bucketName);
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
            // Determine bucket based on type (from update body or existing property? Body is safer if type changed)
            // If type is not in body, we should fallback to property.type, but typically type is required in form.
            // Let's assume body has it or fallback.
            const targetType = type || property.type;
            const bucketName = (targetType === 'YACHT') ? 'yatlar-foto' : 'villalar-foto';

            const uploadedUrls: string[] = [];
            for (const file of files) {
                const publicUrl = await uploadToSupabase(file, targetSlug, bucketName);
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
