import api from "./api";

export interface SystemSettings {
  recommendationHorizonDays: number;
  expiryAlertDays: number;
}

export const settingsApi = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await api.get<SystemSettings>("/settings");
    return response.data;
  },
  
  updateSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await api.put<SystemSettings>("/settings", data);
    return response.data;
  },
};