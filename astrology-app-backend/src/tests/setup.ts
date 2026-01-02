import { Pool } from 'pg';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

let testPool: Pool;
let mongoConnection: mongoose.Connection;

// Test database configuration
export const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'astrology_app_test',
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'test',
};

const TEST_MONGO_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/astrology_app_test';

// Mock user data
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  password: 'hashedPassword123',
  name: 'Test User',
};

// Mock JWT token
export const mockAuthToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

// Setup test database
export async function setupTestDatabase() {
  // PostgreSQL setup
  testPool = new Pool(TEST_DB_CONFIG);

  // Drop and recreate test tables
  const client = await testPool.connect();
  try {
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS user_profiles CASCADE');
    await client.query('DROP TABLE IF EXISTS readings CASCADE');
    await client.query('DROP TABLE IF EXISTS dashboard_preferences CASCADE');
    await client.query('DROP TABLE IF EXISTS subscriptions CASCADE');

    // Create test tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE user_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        date_of_birth DATE,
        time_of_birth TIME,
        place_of_birth VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        gender VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE readings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        reading_type VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE dashboard_preferences (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        enabled_modules JSONB DEFAULT '["astrology", "numerology", "tarot", "palmistry"]'::jsonb,
        widget_order JSONB DEFAULT '[1, 2, 3, 4]'::jsonb,
        display_settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        plan_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        stripe_subscription_id VARCHAR(255),
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert test user
    await client.query(
      'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4)',
      [1, mockUser.email, mockUser.password, mockUser.name]
    );

    await client.query(
      `INSERT INTO user_profiles (user_id, date_of_birth, time_of_birth, place_of_birth, latitude, longitude, gender)
       VALUES ($1, '1990-01-15', '08:30:00', 'New York', 40.7128, -74.0060, 'male')`,
      [1]
    );

  } finally {
    client.release();
  }

  // MongoDB setup
  await mongoose.connect(TEST_MONGO_URI);
  mongoConnection = mongoose.connection;
}

// Cleanup test database
export async function cleanupTestDatabase() {
  if (testPool) {
    await testPool.end();
  }

  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}

// Reset test database between tests
export async function resetTestDatabase() {
  const client = await testPool.connect();
  try {
    await client.query('TRUNCATE readings CASCADE');
    await client.query('TRUNCATE subscriptions CASCADE');
  } finally {
    client.release();
  }

  // Clear MongoDB collections
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

export { testPool, mongoConnection };
