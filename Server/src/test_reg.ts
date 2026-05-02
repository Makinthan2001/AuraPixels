import { prisma } from './lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  try {
    console.log('Testing registration...');
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email,
        password: hashedPassword,
      },
    });
    console.log('User created:', user.email);
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log('User deleted for cleanup');
  } catch (error) {
    console.error('Error testing registration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
