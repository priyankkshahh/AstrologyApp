import '@testing-library/jest-native/extend-expect';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { configure } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock react-native modules
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock expo modules
jest.mock('expo-auth-session', () => ({
  ...jest.requireActual('expo-auth-session'),
  startAsync: jest.fn(),
  dismiss: jest.fn(),
}));

jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationButton: 'AppleAuthenticationButton',
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationButtonType: { SIGN_IN: 0, SIGN_UP: 1 },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({
      data: {
        idToken: 'mock_id_token',
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      },
    })),
    signOut: jest.fn(() => Promise.resolve()),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{ uri: 'mock-image-uri' }],
  })),
  MediaTypeOptions: {
    Images: 'images',
  },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
  })),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
  })),
}));

// Configure testing library
configure({ asyncUtilTimeout: 10000 });

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);
});

// Global cleanup
afterEach(() => {
  jest.restoreAllMocks();
});

// Mock Redux store for testing
export const mockStore = {
  getState: jest.fn(() => ({
    auth: {
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock_token',
    },
    readings: {
      history: [],
      loading: false,
      error: null,
    },
    dashboard: {
      data: null,
      loading: false,
      error: null,
    },
  })),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
};

// Mock navigation props
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
};

// Mock route props
export const mockRoute = {
  params: {},
  key: 'test',
  name: 'TestScreen',
};

// Test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export const createMockResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const createMockErrorResponse = (message: string, status: number = 500) => ({
  response: {
    data: { message },
    status,
    statusText: 'Error',
    headers: {},
    config: {},
  },
});
