import api from "./api";

export interface ChartDataPoint {
  label: string;
  value: number;
  frontColor: string;
}

export interface DashboardData {
  inventory: {
    totalValue: number;
    totalItemsCount: number;
    expiringValue: number;
  };
  charts: {
    poSummary: ChartDataPoint[];
    supplierLeadTimes: ChartDataPoint[];
  };
}

export const analyticsApi = {
  getDashboardMetrics: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/analytics/dashboard");
    return response.data;
  },
};
