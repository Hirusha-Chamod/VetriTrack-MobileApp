import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log("Connecting to:", API_URL);
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request Interceptor: Automatically attach the JWT token
api.interceptors.request.use(
  (config) => {

    const token = useAuthStore.getState().user?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;