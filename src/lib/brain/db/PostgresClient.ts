/**
 * @fileOverview Axiom Frontier - PostgreSQL Relational Core
 * Integration point for high-density world data and persistent ledger.
 * Connection: postgresql://projectouroboroscollective@gmail.com@34.185.177.59:5432/ouroboros_db
 */

import { Pool } from 'pg';

const connectionString = 'postgresql://projectouroboroscollective@gmail.com@34.185.177.59:5432/ouroboros_db';

export class PostgresClient {
  private pool: Pool | null = null;

  constructor() {
    // Only initialize if we're on the server
    if (typeof window === 'undefined') {
      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        }
      });
    }
  }

  async query(text: string, params?: any[]) {
    if (!this.pool) throw new Error('PostgresClient called on client side or not initialized.');
    return this.pool.query(text, params);
  }

  async checkConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const res = await this.pool.query('SELECT NOW()');
      return !!res.rows[0];
    } catch (e) {
      console.error('[POSTGRES_CONNECT_ERROR]', e);
      return false;
    }
  }
}

export const pgClient = new PostgresClient();
