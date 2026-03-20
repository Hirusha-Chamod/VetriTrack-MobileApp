import { create } from "zustand";
import { settingsApi, SystemSettings } from "../services/settingsService";

interface SettingsState {
  settings: SystemSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<SystemSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await settingsApi.getSettings();
      set({ settings: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch settings",
        isLoading: false,
      });
    }
  },

  updateSettings: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await settingsApi.updateSettings(data);
      set({ settings: updated, isSaving: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to update settings",
        isSaving: false,
      });
      throw error; // Re-throw so the UI can show a toast
    }
  },
}));
