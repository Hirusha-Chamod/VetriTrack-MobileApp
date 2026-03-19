import { authApi } from '@/services/authService';
import { create } from 'zustand';

interface User {
  id: string; 
  username: string;
  role: 'owner' | 'staff';
  token: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;       
  error: string | null;     
  
  login: (userData: User) => void;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  clearError: () => void;   
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,         
  error: null,              
  
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
  clearError: () => set({ error: null }),

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.forgotPassword(email);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || "Failed to send OTP",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.verifyOtp(email, otp);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || "Invalid or expired OTP",
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.resetPassword(email, otp, newPassword);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || "Failed to reset password",
        isLoading: false,
      });
      throw error;
    }
  },
}));