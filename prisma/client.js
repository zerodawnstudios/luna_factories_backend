import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const prisma = new PrismaClient();
export default prisma;
