import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';
import { User, UserProfile } from '../types';

export const saveAuthData = async (accessToken: string, user: User, profile?: UserProfile) => {
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  if (profile) {
    await AsyncStorage.setItem('profile', JSON.stringify(profile));
  }
};

export const getAuthData = async () => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const userJson = await AsyncStorage.getItem('user');
  const profileJson = await AsyncStorage.getItem('profile');

  return {
    accessToken,
    user: userJson ? JSON.parse(userJson) : null,
    profile: profileJson ? JSON.parse(profileJson) : null,
  };
};

export const clearAuthData = async () => {
  await AsyncStorage.multiRemove(['accessToken', 'user', 'profile']);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('accessToken');
  return !!token;
};

export const checkAuthStatus = async () => {
  try {
    const { accessToken } = await getAuthData();
    if (!accessToken) {
      return false;
    }

    const response = await apiService.getProfile();
    return response.data.success;
  } catch (error) {
    await clearAuthData();
    return false;
  }
};
