import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.image.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.admin.deleteMany(); // Clear admins
    await prisma.property.deleteMany();
    await prisma.extraService.deleteMany();

    console.log('Deleted existing data.');

    // Create Default Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({
        data: {
            email: 'admin@senay.com',
            password: hashedPassword
        }
    });
    console.log('Default admin created: admin@senay.com / admin123');

    // Villas
    const villas = [
        {
            name: 'Villa Azur',
            type: 'VILLA',
            dailyPrice: 5000,
            location: 'Bodrum',
            description: 'Luks ve konforun bulustugu ozel havuzlu villa.',
            images: [
                'https://placehold.co/600x400?text=Villa+Azur+1',
                'https://placehold.co/600x400?text=Villa+Azur+2'
            ]
        },
        {
            name: 'Villa Safir',
            type: 'VILLA',
            dailyPrice: 4500,
            location: 'Kaş',
            description: 'Doga ile ic ice, muhtesem deniz manzarali villa.',
            images: [
                'https://placehold.co/600x400?text=Villa+Safir+1',
                'https://placehold.co/600x400?text=Villa+Safir+2'
            ]
        },
        {
            name: 'Villa Artemis',
            type: 'VILLA',
            dailyPrice: 6000,
            location: 'Bodrum',
            description: 'Genis bahceli, modern mimarili luks villa.',
            images: [
                'https://placehold.co/600x400?text=Villa+Artemis+1',
                'https://placehold.co/600x400?text=Villa+Artemis+2'
            ]
        }
    ];

    // Yachts
    const yachts = [
        {
            name: 'M/Y Blue Whale',
            type: 'YACHT',
            dailyPrice: 15000,
            location: 'Bodrum Marina',
            description: 'Mavi yolculuk icin 24 metre luks yat.',
            images: [
                'https://placehold.co/600x400?text=Blue+Whale+1',
                'https://placehold.co/600x400?text=Blue+Whale+2'
            ]
        },
        {
            name: 'M/Y Serenity',
            type: 'YACHT',
            dailyPrice: 20000,
            location: 'Göcek',
            description: 'Konfor ve hizin bir arada oldugu super yat.',
            images: [
                'https://placehold.co/600x400?text=Serenity+1',
                'https://placehold.co/600x400?text=Serenity+2'
            ]
        },
        {
            name: 'M/Y Poseidon',
            type: 'YACHT',
            dailyPrice: 18000,
            location: 'Fethiye',
            description: 'Denizlerin tanrisi kadar guclu ve gosterisli yat.',
            images: [
                'https://placehold.co/600x400?text=Poseidon+1',
                'https://placehold.co/600x400?text=Poseidon+2'
            ]
        }
    ];

    // Extra Services
    const services = [
        { name: 'Özel Şef', price: 2000 },
        { name: 'VIP Havalimanı Transferi', price: 1500 },
        { name: 'Yat Partisi Paketi', price: 5000 }
    ];

    // Create Villas
    for (const villa of villas) {
        await prisma.property.create({
            data: {
                name: villa.name,
                type: villa.type,
                dailyPrice: villa.dailyPrice,
                location: villa.location,
                description: villa.description,
                images: {
                    create: villa.images.map(url => ({ url }))
                }
            }
        });
    }

    // Create Yachts
    for (const yacht of yachts) {
        await prisma.property.create({
            data: {
                name: yacht.name,
                type: yacht.type,
                dailyPrice: yacht.dailyPrice,
                location: yacht.location,
                description: yacht.description,
                images: {
                    create: yacht.images.map(url => ({ url }))
                }
            }
        });
    }

    // Create Services
    for (const service of services) {
        await prisma.extraService.create({
            data: service
        });
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
