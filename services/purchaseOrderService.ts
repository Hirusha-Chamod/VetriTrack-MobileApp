import api from "./api";
import { InventoryItem } from "./inventoryService";
import { Supplier } from "./supplierService";

export interface POItem {
  itemId: string | InventoryItem;
  quantityRequested: number;
  quantityReceived: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplierId: string | Supplier;
  items: POItem[];
  status: "Draft" | "Sent" | "Partial" | "Received" | "Cancelled";
  totalValue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string; // 👈 NEW: Track when it was sent
  lastReminderSentAt?: string; // 👈 NEW: Track when the last reminder went out
}

export interface CreatePoPayload {
  supplierId: string;
  notes?: string;
}

export interface AddPoItemPayload {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export const purchaseOrderApi = {
  createDraft: async (data: CreatePoPayload): Promise<PurchaseOrder> => {
    const response = await api.post<PurchaseOrder>(
      "/purchase-orders/draft",
      data,
    );
    return response.data;
  },

  addItemToDraft: async (
    poId: string,
    data: AddPoItemPayload,
  ): Promise<PurchaseOrder> => {
    const response = await api.patch<PurchaseOrder>(
      `/purchase-orders/draft/${poId}/add-item`,
      data,
    );
    return response.data;
  },

  getDrafts: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get<PurchaseOrder[]>("/purchase-orders/drafts");
    return response.data;
  },

  getAll: async (status?: string): Promise<PurchaseOrder[]> => {
    const url = status
      ? `/purchase-orders?status=${status}`
      : "/purchase-orders";
    const response = await api.get<PurchaseOrder[]>(url);
    return response.data;
  },

  updateStatus: async (
    poId: string,
    status: string,
  ): Promise<PurchaseOrder> => {
    const response = await api.patch<PurchaseOrder>(
      `/purchase-orders/${poId}/status`,
      { status },
    );
    return response.data;
  },

  receiveItems: async (
    poId: string,
    itemId: string,
    quantity: number,
  ): Promise<PurchaseOrder> => {
    const response = await api.patch<PurchaseOrder>(
      `/purchase-orders/${poId}/receive`,
      { itemId, quantity },
    );
    return response.data;
  },

 
  sendReminder: async (poId: string): Promise<PurchaseOrder> => {
    const response = await api.post<PurchaseOrder>(
      `/purchase-orders/${poId}/remind`,
    );
    return response.data;
  },
};
