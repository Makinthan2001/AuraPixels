import { prisma } from './lib/prisma';

async function main() {
  try {
    console.log('Testing connection...');
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
  } catch (error) {
    console.error('Error testing connection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
