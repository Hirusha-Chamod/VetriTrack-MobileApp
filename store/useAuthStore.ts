import { create } from 'zustand';

interface User {
  id: string; // <-- Add this
  username: string;
  role: 'owner' | 'staff';
  token: string;
}

interface AuthState {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
}));