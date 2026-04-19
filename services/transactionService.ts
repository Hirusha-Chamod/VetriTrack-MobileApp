import api from "./api";

export interface Transaction {
  _id: string;
  itemId: any;
  batchId?: string;
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
  type: "RECEIVE" | "ISSUE" | "ADJUSTMENT";
  quantity: number;
  reason: string;
}

export const transactionApi = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>("/transactions");
    return response.data;
  },

  create: async (data: CreateTransactionPayload): Promise<Transaction> => {
    const response = await api.post<Transaction>("/transactions", data);
    return response.data;
  },

  importTransactions: async (
    formData: FormData,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      "/transactions/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
