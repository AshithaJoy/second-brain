import axios from "axios";
import { useAuthStore } from "../stores/auth.store";
import { getToken } from "../utils/auth.utils";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
export const apiBaseUrl = API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    if (config.url?.includes("/auth/")) {
      console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`, config.data ? JSON.parse(JSON.stringify(config.data)) : null);
    }
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized API error handling and normalization
api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes("/auth/")) {
      console.log(`[Axios Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    
    if (url.includes("/auth/")) {
      console.error(`[Axios Error] ${error.config?.method?.toUpperCase()} ${url} - Status ${status}`, error.response?.data);
    }
    
    if ((status === 401 || status === 403) && !url.includes("/instagram")) {
      console.warn("[Axios Interceptor] Centralized session expiration. Forcing logout.");
      useAuthStore.getState().logout();
    }
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "An error occurred";
    console.error("[API Error]", message);
    return Promise.reject(error);
  }
);
