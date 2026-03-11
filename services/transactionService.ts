import api from "./api";
import { InventoryItem } from "./inventoryService"; // Reusing your existing interface

export type TransactionType = "RECEIVE" | "ISSUE" | "ADJUSTMENT";

export interface Transaction {
  _id: string;
  itemId: string | InventoryItem; // Can be a string ID or populated object
  batchId?: string;
  type: TransactionType;
  quantity: number;
  reason: string;
  performedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  itemId: string;
  batchId?: string; // Optional for 'ISSUE' (triggers FEFO on backend)
  type: TransactionType;
  quantity: number;
  reason: string;
}

export const transactionApi = {
  // Handles Receive, Issue (FEFO), and Adjustments
  createTransaction: async (
    data: CreateTransactionPayload,
  ): Promise<Transaction> => {
    const response = await api.post<Transaction>("/transactions", data);
    return response.data;
  },

  // Retrieves transaction history (Owner only based on your backend)
  getAllTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>("/transactions");
    return response.data;
  },
};
