import { NextResponse } from 'next/server';
import { seedProducts } from '../../../lib/seed';

async function getPrisma() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    return new PrismaClient();
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const prisma = await getPrisma();
  if (prisma) {
    const items = await prisma.product.findMany();
    await prisma.$disconnect();
    return NextResponse.json(items);
  }
  return NextResponse.json(seedProducts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const prisma = await getPrisma();
  if (prisma) {
    const created = await prisma.product.create({ data: body });
    await prisma.$disconnect();
    return NextResponse.json(created);
  }
  return NextResponse.json(body);
}
