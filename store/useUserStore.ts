import { create } from "zustand";
import {
    authApi,
    CreateUserPayload,
    UpdateUserPayload,
    UserProfile,
} from "../services/authService";

interface UserState {
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserPayload) => Promise<void>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.getAllUsers();
      set({ users: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch users",
        isLoading: false,
      });
    }
  },

  createUser: async (data: CreateUserPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.createUser(data);
      // Refresh the list after successfully creating a user
      await get().fetchUsers();
    } catch (error: any) {
      set({
        error: error.message || "Failed to create user",
        isLoading: false,
      });
      throw error; // Re-throw so the UI component can catch it and show a Toast
    }
  },

  updateUser: async (id: string, data: UpdateUserPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.updateUser(id, data);
      await get().fetchUsers();
    } catch (error: any) {
      set({
        error: error.message || "Failed to update user",
        isLoading: false,
      });
      throw error;
    }
  },

  deactivateUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.deactivateUser(id);
      await get().fetchUsers();
    } catch (error: any) {
      set({
        error: error.message || "Failed to deactivate user",
        isLoading: false,
      });
      throw error;
    }
  },
}));
