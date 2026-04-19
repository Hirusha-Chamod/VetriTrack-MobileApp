import {
  CreateTransactionPayload,
  Transaction,
  transactionApi,
} from "@/services/transactionService";
import { create } from "zustand";
import { useInventoryStore } from "./useInventoryStore";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  processTransaction: (data: CreateTransactionPayload) => Promise<Transaction>;
  importTransactions: (
    formData: FormData,
  ) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionApi.getAll();
      set({ transactions, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to fetch transaction history",
        isLoading: false,
      });
    }
  },

  processTransaction: async (data: CreateTransactionPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionApi.create(data);

      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));

      useInventoryStore.getState().fetchItems();

      return newTransaction;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Transaction failed",
        isLoading: false,
      });
      throw error;
    }
  },

  importTransactions: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionApi.importTransactions(formData);

      await get().fetchTransactions();
      useInventoryStore.getState().fetchItems();

      set({ isLoading: false });
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to import transactions";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));
