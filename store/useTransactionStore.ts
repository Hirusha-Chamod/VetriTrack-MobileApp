import {
    CreateTransactionPayload,
    Transaction,
    transactionApi,
} from "@/services/transactionService";
import { create } from "zustand";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  submitTransaction: (data: CreateTransactionPayload) => Promise<void>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionApi.getAllTransactions();
      set({ transactions, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch transactions",
        isLoading: false,
      });
    }
  },

  submitTransaction: async (data: CreateTransactionPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionApi.createTransaction(data);

      // Add the new transaction to the top of the list (since backend sorts desc)
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Transaction failed",
        isLoading: false,
      });
      throw error; // Re-throw so the UI can catch it and show a toast/alert
    }
  },

  clearError: () => set({ error: null }),
}));
