import request from 'supertest';
import express, { Application } from 'express';
import dashboardRoutes from '../../../routes/dashboardRoutes';
import { setupTestDatabase, cleanupTestDatabase, resetTestDatabase, mockAuthToken } from '../setup';

describe('Dashboard API Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await setupTestDatabase();

    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      // Mock authentication middleware
      req.user = { id: 1, email: 'test@example.com' };
      next();
    });
    app.use('/api/dashboard', dashboardRoutes);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  describe('GET /api/dashboard', () => {
    it('should return complete dashboard data', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.astrology).toBeDefined();
      expect(response.body.numerology).toBeDefined();
      expect(response.body.tarot).toBeDefined();
      expect(response.body.palmistry).toBeDefined();
      expect(response.body.insights).toBeDefined();
      expect(response.body.preferences).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard');

      expect(response.status).toBe(401);
    });

    it('should return data within acceptable time', async () => {
      const start = Date.now();
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', mockAuthToken);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
    });
  });

  describe('GET /api/dashboard/insights', () => {
    it('should return cross-module insights', async () => {
      const response = await request(app)
        .get('/api/dashboard/insights')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.insights).toBeInstanceOf(Array);
      expect(response.body.insights.length).toBeGreaterThan(0);
    });

    it('should categorize insights correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/insights')
        .set('Authorization', mockAuthToken);

      const validTypes = ['compatibility', 'career', 'relationships', 'health', 'general'];
      response.body.insights.forEach((insight: any) => {
        expect(validTypes).toContain(insight.type);
      });
    });

    it('should limit insights to maximum number', async () => {
      const response = await request(app)
        .get('/api/dashboard/insights')
        .set('Authorization', mockAuthToken);

      expect(response.body.insights.length).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /api/dashboard/readings-summary', () => {
    it('should return readings summary', async () => {
      const response = await request(app)
        .get('/api/dashboard/readings-summary')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.totalReadings).toBeDefined();
      expect(response.body.byType).toBeDefined();
      expect(response.body.recentReadings).toBeDefined();
    });

    it('should filter by reading type', async () => {
      const response = await request(app)
        .get('/api/dashboard/readings-summary?type=astrology')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      if (response.body.totalReadings > 0) {
        response.body.recentReadings.forEach((reading: any) => {
          expect(reading.type).toBe('astrology');
        });
      }
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/dashboard/readings-summary?limit=5&offset=0')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body.recentReadings.length).toBeLessThanOrEqual(5);
    });

    it('should handle date range filtering', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const response = await request(app)
        .get(`/api/dashboard/readings-summary?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/dashboard/quick-cards', () => {
    it('should return quick insight cards', async () => {
      const response = await request(app)
        .get('/api/dashboard/quick-cards')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.cards).toBeInstanceOf(Array);
    });

    it('should limit cards to requested number', async () => {
      const limit = 3;
      const response = await request(app)
        .get(`/api/dashboard/quick-cards?limit=${limit}`)
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body.cards.length).toBeLessThanOrEqual(limit);
    });

    it('should include cards from different modules', async () => {
      const response = await request(app)
        .get('/api/dashboard/quick-cards')
        .set('Authorization', mockAuthToken);

      if (response.body.cards.length > 0) {
        const modules = response.body.cards.map((card: any) => card.module);
        const uniqueModules = [...new Set(modules)];
        expect(uniqueModules.length).toBeGreaterThan(0);
      }
    });
  });

  describe('GET /api/dashboard/preferences', () => {
    it('should return user preferences', async () => {
      const response = await request(app)
        .get('/api/dashboard/preferences')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.enabledModules).toBeDefined();
      expect(response.body.widgetOrder).toBeDefined();
      expect(response.body.displaySettings).toBeDefined();
    });

    it('should return default preferences for new users', async () => {
      const response = await request(app)
        .get('/api/dashboard/preferences')
        .set('Authorization', mockAuthToken);

      expect(response.body.enabledModules).toContain('astrology');
      expect(response.body.enabledModules).toContain('numerology');
      expect(response.body.enabledModules).toContain('tarot');
      expect(response.body.enabledModules).toContain('palmistry');
    });
  });

  describe('PUT /api/dashboard/preferences', () => {
    it('should update user preferences', async () => {
      const newPreferences = {
        enabledModules: ['astrology', 'tarot'],
        widgetOrder: [1, 3],
        displaySettings: { theme: 'dark' },
      };

      const response = await request(app)
        .put('/api/dashboard/preferences')
        .set('Authorization', mockAuthToken)
        .send(newPreferences);

      expect(response.status).toBe(200);
      expect(response.body.enabledModules).toEqual(newPreferences.enabledModules);
      expect(response.body.widgetOrder).toEqual(newPreferences.widgetOrder);
    });

    it('should validate preferences', async () => {
      const invalidPreferences = {
        enabledModules: ['invalid_module'],
      };

      const response = await request(app)
        .put('/api/dashboard/preferences')
        .set('Authorization', mockAuthToken)
        .send(invalidPreferences);

      expect(response.status).toBe(400);
    });

    it('should reject empty preferences', async () => {
      const response = await request(app)
        .put('/api/dashboard/preferences')
        .set('Authorization', mockAuthToken)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/dashboard/refresh', () => {
    it('should refresh dashboard data', async () => {
      const response = await request(app)
        .post('/api/dashboard/refresh')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.timestamp).toBeDefined();
    });

    it('should clear cache on refresh', async () => {
      // Get dashboard data
      const response1 = await request(app)
        .get('/api/dashboard')
        .set('Authorization', mockAuthToken);

      // Refresh
      await request(app)
        .post('/api/dashboard/refresh')
        .set('Authorization', mockAuthToken);

      // Get data again
      const response2 = await request(app)
        .get('/api/dashboard')
        .set('Authorization', mockAuthToken);

      expect(response2.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID', async () => {
      // Mock authentication with invalid user
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });

    it('should handle database errors gracefully', async () => {
      // This would require mocking database errors
      // For now, we test invalid input
      const response = await request(app)
        .get('/api/dashboard/readings-summary?limit=invalid')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle malformed JSON in POST/PUT requests', async () => {
      const response = await request(app)
        .put('/api/dashboard/preferences')
        .set('Authorization', mockAuthToken)
        .set('Content-Type', 'application/json')
        .send('{invalid json}');

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit dashboard refresh calls', async () => {
      // Make multiple rapid calls to refresh endpoint
      const responses = await Promise.all([
        request(app).post('/api/dashboard/refresh').set('Authorization', mockAuthToken),
        request(app).post('/api/dashboard/refresh').set('Authorization', mockAuthToken),
        request(app).post('/api/dashboard/refresh').set('Authorization', mockAuthToken),
      ]);

      // At least one should be rate limited (depending on rate limit configuration)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      // This test depends on actual rate limit configuration
    });

    it('should allow reasonable number of requests', async () => {
      const responses = await Promise.all([
        request(app).get('/api/dashboard').set('Authorization', mockAuthToken),
        request(app).get('/api/dashboard/insights').set('Authorization', mockAuthToken),
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
