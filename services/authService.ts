import api from "./api";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    role: "staff" | "owner";
  };
}

export interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: "staff" | "owner";
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
}

// Data needed to create a new user (matches your SignUpDto)
export interface CreateUserPayload {
  fullName: string;
  username: string;
  email: string;
  password?: string; // Optional if you auto-generate, but required by your DTO currently
  role: "staff" | "owner";
}


export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: "staff" | "owner";
  password?: string;
}

export const authApi = {

  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/auth/users/${id}`);
    return response.data;
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get<UserProfile[]>("/auth/users");
    return response.data;
  },

  createUser: async (data: CreateUserPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/auth/signup", data);
    return response.data;
  },

  updateUser: async (
    id: string,
    data: UpdateUserPayload,
  ): Promise<UserProfile> => {
    const response = await api.put<UserProfile>(`/auth/users/${id}`, data);
    return response.data;
  },

  deactivateUser: async (id: string): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/auth/users/${id}/deactivate`,
    );
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<{ isValid: boolean; message: string }> => {
    const response = await api.post<{ isValid: boolean; message: string }>("/auth/verify-otp", {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};
