import { create } from "zustand";
import {
    approvalApi,
    ApprovalRequest,
    CreateRequestPayload,
} from "../services/approvalService";
import { useAuthStore } from "./useAuthStore";

interface ApprovalState {
  pendingRequests: ApprovalRequest[];
  myRequests: ApprovalRequest[];
  isLoading: boolean;
  error: string | null;

  fetchPendingRequests: () => Promise<void>;
  fetchMyRequests: () => Promise<void>;
  createRequest: (data: CreateRequestPayload) => Promise<void>;
  updateRequestStatus: (
    id: string,
    status: "approved" | "rejected",
    finalQuantity?: number,
    finalSupplierId?: string,
  ) => Promise<void>;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  pendingRequests: [],
  myRequests: [],
  isLoading: false,
  error: null,

  fetchPendingRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await approvalApi.getPendingRequests();
      set({ pendingRequests: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch pending requests",
        isLoading: false,
      });
    }
  },

  fetchMyRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await approvalApi.getMyRequests();
      set({ myRequests: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch your requests",
        isLoading: false,
      });
    }
  },

  createRequest: async (data: CreateRequestPayload) => {
    set({ isLoading: true, error: null });
    try {
      await approvalApi.createRequest(data);
      // Refresh the staff member's request list so they see it instantly
      await get().fetchMyRequests();
    } catch (error: any) {
      set({
        error: error.message || "Failed to submit request",
        isLoading: false,
      });
      throw error;
    }
  },

  updateRequestStatus: async (
    id: string,
    status: "approved" | "rejected",
    finalQuantity?: number,
    finalSupplierId?: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      // 👇 Pass them into the API call!
      await approvalApi.updateStatus(
        id,
        status,
        finalQuantity,
        finalSupplierId,
      );

      const { user } = useAuthStore.getState();
      if (user?.role === "owner") {
        await get().fetchPendingRequests();
      } else {
        await get().fetchMyRequests();
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || `Failed to ${status} request`,
        isLoading: false,
      });
      throw error;
    }
  },
}));
