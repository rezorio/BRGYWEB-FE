import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

// Create axios instance
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await authStore.refreshTokens();

        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        authStore.clearAuth();
        toastStore.showError("Session expired. Please login again.");

        // Redirect to login if not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Show error toast for other errors
    if (error.response?.data?.message) {
      toastStore.showError(error.response.data.message);
    }

    return Promise.reject(error);
  },
);

export default api;
