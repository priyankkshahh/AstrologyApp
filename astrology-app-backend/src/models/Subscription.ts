import { getPostgreSQLPool } from '../config/database';
import { Subscription } from '../types';

export class SubscriptionModel {
  static async create(data: {
    user_id: string;
    plan_type: 'basic' | 'premium' | 'ultimate';
    status?: 'active' | 'inactive' | 'cancelled';
    end_date?: Date;
    auto_renewal?: boolean;
  }): Promise<Subscription> {
    const pool = getPostgreSQLPool();

    const query = `
      INSERT INTO subscriptions (user_id, plan_type, status, end_date, auto_renewal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      data.user_id,
      data.plan_type,
      data.status || 'active',
      data.end_date || null,
      data.auto_renewal !== undefined ? data.auto_renewal : true,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id: string): Promise<Subscription[]> {
    const pool = getPostgreSQLPool();
    const query = 'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findActiveByUserId(user_id: string): Promise<Subscription | null> {
    const pool = getPostgreSQLPool();
    const query = `
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0] || null;
  }

  static async update(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
    const pool = getPostgreSQLPool();

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return null;
    }

    values.push(id);

    const query = `
      UPDATE subscriptions 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async cancel(id: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const query = `
      UPDATE subscriptions 
      SET status = 'cancelled', auto_renewal = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const query = 'DELETE FROM subscriptions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}
