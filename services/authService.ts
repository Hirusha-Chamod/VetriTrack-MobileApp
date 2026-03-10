
import api from "./api";

export interface LoginResponse {
  accessToken: string; 
  user: {
    username: string;
    role: 'staff' | 'owner';
  };
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      console.log("Attempting login with:", { username, password: '********' });
      const response = await api.post<LoginResponse>('/auth/login', {
        username,
        password,
      });
       console.log("Login successful:", response.data);
      return response.data;
     
    } catch (error: any) {
      console.log("Login Error Details:", error.response?.data);
      const message = error.response?.data?.message || 'Connection failed';
      throw new Error(message);
    }
  },
};