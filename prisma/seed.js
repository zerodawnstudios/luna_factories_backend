// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // Clear existing data (order matters due to relations)
  await prisma.picture.deleteMany();
  await prisma.product.deleteMany();
  await prisma.factory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Existing data cleared.');

  // Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Admin',
        email: 'admin@example.com',
        phone: faker.phone.number(),
        country: faker.location.country(),
        password: adminPassword,
        isAdmin: true,
      },
      ...Array.from({ length: 3 }).map(() => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        country: faker.location.country(),
        password: bcrypt.hashSync('password123', 10),
        isAdmin: false,
      })),
    ],
  });
  console.log('Users created');

  // Seed Categories
  const categoryNames = ['Textiles', 'Electronics', 'Furniture', 'Toys'];
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.create({ data: { name } }))
  );
  console.log('Categories created');

  // Seed Factories
  const factories = [];
  for (const category of categories) {
    for (let i = 0; i < 3; i++) {
      const factory = await prisma.factory.create({
        data: {
          name: faker.company.name(),
          location: faker.location.city(),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          certification: faker.company.buzzPhrase(),
          productionCapacity: `${faker.number.int({
            min: 1000,
            max: 5000,
          })} units/month`,
          description: faker.lorem.paragraph(),
          recommendedReason: faker.lorem.sentence(),
          videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mainImage: faker.image.url(),
          status: faker.helpers.arrayElement(['active', 'inactive']),
          categoryId: category.id,
        },
      });
      factories.push(factory);
    }
  }
  console.log('Factories created');

  // Seed Products
  for (const factory of factories) {
    const count = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < count; i++) {
      await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price()),
          factoryId: factory.id,
        },
      });
    }
  }
  console.log('Products created');

  // Seed Pictures
  for (const factory of factories) {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      await prisma.picture.create({
        data: {
          url: faker.image.url(),
          factoryId: factory.id,
        },
      });
    }
  }
  console.log('Pictures created');

  console.log('Seeding complete.');
}

main()
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
