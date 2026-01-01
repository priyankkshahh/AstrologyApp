import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, Preferences } from '../../types';

interface UserState {
  profile: UserProfile | null;
  preferences: Preferences | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  preferences: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    setPreferences: (state, action: PayloadAction<Preferences>) => {
      state.preferences = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<Preferences>>) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUser: (state) => {
      state.profile = null;
      state.preferences = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setProfile,
  setPreferences,
  updateUserProfile,
  updateUserPreferences,
  setLoading,
  setError,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
