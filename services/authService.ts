import api from "./api"; // Assuming your Axios instance is imported here

export interface LoginResponse {
  accessToken: string; 
  user: {
    id: string; // <-- Add this
    username: string;
    role: 'staff' | 'owner';
  };
}

// Added UserProfile interface based on your NestJS Schema
export interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.log("Login Error Details:", error.response?.data);
      const message = error.response?.data?.message || 'Connection failed';
      throw new Error(message);
    }
  },

  // <-- Add this new function to fetch the profile
  getUserById: async (id: string): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfile>(`/auth/users/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      throw new Error(message);
    }
  }
};