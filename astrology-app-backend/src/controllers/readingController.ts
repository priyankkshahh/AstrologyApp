import { Response } from 'express';
import { AuthRequest } from '../types';
import { getPostgreSQLPool } from '../config/database';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { uploadToFirebase, deleteFromFirebase } from '../config/firebase';
import { validateRequest, palmPhotoUploadSchema } from '../utils/validators';

export const uploadPalmPhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const data = validateRequest(palmPhotoUploadSchema, req.body);

  if (!req.body.photoData) {
    throw new ApiError('Photo data is required', 400);
  }

  const photoBuffer = Buffer.from(req.body.photoData, 'base64');
  const filename = `palm-photos/${req.user.id}/${data.hand_side}_${Date.now()}.jpg`;
  
  const firebaseUrl = await uploadToFirebase(photoBuffer, filename, 'image/jpeg');

  const pool = getPostgreSQLPool();
  const query = `
    INSERT INTO palm_photos (user_id, hand_side, firebase_url, analysis_status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await pool.query(query, [
    req.user.id,
    data.hand_side,
    firebaseUrl,
    'pending',
  ]);

  res.status(201).json({
    success: true,
    data: { palmPhoto: result.rows[0] },
    message: 'Palm photo uploaded successfully',
  });
});

export const getPalmPhotos = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const pool = getPostgreSQLPool();
  const query = 'SELECT * FROM palm_photos WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [req.user.id]);

  res.json({
    success: true,
    data: { palmPhotos: result.rows },
  });
});

export const deletePalmPhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const { id } = req.params;

  const pool = getPostgreSQLPool();
  const selectQuery = 'SELECT * FROM palm_photos WHERE id = $1 AND user_id = $2';
  const selectResult = await pool.query(selectQuery, [id, req.user.id]);

  if (selectResult.rows.length === 0) {
    throw new ApiError('Palm photo not found', 404);
  }

  const palmPhoto = selectResult.rows[0];

  if (palmPhoto.firebase_url) {
    try {
      const urlParts = new URL(palmPhoto.firebase_url);
      const pathMatch = urlParts.pathname.match(/\/o\/(.+?)\?/);
      if (pathMatch) {
        const filePath = decodeURIComponent(pathMatch[1]);
        await deleteFromFirebase(filePath);
      }
    } catch (error) {
      console.error('Error deleting from Firebase:', error);
    }
  }

  const deleteQuery = 'DELETE FROM palm_photos WHERE id = $1';
  await pool.query(deleteQuery, [id]);

  res.json({
    success: true,
    message: 'Palm photo deleted successfully',
  });
});

export const getPalmPhotoStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const { id } = req.params;

  const pool = getPostgreSQLPool();
  const query = 'SELECT * FROM palm_photos WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [id, req.user.id]);

  if (result.rows.length === 0) {
    throw new ApiError('Palm photo not found', 404);
  }

  res.json({
    success: true,
    data: { palmPhoto: result.rows[0] },
  });
});
