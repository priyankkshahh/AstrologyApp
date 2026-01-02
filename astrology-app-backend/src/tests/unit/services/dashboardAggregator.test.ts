import { dashboardAggregator } from '../../../services/dashboard/dashboardAggregator';
import { setupTestDatabase, cleanupTestDatabase, resetTestDatabase } from '../../setup';

describe('Dashboard Aggregator Service', () => {
  let userId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    userId = 1; // Test user created in setup
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  describe('getDashboardData', () => {
    it('should aggregate dashboard data for user', async () => {
      const result = await dashboardAggregator.getDashboardData(userId);

      expect(result).toBeDefined();
      expect(result.astrology).toBeDefined();
      expect(result.numerology).toBeDefined();
      expect(result.tarot).toBeDefined();
      expect(result.palmistry).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.preferences).toBeDefined();
    });

    it('should include all modules in response', async () => {
      const result = await dashboardAggregator.getDashboardData(userId);

      expect(result.astrology).toHaveProperty('dailyHoroscope');
      expect(result.numerology).toHaveProperty('lifePathNumber');
      expect(result.tarot).toHaveProperty('dailyCard');
      expect(result.palmistry).toHaveProperty('lastReading');
    });

    it('should use cache for subsequent calls', async () => {
      // First call
      const start1 = Date.now();
      const result1 = await dashboardAggregator.getDashboardData(userId);
      const time1 = Date.now() - start1;

      // Second call (should use cache)
      const start2 = Date.now();
      const result2 = await dashboardAggregator.getDashboardData(userId);
      const time2 = Date.now() - start2;

      expect(result2).toEqual(result1);
      expect(time2).toBeLessThan(time1); // Cached call should be faster
    });

    it('should return default values for new users', async () => {
      // Insert new user without readings
      const result = await dashboardAggregator.getDashboardData(userId);

      expect(result.astrology).not.toBeNull();
      expect(result.numerology).not.toBeNull();
      expect(result.tarot).not.toBeNull();
      expect(result.palmistry).not.toBeNull();
    });
  });

  describe('getInsights', () => {
    it('should generate cross-module insights', async () => {
      const result = await dashboardAggregator.getInsights(userId);

      expect(result).toBeDefined();
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should categorize insights by type', async () => {
      const result = await dashboardAggregator.getInsights(userId);

      result.insights.forEach(insight => {
        expect(insight.type).toBeDefined();
        expect(insight.type).toMatch(/compatibility|career|relationships|health|general/);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.sources).toBeDefined();
        expect(insights.types.includes(insight.type)).toBe(true);
      });
    });

    it('should limit insights to maximum number', async () => {
      const result = await dashboardAggregator.getInsights(userId);

      expect(result.insights.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getReadingsSummary', () => {
    it('should return readings summary', async () => {
      const result = await dashboardAggregator.getReadingsSummary(userId, {});

      expect(result).toBeDefined();
      expect(result.totalReadings).toBeDefined();
      expect(result.byType).toBeDefined();
      expect(result.recentReadings).toBeDefined();
    });

    it('should filter readings by type', async () => {
      const result = await dashboardAggregator.getReadingsSummary(userId, {
        type: 'astrology',
      });

      expect(result.byType).toBeDefined();
      if (result.totalReadings > 0) {
        expect(result.recentReadings.every(r => r.type === 'astrology')).toBe(true);
      }
    });

    it('should filter readings by date range', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const result = await dashboardAggregator.getReadingsSummary(userId, {
        startDate,
        endDate,
      });

      expect(result).toBeDefined();
    });

    it('should paginate results', async () => {
      const result = await dashboardAggregator.getReadingsSummary(userId, {
        limit: 5,
        offset: 0,
      });

      expect(result.recentReadings.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getQuickCards', () => {
    it('should return quick insight cards', async () => {
      const result = await dashboardAggregator.getQuickCards(userId, 4);

      expect(result).toBeDefined();
      expect(result.cards).toBeDefined();
      expect(result.cards).toBeInstanceOf(Array);
      expect(result.cards.length).toBeLessThanOrEqual(4);
    });

    it('should include cards from different modules', async () => {
      const result = await dashboardAggregator.getQuickCards(userId, 10);

      const modules = result.cards.map(card => card.module);
      const uniqueModules = [...new Set(modules)];

      expect(uniqueModules.length).toBeGreaterThan(1);
    });

    it('should limit cards to requested number', async () => {
      const limit = 3;
      const result = await dashboardAggregator.getQuickCards(userId, limit);

      expect(result.cards.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const result = await dashboardAggregator.getUserPreferences(userId);

      expect(result).toBeDefined();
      expect(result.enabledModules).toBeDefined();
      expect(result.widgetOrder).toBeDefined();
      expect(result.displaySettings).toBeDefined();
    });

    it('should return default preferences for new users', async () => {
      const result = await dashboardAggregator.getUserPreferences(userId);

      expect(result.enabledModules).toContain('astrology');
      expect(result.enabledModules).toContain('numerology');
      expect(result.enabledModules).toContain('tarot');
      expect(result.enabledModules).toContain('palmistry');
    });
  });

  describe('saveUserPreferences', () => {
    it('should save user preferences', async () => {
      const newPreferences = {
        enabledModules: ['astrology', 'tarot'],
        widgetOrder: [1, 3],
        displaySettings: { theme: 'dark' },
      };

      const result = await dashboardAggregator.saveUserPreferences(userId, newPreferences);

      expect(result).toBeDefined();
      expect(result.enabledModules).toEqual(newPreferences.enabledModules);
      expect(result.widgetOrder).toEqual(newPreferences.widgetOrder);
      expect(result.displaySettings.theme).toBe('dark');
    });

    it('should validate preferences', async () => {
      const invalidPreferences = {
        enabledModules: ['invalid_module'],
      };

      await expect(
        dashboardAggregator.saveUserPreferences(userId, invalidPreferences)
      ).rejects.toThrow();
    });

    it('should update existing preferences', async () => {
      const preferences1 = await dashboardAggregator.getUserPreferences(userId);

      const updatedPreferences = {
        ...preferences1,
        widgetOrder: [4, 3, 2, 1],
      };

      const result = await dashboardAggregator.saveUserPreferences(userId, updatedPreferences);

      expect(result.widgetOrder).toEqual([4, 3, 2, 1]);
    });
  });

  describe('refreshDashboard', () => {
    it('should force refresh of dashboard data', async () => {
      const result = await dashboardAggregator.refreshDashboard(userId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('should clear cache on refresh', async () => {
      // Get cached data
      const result1 = await dashboardAggregator.getDashboardData(userId);

      // Force refresh
      await dashboardAggregator.refreshDashboard(userId);

      // Get data again (should be fresh)
      const result2 = await dashboardAggregator.getDashboardData(userId);

      expect(result2).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user id', async () => {
      await expect(
        dashboardAggregator.getDashboardData(999999)
      ).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      // This would require mocking database errors
      // For now, we'll test with invalid input
      await expect(
        dashboardAggregator.saveUserPreferences(userId, {} as any)
      ).rejects.toThrow();
    });

    it('should handle missing module data', async () => {
      // Test with user who has no data for certain modules
      const result = await dashboardAggregator.getDashboardData(userId);

      expect(result.astrology).not.toBeNull();
      expect(result.numerology).not.toBeNull();
      expect(result.tarot).not.toBeNull();
      expect(result.palmistry).not.toBeNull();
    });
  });
});
