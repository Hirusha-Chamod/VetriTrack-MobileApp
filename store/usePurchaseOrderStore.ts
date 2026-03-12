import {
    AddPoItemPayload,
    CreatePoPayload,
    PurchaseOrder,
    purchaseOrderApi,
} from "@/services/purchaseOrderService";
import { create } from "zustand";

interface PurchaseOrderState {
  purchaseOrders: PurchaseOrder[];
  drafts: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;

  fetchPurchaseOrders: (status?: string) => Promise<void>;
  fetchDrafts: () => Promise<void>;
  createDraft: (data: CreatePoPayload) => Promise<PurchaseOrder>;
  addItemToDraft: (poId: string, data: AddPoItemPayload) => Promise<void>;
  updatePoStatus: (poId: string, status: string) => Promise<void>;
  receivePoItems: (
    poId: string,
    itemId: string,
    quantity: number,
  ) => Promise<void>;
  clearError: () => void;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>((set, get) => ({
  purchaseOrders: [],
  drafts: [],
  isLoading: false,
  error: null,

  // Fetches main PO list (Sent, Partial, Received)
  fetchPurchaseOrders: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const pos = await purchaseOrderApi.getAll(status);
      set({ purchaseOrders: pos, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch purchase orders",
        isLoading: false,
      });
    }
  },

  // Fetches specifically the Drafts
  fetchDrafts: async () => {
    set({ isLoading: true, error: null });
    try {
      const drafts = await purchaseOrderApi.getDrafts();
      set({ drafts, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch draft POs",
        isLoading: false,
      });
    }
  },

  createDraft: async (data: CreatePoPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newDraft = await purchaseOrderApi.createDraft(data);
      set((state) => ({
        drafts: [newDraft, ...state.drafts],
        isLoading: false,
      }));
      return newDraft; // Return so the UI can navigate to the new draft's detail page
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create Draft PO",
        isLoading: false,
      });
      throw error;
    }
  },

  addItemToDraft: async (poId: string, data: AddPoItemPayload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDraft = await purchaseOrderApi.addItemToDraft(poId, data);

      // Update the specific draft in our drafts array
      set((state) => ({
        drafts: state.drafts.map((draft) =>
          draft._id === poId ? updatedDraft : draft,
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to add item to PO",
        isLoading: false,
      });
      throw error;
    }
  },

  updatePoStatus: async (poId: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPo = await purchaseOrderApi.updateStatus(poId, status);

      // Update both lists just in case a Draft was marked as 'Sent'
      set((state) => ({
        drafts: state.drafts.filter((draft) => draft._id !== poId), // Remove from drafts if sent
        purchaseOrders: [
          updatedPo,
          ...state.purchaseOrders.filter((po) => po._id !== poId),
        ], // Add/Update in main list
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update PO status",
        isLoading: false,
      });
      throw error;
    }
  },

  receivePoItems: async (poId: string, itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPo = await purchaseOrderApi.receiveItems(
        poId,
        itemId,
        quantity,
      );

      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) =>
          po._id === poId ? updatedPo : po,
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to receive items",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
