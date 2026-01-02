import { Response } from 'express';
import { AuthRequest } from '../types';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { DashboardAggregator } from '../services/dashboard/dashboardAggregator';
import { CrossModuleInsightsService } from '../services/dashboard/crossModuleInsights';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { DashboardPreferences } from '../types/dashboard';

const dashboardAggregator = new DashboardAggregator();
const crossModuleInsightsService = new CrossModuleInsightsService();

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const dashboardData = await dashboardAggregator.getDashboardData(req.user.id);

  res.json({
    success: true,
    data: dashboardData
  });
});

export const getDashboardInsights = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const insights = await crossModuleInsightsService.generateInsights(req.user.id);

  res.json({
    success: true,
    data: { insights }
  });
});

export const getReadingsSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const { limit = 20, module } = req.query;

  let query = `
    SELECT id, type, subtype, data, created_at 
    FROM reading_history 
    WHERE user_id = $1
  `;
  const params: any[] = [req.user.id];
  let paramCount = 1;

  if (module && typeof module === 'string') {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    params.push(module);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1}`;
  params.push(parseInt(limit as string) || 20);

  const result = await pool.query(query, params);

  // Calculate summary statistics
  const statsResult = await pool.query(
    `SELECT type, COUNT(*) as count 
     FROM reading_history 
     WHERE user_id = $1 
     GROUP BY type`,
    [req.user.id]
  );

  const byModule = {
    astrology: 0,
    numerology: 0,
    tarot: 0,
    palmistry: 0
  };

  statsResult.rows.forEach(row => {
    if (byModule.hasOwnProperty(row.type)) {
      byModule[row.type as keyof typeof byModule] = parseInt(row.count);
    }
  });

  const totalReadings = Object.values(byModule).reduce((acc, count) => acc + count, 0);

  // Calculate streak (consecutive days with readings)
  const streakResult = await pool.query(
    `SELECT DATE(created_at) as reading_date
     FROM reading_history
     WHERE user_id = $1
     GROUP BY DATE(created_at)
     ORDER BY reading_date DESC
     LIMIT 30`,
    [req.user.id]
  );

  let streakDays = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < streakResult.rows.length; i++) {
    const readingDate = new Date(streakResult.rows[i].reading_date);
    readingDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (readingDate.getTime() === expectedDate.getTime()) {
      streakDays++;
    } else {
      break;
    }
  }

  // Find most frequent module
  const mostFrequentModule = Object.entries(byModule)
    .sort(([, a], [, b]) => b - a)[0][0];

  const summary = {
    total_readings: totalReadings,
    by_module: byModule,
    recent_readings: result.rows.map(row => ({
      id: row.id,
      type: row.type,
      subtype: row.subtype,
      date: row.created_at,
      preview: this.generatePreview(row.type, row.data)
    })),
    streak_days: streakDays,
    most_frequent_module: mostFrequentModule
  };

  res.json({
    success: true,
    data: summary
  });
});

export const getQuickCards = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const limit = parseInt(req.query.limit as string) || 5;
  const dashboardData = await dashboardAggregator.getDashboardData(req.user.id);

  const quickCards = [];

  if (dashboardData.astrology) {
    quickCards.push({
      id: 'quick_astrology',
      module: 'astrology',
      title: dashboardData.astrology.sunSign,
      subtitle: dashboardData.astrology.todayHoroscope.substring(0, 50) + '...',
      icon: '♈',
      color: dashboardData.astrology.luckyColor || '#FFD700',
      action: 'astrology'
    });
  }

  if (dashboardData.numerology) {
    quickCards.push({
      id: 'quick_numerology',
      module: 'numerology',
      title: `Day Number ${dashboardData.numerology.dailyNumber}`,
      subtitle: dashboardData.numerology.numerologyMessage.substring(0, 50) + '...',
      icon: '7️⃣',
      color: dashboardData.numerology.luckyColor,
      action: 'numerology'
    });
  }

  if (dashboardData.tarot) {
    quickCards.push({
      id: 'quick_tarot',
      module: 'tarot',
      title: dashboardData.tarot.dailyCard.name,
      subtitle: dashboardData.tarot.dailyCard.interpretation.substring(0, 50) + '...',
      icon: '🔮',
      color: '#9400D3',
      action: 'tarot'
    });
  }

  if (dashboardData.palmistry && dashboardData.palmistry.recentPhotosCount > 0) {
    quickCards.push({
      id: 'quick_palmistry',
      module: 'palmistry',
      title: `${dashboardData.palmistry.recentPhotosCount} Palm Readings`,
      subtitle: dashboardData.palmistry.personalityHighlight || 'Explore your hand analysis',
      icon: '🤚',
      color: '#FF6B6B',
      action: 'palmistry'
    });
  }

  res.json({
    success: true,
    data: {
      quick_cards: quickCards.slice(0, limit)
    }
  });
});

export const getDashboardPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const result = await pool.query(
    'SELECT * FROM dashboard_preferences WHERE user_id = $1',
    [req.user.id]
  );

  let preferences = result.rows[0];

  if (!preferences) {
    // Create default preferences
    const defaultPreferences: DashboardPreferences = {
      user_id: req.user.id,
      modules_enabled: ['astrology', 'numerology', 'tarot', 'palmistry'],
      widget_order: ['astrology', 'insights', 'tarot', 'numerology', 'palmistry'],
      show_insights: true,
      daily_card_time: '09:00',
      weekly_read_day: 'Monday',
      created_at: new Date(),
      updated_at: new Date()
    };

    const insertResult = await pool.query(
      `INSERT INTO dashboard_preferences 
       (user_id, modules_enabled, widget_order, show_insights, daily_card_time, weekly_read_day)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        defaultPreferences.user_id,
        defaultPreferences.modules_enabled,
        defaultPreferences.widget_order,
        defaultPreferences.show_insights,
        defaultPreferences.daily_card_time,
        defaultPreferences.weekly_read_day
      ]
    );

    preferences = insertResult.rows[0];
  }

  res.json({
    success: true,
    data: preferences
  });
});

export const updateDashboardPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const { modules_enabled, widget_order, show_insights, daily_card_time, weekly_read_day } = req.body;

  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramCount = 1;

  if (modules_enabled !== undefined) {
    paramCount++;
    updateFields.push(`modules_enabled = $${paramCount}`);
    updateValues.push(modules_enabled);
  }

  if (widget_order !== undefined) {
    paramCount++;
    updateFields.push(`widget_order = $${paramCount}`);
    updateValues.push(widget_order);
  }

  if (show_insights !== undefined) {
    paramCount++;
    updateFields.push(`show_insights = $${paramCount}`);
    updateValues.push(show_insights);
  }

  if (daily_card_time !== undefined) {
    paramCount++;
    updateFields.push(`daily_card_time = $${paramCount}`);
    updateValues.push(daily_card_time);
  }

  if (weekly_read_day !== undefined) {
    paramCount++;
    updateFields.push(`weekly_read_day = $${paramCount}`);
    updateValues.push(weekly_read_day);
  }

  if (updateFields.length === 0) {
    throw new ApiError('No valid fields to update', 400);
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  updateValues.unshift(req.user.id);

  const query = `
    UPDATE dashboard_preferences 
    SET ${updateFields.join(', ')}
    WHERE user_id = $1
    RETURNING *
  `;

  const result = await pool.query(query, updateValues);

  if (result.rows.length === 0) {
    throw new ApiError('Preferences not found', 404);
  }

  // Clear cache for this user
  dashboardAggregator.clearCache(req.user.id);

  res.json({
    success: true,
    data: result.rows[0],
    message: 'Preferences updated successfully'
  });
});

export const refreshDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  // Clear cache and regenerate
  dashboardAggregator.clearCache(req.user.id);
  const dashboardData = await dashboardAggregator.getDashboardData(req.user.id);

  res.json({
    success: true,
    data: dashboardData,
    message: 'Dashboard refreshed successfully'
  });
});

// Helper function
function generatePreview(type: string, data: any): string {
  if (!data) return '';

  switch (type) {
    case 'astrology':
      return data.sunSign ? `${data.sunSign} reading` : 'Astrology reading';
    case 'numerology':
      return data.lifePathNumber ? `Life Path ${data.lifePathNumber}` : 'Numerology reading';
    case 'tarot':
      return data.dailyCard?.name || data.card?.name || 'Tarot reading';
    case 'palmistry':
      return data.handShape ? `${data.handShape} hands` : 'Palm reading';
    default:
      return 'Reading';
  }
}
