const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: [
    { name: 'HIK Vision Dome', model: 'DS-2CD2143G2-I', category: 'Surveillance Cameras', price: 249, stockQuantity: 12, image: '/placeholder.svg' },
    { name: 'HIK Vision Bullet', model: 'DS-2CD2347G2-LU', category: 'Surveillance Cameras', price: 399, stockQuantity: 4, image: '/placeholder.svg' },
    { name: 'HIK Vision PTZ', model: 'DS-2DE4425IWG-E', category: 'Surveillance Cameras', price: 899, stockQuantity: 0, image: '/placeholder.svg' }
  ]});
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
