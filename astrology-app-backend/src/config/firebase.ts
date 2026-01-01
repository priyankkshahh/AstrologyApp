import admin from 'firebase-admin';
import { env } from './env';
import logger from '../utils/logger';
import fs from 'fs';

let firebaseInitialized = false;

export const initializeFirebase = (): void => {
  if (firebaseInitialized) {
    logger.warn('Firebase already initialized');
    return;
  }

  try {
    let credential: admin.credential.Credential;

    if (env.FIREBASE_ADMIN_SDK_JSON && fs.existsSync(env.FIREBASE_ADMIN_SDK_JSON)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(env.FIREBASE_ADMIN_SDK_JSON, 'utf8')
      );
      credential = admin.credential.cert(serviceAccount);
    } else {
      credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({
      credential,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });

    firebaseInitialized = true;
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Firebase initialization error:', error);
    logger.warn('Firebase features will not be available');
  }
};

export const getFirebaseStorage = (): admin.storage.Storage => {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return admin.storage();
};

export const getFirebaseAuth = (): admin.auth.Auth => {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return admin.auth();
};

export const uploadToFirebase = async (
  file: Buffer,
  destination: string,
  contentType: string
): Promise<string> => {
  const storage = getFirebaseStorage();
  const bucket = storage.bucket();
  const fileUpload = bucket.file(destination);

  await fileUpload.save(file, {
    metadata: {
      contentType,
    },
    public: false,
  });

  const [url] = await fileUpload.getSignedUrl({
    action: 'read',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
  });

  return url;
};

export const deleteFromFirebase = async (filePath: string): Promise<void> => {
  const storage = getFirebaseStorage();
  const bucket = storage.bucket();
  await bucket.file(filePath).delete();
};

export default admin;
