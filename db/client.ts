import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { getConnectionString } from '@netlify/database';
import * as schema from './schema';

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!cached) {
    const client = neon(getConnectionString());
    cached = drizzle(client, { schema });
  }
  return cached;
}
