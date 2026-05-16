import axios from 'axios';
import { storage } from '../utils/storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Resolve API base URL for different environments (web / emulator / device)
const getBaseUrl = () => {
  const explicitUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    (Constants as any).manifest?.extra?.apiUrl;

  // If an explicit env var is set, prefer it
  if (explicitUrl) return explicitUrl;

  // Web: use window location
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5001/api`;
  }

  // Expo: try to derive host from manifest/debuggerHost (works for emulator)
  const manifest: any = Constants.manifest || (Constants as any).expoConfig;
  const debuggerHost = manifest?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(':').shift();
    return `http://${host}:5001/api`;
  }

  // Fallback to localhost (use machine IP on physical device)
  return 'http://localhost:5001/api';
};

const BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add access token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;

          await storage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh token expired or invalid - logout user
        await storage.deleteItem('accessToken');
        await storage.deleteItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: (data: any) => apiClient.post('/auth/register', data),
  verifyOTP: (data: any) => apiClient.post('/auth/verify-otp', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  googleSignIn: (idToken: string) => apiClient.post('/auth/google', { idToken }),

  // Wallpapers
  getWallpapers: () => apiClient.get('/wallpapers'),
  getWallpaperById: (id: string) => apiClient.get(`/wallpapers/${id}`),

  // AI
  generateWallpaper: (prompt: string, style?: string, size?: string) =>
    apiClient.post('/ai/generate', { prompt, style, size }, { timeout: 120000 }),

  // Favorites
  getFavorites: (userId: number) => apiClient.get(`/favorites/${userId}`),
  addFavorite: (wallpaperId: number) => apiClient.post('/favorites', { wallpaperId }),
  removeFavorite: (favoriteId: number) => apiClient.delete(`/favorites/${favoriteId}`),

  // History
  getHistory: (params?: { page?: number; limit?: number; search?: string; style?: string }) => 
    apiClient.get('/history', { params }),
  addHistory: (data: { prompt: string; style: string; resolution: string; imageUrl: string }) => 
    apiClient.post('/history', data),
  deleteHistoryItem: (id: number) => apiClient.delete(`/history/${id}`),
  clearAllHistory: () => apiClient.delete('/history'),

  // Feed
  getFeed: (params?: { page?: number; limit?: number; search?: string; category?: string; style?: string }) => 
    apiClient.get('/feed', { params }),
  getTrending: () => apiClient.get('/feed/trending'),
  toggleLike: (id: number) => apiClient.post(`/feed/${id}/like`),
  getFeedDetails: (id: number) => apiClient.get(`/feed/${id}`),

  // User
  getUserProfile: () => apiClient.get('/user/profile'),
  updateUserProfile: (data: any) => apiClient.put('/user/profile', data),
  uploadPhoto: (formData: any) => apiClient.post('/user/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default apiClient;
