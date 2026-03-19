import api from "./api";

export interface InventoryItem {
  _id: string;
  itemCode: string;
  itemName: string;
  category: string;
  unitOfMeasure: string;
  minStockLevel: number;
  unitPrice: number;
  notes?: string;
  currentStock?: number;
  createdAt: string;
  updatedAt: string;
}
export interface StockBatch {
  _id: string;
  itemId: string | InventoryItem;
  batchCode: string;
  expiryDate: string;
  quantityOnHand: number;
  supplier: any;
  status?: "expired" | "warning" | "good";
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemPayload {
  itemCode: string;
  itemName: string;
  category: string;
  unitOfMeasure: string;
  minStockLevel: number;
  unitPrice: number;
  notes?: string;
}

export interface AddBatchPayload {
  itemId: string;
  batchCode: string;
  expiryDate: string;
  quantityOnHand: number;
  supplier: string;
}

export interface LowStockAlert {
  _id: string;
  itemCode: string;
  itemName: string;
  totalStock: number;
  minLevel: number;
  unitOfMeasure: string;
  isLow: boolean;
}

export interface ExpiryReportItem {
  itemCode: string;
  product: string;
  batchId: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  supplier: string;
  value: number;
  daysExpired?: number;
  daysUntilExpiry?: number;
}

export interface ForecastRecommendation {
  itemCode: string;
  itemName: string;
  category: string;
  unitOfMeasure: string;
  unitPrice: number;
  predictedDailyDemand: number;
  predicted7DayDemand: number;
  totalCurrentStock: number;
  minStockLevel: number;
  demandDuringLead: number;
  recommendedOrderQty: number;
  needsReorder: boolean;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  nearestExpiryBatch: string | null;
  nearestExpiryDate: string | null;
  isExpiringSoon: boolean;
}

export interface ExpiryReport {
  expiringSoon: ExpiryReportItem[];
  expired: ExpiryReportItem[];
}

export const inventoryApi = {
  createItem: async (data: CreateItemPayload): Promise<InventoryItem> => {
    const response = await api.post<InventoryItem>("/inventory/item", data);
    return response.data;
  },

  addBatch: async (data: AddBatchPayload): Promise<StockBatch> => {
    const response = await api.post<StockBatch>("/inventory/batch", data);
    return response.data;
  },

  getAllItems: async (filters?: any): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItem[]>("/inventory/items", {
      params: filters,
    });
    return response.data;
  },

  getExpiryReport: async (): Promise<ExpiryReport> => {
    const response = await api.get<ExpiryReport>("/inventory/expiry-report");
    return response.data;
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const response = await api.get<LowStockAlert[]>(
      "/inventory/alerts/low-stock",
    );
    return response.data;
  },

  updateReorderLevel: async (
    itemId: string,
    minLevel: number,
  ): Promise<InventoryItem> => {
    const response = await api.patch<InventoryItem>(
      `/inventory/reorder-level/${itemId}`,
      { minLevel },
    );
    return response.data;
  },

  suggestFefoBatch: async (itemId: string): Promise<StockBatch> => {
    const response = await api.get<StockBatch>(`/inventory/suggest/${itemId}`);
    return response.data;
  },

  getItemBatches: async (itemId: string): Promise<StockBatch[]> => {
    const response = await api.get<StockBatch[]>(
      `/inventory/batches/${itemId}`,
    );
    return response.data;
  },

  updateItem: async (
    itemId: string,
    updates: Partial<InventoryItem>,
  ): Promise<InventoryItem> => {
    const response = await api.patch<InventoryItem>(
      `/inventory/item/${itemId}`,
      updates,
    );
    return response.data;
  },

  getRecommendations: async (): Promise<ForecastRecommendation[]> => {
    const response = await api.get<ForecastRecommendation[]>(
      "/forecast/recommendations",
    );
    return response.data;
  },

  uploadBulk: async (file: any): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file as any);

    const response = await api.post("/inventory/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  exportExcel: async (): Promise<string> => {
    const response = await api.get("/inventory/export/excel", {
      responseType: "blob", 
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  },
};
