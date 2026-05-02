import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

async function test() {
  const connectionString = process.env.DATABASE_URL;
  console.log('Testing with:', connectionString?.substring(0, 20) + '...');
  
  const pool = new Pool({ connectionString });
  
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
    await client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

test();
