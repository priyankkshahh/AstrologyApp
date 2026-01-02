import configureMockStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { fetchDashboardData, fetchInsights, updatePreferences, refreshDashboard } from '../../../redux/slices/dashboardSlice';
import * as api from '../../../services/api';

// Mock the API module
jest.mock('../../../services/api');

const middlewares = [thunk];
const mockStore = configureMockStore<
  any,
  ThunkDispatch<any, any, AnyAction>
>(middlewares);

describe('Dashboard Redux Slice', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({
      dashboard: {
        data: null,
        loading: false,
        error: null,
      },
    });
    jest.clearAllMocks();
  });

  describe('fetchDashboardData', () => {
    it('should start loading and fetch dashboard data', async () => {
      const mockDashboardData = {
        astrology: { dailyHoroscope: 'Test prediction' },
        numerology: { lifePathNumber: 5 },
        tarot: { dailyCard: 'The Fool' },
        palmistry: { lastReading: {} },
        insights: [],
        preferences: {
          enabledModules: ['astrology', 'numerology', 'tarot', 'palmistry'],
          widgetOrder: [1, 2, 3, 4],
          displaySettings: {},
        },
      };

      (api.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

      await store.dispatch(fetchDashboardData());

      const actions = store.getActions();

      expect(actions[0].type).toBe('dashboard/fetchDashboard/pending');
      expect(actions[1].type).toBe('dashboard/fetchDashboard/fulfilled');
      expect(actions[1].payload).toEqual(mockDashboardData);
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch dashboard data');
      (api.getDashboardData as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(fetchDashboardData());

      const actions = store.getActions();

      expect(actions[0].type).toBe('dashboard/fetchDashboard/pending');
      expect(actions[1].type).toBe('dashboard/fetchDashboard/rejected');
      expect(actions[1].error.message).toBe('Failed to fetch dashboard data');
    });

    it('should set loading to true before fetch', async () => {
      (api.getDashboardData as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({}), 100))
      );

      store.dispatch(fetchDashboardData());

      const state = store.getState();
      expect(state.dashboard.loading).toBe(true);
    });
  });

  describe('fetchInsights', () => {
    it('should fetch insights successfully', async () => {
      const mockInsights = [
        {
          id: '1',
          type: 'career',
          title: 'Career Opportunities',
          description: 'Great opportunities ahead',
          sources: ['astrology', 'numerology'],
        },
      ];

      (api.getDashboardInsights as jest.Mock).mockResolvedValue({
        insights: mockInsights,
      });

      await store.dispatch(fetchInsights());

      const actions = store.getActions();

      expect(actions[0].type).toBe('dashboard/fetchInsights/pending');
      expect(actions[1].type).toBe('dashboard/fetchInsights/fulfilled');
      expect(actions[1].payload).toEqual({ insights: mockInsights });
    });

    it('should handle insights fetch error', async () => {
      const mockError = new Error('Failed to fetch insights');
      (api.getDashboardInsights as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(fetchInsights());

      const actions = store.getActions();

      expect(actions[1].type).toBe('dashboard/fetchInsights/rejected');
      expect(actions[1].error.message).toBe('Failed to fetch insights');
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const mockPreferences = {
        enabledModules: ['astrology', 'tarot'],
        widgetOrder: [1, 3],
        displaySettings: { theme: 'dark' },
      };

      const mockUpdatedPreferences = {
        ...mockPreferences,
        updated_at: new Date().toISOString(),
      };

      (api.updateDashboardPreferences as jest.Mock).mockResolvedValue(
        mockUpdatedPreferences
      );

      await store.dispatch(updatePreferences(mockPreferences));

      const actions = store.getActions();

      expect(actions[0].type).toBe('dashboard/updatePreferences/pending');
      expect(actions[1].type).toBe('dashboard/updatePreferences/fulfilled');
      expect(actions[1].payload).toEqual(mockUpdatedPreferences);
    });

    it('should handle preferences update error', async () => {
      const mockError = new Error('Failed to update preferences');
      (api.updateDashboardPreferences as jest.Mock).mockRejectedValue(mockError);

      const preferences = {
        enabledModules: ['astrology'],
      };

      await store.dispatch(updatePreferences(preferences));

      const actions = store.getActions();

      expect(actions[1].type).toBe('dashboard/updatePreferences/rejected');
    });

    it('should validate preferences before sending', async () => {
      const invalidPreferences = {
        enabledModules: ['invalid_module'],
      };

      (api.updateDashboardPreferences as jest.Mock).mockRejectedValue(
        new Error('Invalid module')
      );

      await store.dispatch(updatePreferences(invalidPreferences));

      const actions = store.getActions();

      expect(actions[1].type).toBe('dashboard/updatePreferences/rejected');
    });
  });

  describe('refreshDashboard', () => {
    it('should refresh dashboard data', async () => {
      const mockRefreshResponse = {
        success: true,
        timestamp: new Date().toISOString(),
      };

      (api.refreshDashboard as jest.Mock).mockResolvedValue(mockRefreshResponse);

      await store.dispatch(refreshDashboard());

      const actions = store.getActions();

      expect(actions[0].type).toBe('dashboard/refresh/pending');
      expect(actions[1].type).toBe('dashboard/refresh/fulfilled');
      expect(actions[1].payload).toEqual(mockRefreshResponse);
    });

    it('should handle refresh error', async () => {
      const mockError = new Error('Failed to refresh dashboard');
      (api.refreshDashboard as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(refreshDashboard());

      const actions = store.getActions();

      expect(actions[1].type).toBe('dashboard/refresh/rejected');
    });
  });

  describe('State Management', () => {
    it('should maintain loading state correctly', async () => {
      const mockDashboardData = {
        astrology: {},
        numerology: {},
        tarot: {},
        palmistry: {},
        insights: [],
        preferences: {},
      };

      (api.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

      // Start fetch
      const promise = store.dispatch(fetchDashboardData());

      // Check loading state during fetch
      let state = store.getState();
      expect(state.dashboard.loading).toBe(true);

      await promise;

      // Check loading state after fetch
      state = store.getState();
      expect(state.dashboard.loading).toBe(false);
    });

    it('should store error on failed requests', async () => {
      const mockError = new Error('Network error');
      (api.getDashboardData as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(fetchDashboardData());

      const state = store.getState();
      expect(state.dashboard.error).toBe('Network error');
    });

    it('should clear error on successful request', async () => {
      // First request fails
      const mockError = new Error('Network error');
      (api.getDashboardData as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(fetchDashboardData());

      // Second request succeeds
      const mockDashboardData = {
        astrology: {},
        numerology: {},
        tarot: {},
        palmistry: {},
        insights: [],
        preferences: {},
      };
      (api.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

      await store.dispatch(fetchDashboardData());

      const state = store.getState();
      expect(state.dashboard.error).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should complete fetch within acceptable time', async () => {
      const mockDashboardData = {
        astrology: {},
        numerology: {},
        tarot: {},
        palmistry: {},
        insights: [],
        preferences: {},
      };

      (api.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

      const start = Date.now();
      await store.dispatch(fetchDashboardData());
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle concurrent requests', async () => {
      const mockDashboardData = {
        astrology: {},
        numerology: {},
        tarot: {},
        palmistry: {},
        insights: [],
        preferences: {},
      };

      (api.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

      await Promise.all([
        store.dispatch(fetchDashboardData()),
        store.dispatch(fetchDashboardData()),
        store.dispatch(fetchDashboardData()),
      ]);

      const state = store.getState();
      expect(state.dashboard.loading).toBe(false);
    });
  });
});
