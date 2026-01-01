import { getPostgreSQLPool } from '../config/database';
import { UserProfile, ProfileUpdateData } from '../types';

export class UserProfileModel {
  static async create(data: {
    user_id: string;
    full_name: string;
    date_of_birth?: Date;
    birth_time?: string;
    birth_city?: string;
    birth_country?: string;
    birth_latitude?: number;
    birth_longitude?: number;
    gender?: string;
    timezone?: string;
  }): Promise<UserProfile> {
    const pool = getPostgreSQLPool();

    const query = `
      INSERT INTO user_profiles (
        user_id, full_name, date_of_birth, birth_time, birth_city, 
        birth_country, birth_latitude, birth_longitude, gender, timezone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      data.user_id,
      data.full_name,
      data.date_of_birth || null,
      data.birth_time || null,
      data.birth_city || null,
      data.birth_country || null,
      data.birth_latitude || null,
      data.birth_longitude || null,
      data.gender || null,
      data.timezone || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id: string): Promise<UserProfile | null> {
    const pool = getPostgreSQLPool();
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
    const result = await pool.query(query, [user_id]);
    return result.rows[0] || null;
  }

  static async update(user_id: string, data: ProfileUpdateData): Promise<UserProfile | null> {
    const pool = getPostgreSQLPool();

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
      return this.findByUserId(user_id);
    }

    values.push(user_id);

    const query = `
      UPDATE user_profiles 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async markProfileCompleted(user_id: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const query = `
      UPDATE user_profiles 
      SET profile_completed = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rowCount! > 0;
  }

  static async delete(user_id: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const query = 'DELETE FROM user_profiles WHERE user_id = $1';
    const result = await pool.query(query, [user_id]);
    return result.rowCount! > 0;
  }
}
