import api from "./api";

export interface ApprovalRequest {
  _id: string;
  requestedBy: { _id: string; fullName: string } | string;
  itemId: { _id: string; itemName: string } | string;
  product: string;
  quantity: number;
  supplierId: { _id: string; supplierName: string } | string;
  unitPrice: number;
  totalAmount: number;
  urgency: "high" | "medium" | "low";
  reason: string;
  status: "pending" | "approved" | "rejected";
  source: "manual" | "low-stock" | "recommendation";
  createdAt: string;
}

export interface CreateRequestPayload {
  itemId: string;
  product: string;
  quantity: number;
  supplierId: string;
  unitPrice: number;
  urgency: "high" | "medium" | "low";
  source?: "manual" | "low-stock" | "recommendation";
  reason: string;
}

export const approvalApi = {
  createRequest: async (
    data: CreateRequestPayload,
  ): Promise<ApprovalRequest> => {
    const response = await api.post<ApprovalRequest>("/approvals", data);
    return response.data;
  },

  getPendingRequests: async (): Promise<ApprovalRequest[]> => {
    const response = await api.get<ApprovalRequest[]>("/approvals/pending");
    return response.data;
  },

  getMyRequests: async (): Promise<ApprovalRequest[]> => {
    const response = await api.get<ApprovalRequest[]>("/approvals/my-requests");
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: "approved" | "rejected",
    finalQuantity?: number, 
    finalSupplierId?: string, 
  ): Promise<ApprovalRequest> => {
    const response = await api.patch<ApprovalRequest>(
      `/approvals/${id}/status`,
      { status, finalQuantity, finalSupplierId }, 
    );
    return response.data;
  },
};
