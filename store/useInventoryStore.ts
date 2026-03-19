import {
  CreateItemPayload,
  ExpiryReport,
  ForecastRecommendation,
  inventoryApi,
  InventoryItem,
  LowStockAlert,
} from "@/services/inventoryService";
import { create } from "zustand";

interface InventoryState {
  items: InventoryItem[];
  lowStockAlerts: LowStockAlert[];
  expiryReport: ExpiryReport | null;
  isLoading: boolean;
  error: string | null;
  recommendations: ForecastRecommendation[];
  fetchItems: (filters?: any) => Promise<void>;
  fetchLowStockAlerts: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchExpiryReport: () => Promise<void>;
  createItem: (data: CreateItemPayload) => Promise<void>;
  updateItem: (
    itemId: string,
    updates: Partial<InventoryItem>,
  ) => Promise<void>;
  updateReorderLevel: (itemId: string, minLevel: number) => Promise<void>;
  uploadInventory: (file: any) => Promise<void>;
  exportInventory: () => Promise<string>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  lowStockAlerts: [],
  expiryReport: null,
  recommendations: [],
  isLoading: false,
  error: null,

  fetchItems: async (filters?: any) => {
    set({ isLoading: true, error: null });
    try {
      const items = await inventoryApi.getAllItems(filters);
      set({ items, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch inventory items",
        isLoading: false,
      });
    }
  },

  fetchLowStockAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await inventoryApi.getLowStockAlerts();
      set({ lowStockAlerts: alerts, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch low stock alerts",
        isLoading: false,
      });
    }
  },

  fetchExpiryReport: async () => {
    set({ isLoading: true, error: null });
    try {
      const report = await inventoryApi.getExpiryReport();
      set({ expiryReport: report, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch expiry report",
        isLoading: false,
      });
    }
  },

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null });
    try {
      const recommendations = await inventoryApi.getRecommendations();
      set({ recommendations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch smart recommendations",
        isLoading: false,
      });
    }
  },

  createItem: async (data: CreateItemPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await inventoryApi.createItem(data);
      set((state) => ({
        items: [...state.items, newItem],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to create item",
        isLoading: false,
      });
      throw error;
    }
  },

  updateItem: async (itemId: string, updates: Partial<InventoryItem>) => {
    set({ isLoading: true, error: null });
    try {
      await inventoryApi.updateItem(itemId, updates);
      await get().fetchItems(); // Refresh the list
    } catch (error: any) {
      set({
        error: error.message || "Failed to update item",
        isLoading: false,
      });
      throw error;
    }
  },

  updateReorderLevel: async (itemId: string, minLevel: number) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await inventoryApi.updateReorderLevel(
        itemId,
        minLevel,
      );
      set((state) => ({
        items: state.items.map((item) =>
          item._id === itemId ? updatedItem : item,
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update reorder level",
        isLoading: false,
      });
      throw error;
    }
  },

  uploadInventory: async (file: any) => {
    set({ isLoading: true, error: null });
    try {
      await inventoryApi.uploadBulk(file);
      await get().fetchItems(); // Refresh the list after successful upload
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to upload inventory file",
        isLoading: false,
      });
      throw error;
    }
  },

  exportInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const base64Data = await inventoryApi.exportExcel();
      set({ isLoading: false });
      return base64Data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to export inventory",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
