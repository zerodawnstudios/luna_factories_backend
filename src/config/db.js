import prisma from '../../prisma/client.js';

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Postgres DB connected via Prisma');
  } catch (error) {
    console.error('DB connection failed', error);
    process.exit(1);
  }
};
