import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_URL: string;
  
  DATABASE_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  
  MONGODB_URI: string;
  
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID?: string;
  FIREBASE_ADMIN_SDK_JSON?: string;
  
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY_PATH?: string;
  
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string;
  
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  BCRYPT_SALT_ROUNDS: number;
  ENCRYPTION_KEY: string;
  
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const env: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3000),
  API_URL: getEnvVariable('API_URL', 'http://localhost:3000'),
  
  DATABASE_URL: getEnvVariable('DATABASE_URL', ''),
  DB_HOST: getEnvVariable('DB_HOST', 'localhost'),
  DB_PORT: getEnvNumber('DB_PORT', 5432),
  DB_NAME: getEnvVariable('DB_NAME', 'astrology_app'),
  DB_USER: getEnvVariable('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVariable('DB_PASSWORD', ''),
  
  MONGODB_URI: getEnvVariable('MONGODB_URI', ''),
  
  JWT_SECRET: getEnvVariable('JWT_SECRET', 'dev_jwt_secret'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN', '15m'),
  REFRESH_TOKEN_SECRET: getEnvVariable('REFRESH_TOKEN_SECRET', 'dev_refresh_secret'),
  REFRESH_TOKEN_EXPIRES_IN: getEnvVariable('REFRESH_TOKEN_EXPIRES_IN', '7d'),
  
  FIREBASE_API_KEY: getEnvVariable('FIREBASE_API_KEY', ''),
  FIREBASE_AUTH_DOMAIN: getEnvVariable('FIREBASE_AUTH_DOMAIN', ''),
  FIREBASE_PROJECT_ID: getEnvVariable('FIREBASE_PROJECT_ID', ''),
  FIREBASE_STORAGE_BUCKET: getEnvVariable('FIREBASE_STORAGE_BUCKET', ''),
  FIREBASE_MESSAGING_SENDER_ID: getEnvVariable('FIREBASE_MESSAGING_SENDER_ID', ''),
  FIREBASE_APP_ID: getEnvVariable('FIREBASE_APP_ID', ''),
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
  FIREBASE_ADMIN_SDK_JSON: process.env.FIREBASE_ADMIN_SDK_JSON,
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
  APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
  APPLE_KEY_ID: process.env.APPLE_KEY_ID,
  APPLE_PRIVATE_KEY_PATH: process.env.APPLE_PRIVATE_KEY_PATH,
  
  FRONTEND_URL: getEnvVariable('FRONTEND_URL', 'http://localhost:19006'),
  ALLOWED_ORIGINS: getEnvVariable('ALLOWED_ORIGINS', 'http://localhost:19006'),
  
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  
  BCRYPT_SALT_ROUNDS: getEnvNumber('BCRYPT_SALT_ROUNDS', 12),
  ENCRYPTION_KEY: getEnvVariable('ENCRYPTION_KEY', 'dev_encryption_key_32_characters'),
  
  LOG_LEVEL: getEnvVariable('LOG_LEVEL', 'info'),
  LOG_FILE_PATH: getEnvVariable('LOG_FILE_PATH', 'logs/app.log'),
};

export default env;
