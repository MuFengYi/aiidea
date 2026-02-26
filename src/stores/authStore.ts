import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  language: string;
  timezone: string;
  currency: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  language?: string;
}

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api/v1';
axios.defaults.baseURL = API_BASE_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('Login request starting for:', email);
          const response = await axios.post('/auth/login', { email, password });
          const { user, tokens } = response.data;

          console.log('Login successful, setting tokens:', {
            accessToken: tokens.accessToken.substring(0, 20) + '...',
            user: user.email
          });

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false
          });

          // Set axios default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
          console.log('Authorization header set:', axios.defaults.headers.common['Authorization']?.substring(0, 30) + '...');

          toast.success('Login successful!');
        } catch (error: any) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/auth/register', data);
          const { user, tokens } = response.data;

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false
          });

          axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });

        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('accessToken'); // Remove AuthManager token too
        localStorage.removeItem('refreshToken'); // Remove AuthManager token too
        localStorage.removeItem('user'); // Remove AuthManager user too
        toast.success('Logged out successfully');
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({
          token: accessToken,
          refreshToken: refreshToken,
          isAuthenticated: true
        });
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Also set tokens in localStorage for compatibility
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await axios.post('/auth/refresh', {
            refreshToken
          });

          const { tokens } = response.data;

          set({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken
          });

          axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrating auth storage:', state);
        if (state?.token) {
          console.log('Setting authorization header:', `Bearer ${state.token}`);
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          // Also sync with localStorage for compatibility
          localStorage.setItem('accessToken', state.token);
          if (state.refreshToken) {
            localStorage.setItem('refreshToken', state.refreshToken);
          }
          if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
          }
        } else {
          console.log('No token found during rehydration');
        }
      }
    }
  )
);

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await useAuthStore.getState().refreshAccessToken();

      if (refreshed) {
        return axios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);