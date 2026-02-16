
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { removeWhiteBackground } from '../utils/imageUtils';
import path from 'path';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response) => {
    try {
        let settings = await prisma.settings.findFirst();

        if (!settings) {
            // Create default settings if not exists
            settings = await prisma.settings.create({
                data: {}
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const {
            siteName,
            contactPhone,
            contactEmail,
            notificationEmail,
            whatsappNumber,
            linkedinUrl,
            address,
            youtubeUrl,
            instagramUrl,
            facebookUrl,
            footerAboutText,
            copyrightText
        } = req.body;

        let settings = await prisma.settings.findFirst();

        let siteLogo = settings?.siteLogo;
        if (req.file) {
            // Process the uploaded image
            const processedFilePath = await removeWhiteBackground(req.file.path);
            // Get relative path for DB
            const filename = path.basename(processedFilePath);
            siteLogo = `/uploads/${filename}`;
        }

        if (settings) {
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: {
                    siteName,
                    siteLogo,
                    contactPhone,
                    contactEmail,
                    notificationEmail,
                    whatsappNumber,
                    linkedinUrl,
                    address,
                    youtubeUrl,
                    instagramUrl,
                    facebookUrl,
                    footerAboutText,
                    copyrightText
                }
            });
        } else {
            settings = await prisma.settings.create({
                data: {
                    siteName,
                    siteLogo,
                    contactPhone,
                    contactEmail,
                    notificationEmail,
                    whatsappNumber,
                    linkedinUrl,
                    address,
                    youtubeUrl,
                    instagramUrl,
                    facebookUrl,
                    footerAboutText,
                    copyrightText
                }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
