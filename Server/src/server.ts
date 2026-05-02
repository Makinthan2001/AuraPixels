import app from './app';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  try {
    // Verify Prisma connection on startup
    await prisma.$connect();
    console.log('Successfully connected to Neon Cloud via HTTP Bypass');
  } catch (error) {
    console.error('Failed to connect to database', error);
  }
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
