import { Response } from 'express';
import { AuthRequest, PreferencesUpdateData } from '../types';
import { getPostgreSQLPool } from '../config/database';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { validateRequest, preferencesSchema } from '../utils/validators';

export const getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const pool = getPostgreSQLPool();
  const query = 'SELECT * FROM preferences WHERE user_id = $1';
  const result = await pool.query(query, [req.user.id]);

  let preferences = result.rows[0];

  if (!preferences) {
    const insertQuery = `
      INSERT INTO preferences (user_id)
      VALUES ($1)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [req.user.id]);
    preferences = insertResult.rows[0];
  }

  res.json({
    success: true,
    data: { preferences },
  });
});

export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const data = validateRequest<PreferencesUpdateData>(preferencesSchema, req.body);

  const pool = getPostgreSQLPool();

  const checkQuery = 'SELECT id FROM preferences WHERE user_id = $1';
  const checkResult = await pool.query(checkQuery, [req.user.id]);

  if (checkResult.rows.length === 0) {
    const insertQuery = `
      INSERT INTO preferences (user_id, notifications_enabled, daily_horoscope, theme, language)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      req.user.id,
      data.notifications_enabled ?? true,
      data.daily_horoscope ?? true,
      data.theme ?? 'dark',
      data.language ?? 'en',
    ];
    const result = await pool.query(insertQuery, values);
    
    return res.json({
      success: true,
      data: { preferences: result.rows[0] },
      message: 'Preferences created successfully',
    });
  }

  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new ApiError('No fields to update', 400);
  }

  values.push(req.user.id);

  const updateQuery = `
    UPDATE preferences 
    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(updateQuery, values);

  res.json({
    success: true,
    data: { preferences: result.rows[0] },
    message: 'Preferences updated successfully',
  });
});
