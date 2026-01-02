import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.api.post('/auth/refresh');
            const { accessToken } = response.data.data;

            await AsyncStorage.setItem('accessToken', accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return this.api(originalRequest);
          } catch (refreshError) {
            await AsyncStorage.multiRemove(['accessToken', 'user']);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async signup(data: { email: string; password: string; full_name: string; phone?: string }) {
    return this.api.post<ApiResponse>('/auth/signup', data);
  }

  async login(email: string, password: string) {
    return this.api.post<ApiResponse>('/auth/login', { email, password });
  }

  async googleAuth(data: any) {
    return this.api.post<ApiResponse>('/auth/google', data);
  }

  async appleAuth(data: any) {
    return this.api.post<ApiResponse>('/auth/apple', data);
  }

  async logout() {
    return this.api.post<ApiResponse>('/auth/logout');
  }

  async getProfile() {
    return this.api.get<ApiResponse>('/users/profile');
  }

  async updateProfile(data: any) {
    return this.api.put<ApiResponse>('/users/profile', data);
  }

  async completeOnboarding() {
    return this.api.post<ApiResponse>('/users/complete-onboarding');
  }

  async getPreferences() {
    return this.api.get<ApiResponse>('/profile/preferences');
  }

  async updatePreferences(data: any) {
    return this.api.put<ApiResponse>('/profile/preferences', data);
  }

  async uploadPalmPhoto(hand_side: 'left' | 'right', photoData: string) {
    return this.api.post<ApiResponse>('/readings/palm-photos/upload', {
      hand_side,
      photoData,
    });
  }

  async getPalmPhotos() {
    return this.api.get<ApiResponse>('/readings/palm-photos');
  }

  async deletePalmPhoto(id: string) {
    return this.api.delete<ApiResponse>(`/readings/palm-photos/${id}`);
  }

  async getPalmPhotoStatus(id: string) {
    return this.api.get<ApiResponse>(`/readings/palm-photos/${id}/status`);
  }

  async healthCheck() {
    return this.api.get<ApiResponse>('/health');
  }

  // Dashboard API methods
  async getDashboard() {
    return this.api.get<ApiResponse>('/dashboard');
  }

  async getDashboardInsights() {
    return this.api.get<ApiResponse>('/dashboard/insights');
  }

  async getReadingsSummary(params?: { limit?: number; module?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.module) queryParams.append('module', params.module);
    
    const queryString = queryParams.toString();
    return this.api.get<ApiResponse>(`/dashboard/readings-summary${queryString ? `?${queryString}` : ''}`);
  }

  async getQuickCards(limit: number = 5) {
    return this.api.get<ApiResponse>(`/dashboard/quick-cards?limit=${limit}`);
  }

  async getDashboardPreferences() {
    return this.api.get<ApiResponse>('/dashboard/preferences');
  }

  async updateDashboardPreferences(preferences: any) {
    return this.api.put<ApiResponse>('/dashboard/preferences', preferences);
  }

  async refreshDashboard() {
    return this.api.post<ApiResponse>('/dashboard/refresh');
  }
}

export default new ApiService();
