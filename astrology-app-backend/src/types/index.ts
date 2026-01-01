import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  phone?: string;
  password_hash?: string;
  google_id?: string;
  apple_id?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  email_verified: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: Date;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  gender?: string;
  timezone?: string;
  profile_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'premium' | 'ultimate';
  status: 'active' | 'inactive' | 'cancelled';
  start_date: Date;
  end_date?: Date;
  auto_renewal: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PalmPhoto {
  id: string;
  user_id: string;
  hand_side: 'left' | 'right';
  firebase_url?: string;
  upload_date: Date;
  is_processed: boolean;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
}

export interface Preference {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  daily_horoscope: boolean;
  theme: string;
  language: string;
  created_at: Date;
  updated_at: Date;
}

export interface Reading {
  _id: string;
  user_id: string;
  type: 'astrology' | 'numerology' | 'tarot' | 'palmistry';
  subtype: string;
  data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Report {
  _id: string;
  user_id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'life_path';
  content: Record<string, any>;
  generated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
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

export interface ProfileUpdateData {
  full_name?: string;
  date_of_birth?: Date;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  gender?: string;
  timezone?: string;
}

export interface PreferencesUpdateData {
  notifications_enabled?: boolean;
  daily_horoscope?: boolean;
  theme?: string;
  language?: string;
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

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
