import { create } from "zustand";
import { analyticsApi, DashboardData } from "../services/analyticsService";

interface AnalyticsState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsApi.getDashboardMetrics();
      set({ data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch analytics data",
        isLoading: false,
      });
    }
  },
}));
