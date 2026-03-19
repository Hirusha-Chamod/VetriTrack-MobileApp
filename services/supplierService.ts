import api from "./api";

export interface Supplier {
  _id: string;
  supplierName: string;
  status: "Active" | "Inactive";
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  leadTimeNotes?: string;
  averageLeadTimeDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPayload {
  supplierName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  leadTimeNotes?: string;
}

export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;

export const supplierApi = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get<Supplier[]>("/suppliers");
    return response.data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: CreateSupplierPayload): Promise<Supplier> => {
    const response = await api.post<Supplier>("/suppliers", data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateSupplierPayload,
  ): Promise<Supplier> => {
    const response = await api.patch<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: "Active" | "Inactive",
  ): Promise<Supplier> => {
    const response = await api.patch<Supplier>(`/suppliers/${id}/status`, {
      status,
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ deleted: boolean }> => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },


 uploadBulk: async (file: any): Promise<Supplier[]> => {
    const formData = new FormData();
    formData.append("file", file as any);

    const response = await api.post("/suppliers/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

 
  exportExcel: async (): Promise<string> => {
    const response = await api.get("/suppliers/export/excel", {
      responseType: "blob", 
    });

    // Convert the raw Blob into a Base64 string for Expo FileSystem
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
