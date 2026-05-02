import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { api } from '../services/api';

type User = {
  id: number;
  name: string;
  email: string;
} | null;

interface AuthContextData {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  registerInitiate: (email: string) => Promise<void>;
  verifyOTP: (name: string, email: string, pass: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    try {
      const accessToken = await storage.getItem('accessToken');
      const refreshToken = await storage.getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        const response = await api.refresh(refreshToken);
        const { user: userData, accessToken: newAccessToken } = response.data;
        
        await storage.setItem('accessToken', newAccessToken);
        setUser(userData);
      }
    } catch (error) {
      console.log('Failed to restore auth session');
      await storage.deleteItem('accessToken');
      await storage.deleteItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      const { user: userData, accessToken, refreshToken } = response.data;

      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const registerInitiate = async (email: string) => {
    try {
      await api.register({ email });
    } catch (error) {
      console.error('Registration initiate error:', error);
      throw error;
    }
  };

  const verifyOTP = async (name: string, email: string, pass: string, otp: string) => {
    try {
      const response = await api.verifyOTP({ name, email, password: pass, otp });
      const { user: userData, accessToken, refreshToken } = response.data;

      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      setUser(userData);
    } catch (error) {
      console.error('OTP Verification error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await storage.getItem('refreshToken');
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.deleteItem('accessToken');
      await storage.deleteItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, registerInitiate, verifyOTP, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
