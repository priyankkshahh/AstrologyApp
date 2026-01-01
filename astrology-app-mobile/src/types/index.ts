export interface User {
  id: string;
  email: string;
  phone?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth?: string;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  gender?: string;
  timezone?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Preferences {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  daily_horoscope: boolean;
  theme: 'light' | 'dark';
  language: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface OAuthData {
  provider: 'google' | 'apple';
  token: string;
  email: string;
  name?: string;
  provider_id: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BirthDetails {
  date_of_birth: Date;
  birth_time: string;
  birth_city: string;
  birth_country: string;
  birth_latitude: number;
  birth_longitude: number;
  timezone: string;
}

export interface PalmPhoto {
  id: string;
  user_id: string;
  hand_side: 'left' | 'right';
  firebase_url: string;
  upload_date: string;
  is_processed: boolean;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  PersonalInfo: undefined;
  BirthDetails: undefined;
  Location: undefined;
  Verification: undefined;
  Home: undefined;
};
