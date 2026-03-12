import api from "./api";

export interface Transaction {
  _id: string;
  itemId: any; // Populated InventoryItem object when fetched
  batchId?: string; // Optional depending on the transaction type
  type: "RECEIVE" | "ISSUE" | "ADJUSTMENT";
  quantity: number;
  reason: string;
  performedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  itemId: string;
  batchId?: string;
  batchLotNumber?: string;
  expiryDate?: string;
  supplierId?: string; 
  type: 'RECEIVE' | 'ISSUE' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
}
export const transactionApi = {
  // Fetch transaction history (useful for an audit log screen later)
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>("/transactions");
    return response.data;
  },

  // The main engine: Creates a transaction and updates stock levels in the backend
  create: async (data: CreateTransactionPayload): Promise<Transaction> => {
    const response = await api.post<Transaction>("/transactions", data);
    return response.data;
  },
};
