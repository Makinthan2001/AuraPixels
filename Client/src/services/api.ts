import axios from 'axios';
import { storage } from '../utils/storage';
import Constants from 'expo-constants';

// For physical devices, you should replace 'localhost' with your machine's IP address.
// Example: 'http://192.168.1.100:5000/api'
const BASE_URL = 'http://localhost:5001/api';

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
      } catch (refreshError) {
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

  // Wallpapers
  getWallpapers: () => apiClient.get('/wallpapers'),
  getWallpaperById: (id: string) => apiClient.get(`/wallpapers/${id}`),

  // AI
  generateWallpaper: (prompt: string) => apiClient.post('/ai/generate', { prompt }),

  // Favorites
  getFavorites: (userId: number) => apiClient.get(`/favorites/${userId}`),
  addFavorite: (wallpaperId: number) => apiClient.post('/favorites', { wallpaperId }),
  removeFavorite: (favoriteId: number) => apiClient.delete(`/favorites/${favoriteId}`),

  // History
  getHistory: (userId: number) => apiClient.get(`/history/${userId}`),
};

export default apiClient;
