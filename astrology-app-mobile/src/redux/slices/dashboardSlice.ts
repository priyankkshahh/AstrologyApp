import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardData, DashboardPreferences, ReadingsSummary, CrossModuleInsight, QuickCard } from '../../types';
import api from '../../services/api';

interface DashboardState {
  data: DashboardData | null;
  insights: CrossModuleInsight[];
  readingsSummary: ReadingsSummary | null;
  quickCards: QuickCard[];
  preferences: DashboardPreferences | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: DashboardState = {
  data: null,
  insights: [],
  readingsSummary: null,
  quickCards: [],
  preferences: null,
  loading: false,
  error: null,
  lastFetch: null,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard');
      return response.data.data as DashboardData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard');
    }
  }
);

export const fetchDashboardInsights = createAsyncThunk(
  'dashboard/fetchInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/insights');
      return response.data.data.insights as CrossModuleInsight[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch insights');
    }
  }
);

export const fetchReadingsSummary = createAsyncThunk(
  'dashboard/fetchReadingsSummary',
  async (params?: { limit?: number; module?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.module) queryParams.append('module', params.module);
      
      const response = await api.get(`/dashboard/readings-summary?${queryParams.toString()}`);
      return response.data.data as ReadingsSummary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch readings summary');
    }
  }
);

export const fetchQuickCards = createAsyncThunk(
  'dashboard/fetchQuickCards',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/quick-cards?limit=${limit}`);
      return response.data.data.quick_cards as QuickCard[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch quick cards');
    }
  }
);

export const fetchDashboardPreferences = createAsyncThunk(
  'dashboard/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/preferences');
      return response.data.data as DashboardPreferences;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch preferences');
    }
  }
);

export const updateDashboardPreferences = createAsyncThunk(
  'dashboard/updatePreferences',
  async (preferences: Partial<DashboardPreferences>, { rejectWithValue }) => {
    try {
      const response = await api.put('/dashboard/preferences', preferences);
      return response.data.data as DashboardPreferences;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update preferences');
    }
  }
);

export const refreshDashboard = createAsyncThunk(
  'dashboard/refreshDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/dashboard/refresh');
      return response.data.data as DashboardData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to refresh dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.data = null;
      state.insights = [];
      state.readingsSummary = null;
      state.quickCards = [];
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.insights = action.payload.crossModuleInsights;
        state.preferences = action.payload.preferences;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Insights
      .addCase(fetchDashboardInsights.fulfilled, (state, action) => {
        state.insights = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardInsights.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch Readings Summary
      .addCase(fetchReadingsSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReadingsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.readingsSummary = action.payload;
        state.error = null;
      })
      .addCase(fetchReadingsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Quick Cards
      .addCase(fetchQuickCards.fulfilled, (state, action) => {
        state.quickCards = action.payload;
        state.error = null;
      })
      .addCase(fetchQuickCards.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch Preferences
      .addCase(fetchDashboardPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardPreferences.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update Preferences
      .addCase(updateDashboardPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDashboardPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        if (state.data) {
          state.data.preferences = action.payload;
        }
        state.error = null;
      })
      .addCase(updateDashboardPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh Dashboard
      .addCase(refreshDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.insights = action.payload.crossModuleInsights;
        state.preferences = action.payload.preferences;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;
