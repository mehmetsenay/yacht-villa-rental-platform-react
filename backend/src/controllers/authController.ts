import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET is not defined.");
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const admin = await prisma.admin.findUnique({
            where: { email },
        });

        if (!admin) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({ token, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
