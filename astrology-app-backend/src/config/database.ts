import { Pool } from 'pg';
import mongoose from 'mongoose';
import { env } from './env';
import logger from '../utils/logger';

let pgPool: Pool | null = null;

export const connectPostgreSQL = async (): Promise<Pool> => {
  if (pgPool) {
    return pgPool;
  }

  try {
    pgPool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const client = await pgPool.connect();
    logger.info('PostgreSQL connected successfully');
    client.release();

    return pgPool;
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

export const getPostgreSQLPool = (): Pool => {
  if (!pgPool) {
    throw new Error('PostgreSQL pool not initialized. Call connectPostgreSQL first.');
  }
  return pgPool;
};

export const disconnectPostgreSQL = async (): Promise<void> => {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
    logger.info('PostgreSQL disconnected');
  }
};

export const connectMongoDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
};

export const connectDatabases = async (): Promise<void> => {
  await Promise.all([
    connectPostgreSQL(),
    connectMongoDB(),
  ]);
  logger.info('All databases connected successfully');
};

export const disconnectDatabases = async (): Promise<void> => {
  await Promise.all([
    disconnectPostgreSQL(),
    disconnectMongoDB(),
  ]);
  logger.info('All databases disconnected');
};
