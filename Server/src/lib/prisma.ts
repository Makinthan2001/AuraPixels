import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

// Bypass firewall by using WebSockets on Port 443
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({
  adapter: adapter as any,
  log: ['query', 'error', 'warn'],
});

console.log('Neon Database adapter initialized with Query logging');
