import { getPostgreSQLPool } from '../config/database';
import { DashboardPreferences } from '../types/dashboard';

export class DashboardPreferencesModel {
  static async findByUserId(userId: string): Promise<DashboardPreferences | null> {
    const pool = getPostgreSQLPool();
    const query = 'SELECT * FROM dashboard_preferences WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async create(userId: string, preferences: Partial<DashboardPreferences>): Promise<DashboardPreferences> {
    const pool = getPostgreSQLPool();
    
    const query = `
      INSERT INTO dashboard_preferences (user_id, modules_enabled, widget_order, show_insights, daily_card_time, weekly_read_day)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      userId,
      preferences.modules_enabled || ['astrology', 'numerology', 'tarot', 'palmistry'],
      preferences.widget_order || ['astrology', 'insights', 'tarot', 'numerology', 'palmistry'],
      preferences.show_insights !== undefined ? preferences.show_insights : true,
      preferences.daily_card_time || '09:00',
      preferences.weekly_read_day || 'Monday'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(userId: string, preferences: Partial<DashboardPreferences>): Promise<DashboardPreferences | null> {
    const pool = getPostgreSQLPool();
    
    const fields = Object.keys(preferences)
      .filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.keys(preferences)
      .filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at')
      .map(key => preferences[key as keyof DashboardPreferences]);

    const query = `
      UPDATE dashboard_preferences 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [userId, ...values]);
    return result.rows[0] || null;
  }

  static async delete(userId: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const query = 'DELETE FROM dashboard_preferences WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount! > 0;
  }
}
