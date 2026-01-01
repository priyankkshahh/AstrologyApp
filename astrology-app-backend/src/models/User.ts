import { getPostgreSQLPool } from '../config/database';
import { User } from '../types';
import bcrypt from 'bcrypt';
import { env } from '../config/env';

export class UserModel {
  static async create(data: {
    email: string;
    password?: string;
    phone?: string;
    google_id?: string;
    apple_id?: string;
  }): Promise<User> {
    const pool = getPostgreSQLPool();
    
    let password_hash: string | undefined;
    if (data.password) {
      password_hash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
    }

    const query = `
      INSERT INTO users (email, password_hash, phone, google_id, apple_id, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.email,
      password_hash || null,
      data.phone || null,
      data.google_id || null,
      data.apple_id || null,
      !!(data.google_id || data.apple_id),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<User | null> {
    const pool = getPostgreSQLPool();
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const pool = getPostgreSQLPool();
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByGoogleId(google_id: string): Promise<User | null> {
    const pool = getPostgreSQLPool();
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [google_id]);
    return result.rows[0] || null;
  }

  static async findByAppleId(apple_id: string): Promise<User | null> {
    const pool = getPostgreSQLPool();
    const query = 'SELECT * FROM users WHERE apple_id = $1';
    const result = await pool.query(query, [apple_id]);
    return result.rows[0] || null;
  }

  static async update(id: string, data: Partial<User>): Promise<User | null> {
    const pool = getPostgreSQLPool();
    
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => data[key as keyof User]);

    const query = `
      UPDATE users 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.password_hash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const password_hash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    const result = await pool.query(query, [password_hash, id]);
    return result.rowCount! > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}
