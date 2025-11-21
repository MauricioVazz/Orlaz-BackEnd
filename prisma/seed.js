import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/index.js';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Skipping admin seed: `ADMIN_EMAIL` and `ADMIN_PASSWORD` must be set in .env to create the admin user.');
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: hashed,
        role: 'ADMIN',
        avatarColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
        updatedAt: new Date()
      }
    });
    console.log('Admin user created:', email);
  } else {
    console.log('Admin already exists.');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
