import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  isOnboarding: boolean;
  currentOnboardingStep: number;
  showLoading: boolean;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
}

const initialState: UIState = {
  theme: 'dark',
  isOnboarding: false,
  currentOnboardingStep: 0,
  showLoading: false,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setOnboarding: (state, action: PayloadAction<boolean>) => {
      state.isOnboarding = action.payload;
    },
    setOnboardingStep: (state, action: PayloadAction<number>) => {
      state.currentOnboardingStep = action.payload;
    },
    nextOnboardingStep: (state) => {
      state.currentOnboardingStep += 1;
    },
    previousOnboardingStep: (state) => {
      if (state.currentOnboardingStep > 0) {
        state.currentOnboardingStep -= 1;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.showLoading = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toast.visible = true;
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type;
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },
  },
});

export const {
  setTheme,
  setOnboarding,
  setOnboardingStep,
  nextOnboardingStep,
  previousOnboardingStep,
  setLoading,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
