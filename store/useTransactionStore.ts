import {
    CreateTransactionPayload,
    Transaction,
    transactionApi,
} from "@/services/transactionService";
import { create } from "zustand";
import { useInventoryStore } from "./useInventoryStore"; // To refresh inventory after a transaction

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  processTransaction: (data: CreateTransactionPayload) => Promise<Transaction>;
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

      // Add it to our local state log
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));

      // CRITICAL: Force the Inventory store to refresh so the UI immediately shows the new stock levels!
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

  clearError: () => set({ error: null }),
}));
