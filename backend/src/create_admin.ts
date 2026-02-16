import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await prisma.admin.findUnique({
        where: { email }
    });

    if (existingAdmin) {
        await prisma.admin.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log(`Admin user ${email} updated with new password.`);
    } else {
        await prisma.admin.create({
            data: {
                email,
                password: hashedPassword
            }
        });
        console.log(`Admin user ${email} created successfully.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
