import {
    CreateItemPayload,
    ExpiryReport,
    inventoryApi,
    InventoryItem,
    LowStockAlert
} from '@/services/inventoryService';
import { create } from 'zustand';

interface InventoryState {
  items: InventoryItem[];
  lowStockAlerts: LowStockAlert[];
  expiryReport: ExpiryReport | null;
  isLoading: boolean;
  error: string | null;
  
  fetchItems: () => Promise<void>;
  fetchLowStockAlerts: () => Promise<void>;
  fetchExpiryReport: () => Promise<void>;
  createItem: (data: CreateItemPayload) => Promise<void>;
  updateReorderLevel: (itemId: string, minLevel: number) => Promise<void>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  lowStockAlerts: [],
  expiryReport: null,
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await inventoryApi.getAllItems();
      set({ items, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch inventory items', isLoading: false });
    }
  },

  fetchLowStockAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await inventoryApi.getLowStockAlerts();
      set({ lowStockAlerts: alerts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch low stock alerts', isLoading: false });
    }
  },

  fetchExpiryReport: async () => {
    set({ isLoading: true, error: null });
    try {
      const report = await inventoryApi.getExpiryReport();
      set({ expiryReport: report, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch expiry report', isLoading: false });
    }
  },

  createItem: async (data: CreateItemPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await inventoryApi.createItem(data);
      set((state) => ({ 
        items: [...state.items, newItem],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create item', isLoading: false });
      throw error;
    }
  },

  updateReorderLevel: async (itemId: string, minLevel: number) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await inventoryApi.updateReorderLevel(itemId, minLevel);
      set((state) => ({
        items: state.items.map(item => item._id === itemId ? updatedItem : item),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update reorder level', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));