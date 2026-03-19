import {
    CreateSupplierPayload,
    Supplier,
    supplierApi,
    UpdateSupplierPayload,
} from "@/services/supplierService";
import { create } from "zustand";

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;

  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: CreateSupplierPayload) => Promise<void>;
  updateSupplier: (id: string, data: UpdateSupplierPayload) => Promise<void>;
  updateSupplierStatus: (
    id: string,
    status: "Active" | "Inactive",
  ) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  uploadSuppliers: (file: any) => Promise<void>;
  exportSuppliers: () => Promise<string>;
  clearError: () => void;
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const suppliers = await supplierApi.getAll();
      set({ suppliers, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch suppliers",
        isLoading: false,
      });
    }
  },

  createSupplier: async (data: CreateSupplierPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newSupplier = await supplierApi.create(data);
      set((state) => ({
        // Add new supplier and sort alphabetically by name just like the backend does
        suppliers: [...state.suppliers, newSupplier].sort((a, b) =>
          a.supplierName.localeCompare(b.supplierName),
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create supplier",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSupplier: async (id: string, data: UpdateSupplierPayload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSupplier = await supplierApi.update(id, data);
      set((state) => ({
        suppliers: state.suppliers.map((sup) =>
          sup._id === id ? updatedSupplier : sup,
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update supplier",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSupplierStatus: async (id: string, status: "Active" | "Inactive") => {
    set({ isLoading: true, error: null });
    try {
      const updatedSupplier = await supplierApi.updateStatus(id, status);
      set((state) => ({
        suppliers: state.suppliers.map((sup) =>
          sup._id === id ? updatedSupplier : sup,
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update status",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSupplier: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await supplierApi.delete(id);
      set((state) => ({
        suppliers: state.suppliers.filter((sup) => sup._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete supplier",
        isLoading: false,
      });
      throw error;
    }
  },

  uploadSuppliers: async (file: any) => {
    set({ isLoading: true, error: null });
    try {
      await supplierApi.uploadBulk(file);
      // Re-fetch all suppliers to ensure we have the fully parsed database list
      await get().fetchSuppliers();
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to upload file",
        isLoading: false,
      });
      throw error;
    }
  },

  exportSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const base64Data = await supplierApi.exportExcel();
      set({ isLoading: false });
      return base64Data; // Return the string to the UI to save it
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to export suppliers",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
