import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import { sessionManager } from "@/utils/sessionManager.js";

export const useAuthStore = defineStore("auth", () => {
  // State - Load user from localStorage if available
  const storedUser = localStorage.getItem("user");
  const user = ref(storedUser ? JSON.parse(storedUser) : null);
  const accessToken = ref(localStorage.getItem("accessToken"));
  const refreshToken = ref(localStorage.getItem("refreshToken"));
  const loading = ref(false);
  const error = ref(null);
  const sessionTimeout = ref(null);
  const lastActivity = ref(
    parseInt(localStorage.getItem("lastActivity")) || Date.now(),
  );
  const isRefreshing = ref(false);
  const currentTime = ref(Date.now()); // Reactive timestamp for session timer
  
  // Update currentTime every second to make session timer reactive
  let timeUpdateInterval = null;
  if (typeof window !== 'undefined') {
    timeUpdateInterval = setInterval(() => {
      currentTime.value = Date.now();
    }, 1000);
  }

  // Session configuration
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIMEOUT = 25 * 60 * 1000; // 25 minutes
  const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  // Getters
  const isAuthenticated = computed(
    () => !!accessToken.value && !isSessionExpired(),
  );
  const userRole = computed(() => {
  if (!user.value) {
    console.log('[Auth] userRole: No user found');
    return null;
  }
  
  console.log('[Auth] Detecting role from user:', { 
    hasRoles: !!user.value.roles, 
    rolesType: Array.isArray(user.value.roles) ? 'array' : typeof user.value.roles,
    rolesFirstItem: Array.isArray(user.value.roles) ? user.value.roles[0] : null,
    hasRole: !!user.value.role,
    roleType: typeof user.value.role,
    roleValue: user.value.role
  });
  
  // Handle array of roles (could be strings or objects)
  if (Array.isArray(user.value.roles) && user.value.roles.length > 0) {
    // Check if roles are strings
    if (typeof user.value.roles[0] === 'string') {
      if (user.value.roles.includes("Super Admin")) {
        console.log('[Auth] userRole detected: Super Admin (from roles string array)');
        return "Super Admin";
      }
      if (user.value.roles.includes("Admin")) {
        console.log('[Auth] userRole detected: Admin (from roles string array)');
        return "Admin";
      }
      if (user.value.roles.includes("Citizen")) {
        console.log('[Auth] userRole detected: Citizen (from roles string array)');
        return "Citizen";
      }
      console.log('[Auth] userRole detected:', user.value.roles[0], '(first in roles string array)');
      return user.value.roles[0];
    }
    // Check if roles are objects with name property
    if (typeof user.value.roles[0] === 'object' && user.value.roles[0].name) {
      const roleNames = user.value.roles.map(r => r.name);
      if (roleNames.includes("Super Admin")) {
        console.log('[Auth] userRole detected: Super Admin (from roles object array)');
        return "Super Admin";
      }
      if (roleNames.includes("Admin")) {
        console.log('[Auth] userRole detected: Admin (from roles object array)');
        return "Admin";
      }
      if (roleNames.includes("Citizen")) {
        console.log('[Auth] userRole detected: Citizen (from roles object array)');
        return "Citizen";
      }
      console.log('[Auth] userRole detected:', user.value.roles[0].name, '(first in roles object array)');
      return user.value.roles[0].name;
    }
  }
  
  // Handle single role string from backend
  if (typeof user.value.role === "string") {
    console.log('[Auth] userRole detected:', user.value.role, '(string)');
    return user.value.role;
  }
  
  // Handle role as object with name property
  if (user.value.role && typeof user.value.role === "object" && user.value.role.name) {
    console.log('[Auth] userRole detected:', user.value.role.name, '(from role object)');
    return user.value.role.name;
  }
  
  console.log('[Auth] userRole: Could not detect role');
  return null;
});
  const isAdmin = computed(() =>
    ["Admin", "Super Admin"].includes(userRole.value),
  );
  const isSuperAdmin = computed(() => userRole.value === "Super Admin");
  const sessionTimeRemaining = computed(() => {
    if (!lastActivity.value) return 0;
    const elapsed = currentTime.value - lastActivity.value;
    return Math.max(0, SESSION_TIMEOUT - elapsed);
  });
  const shouldShowSessionWarning = computed(() => {
    return (
      sessionTimeRemaining.value > 0 &&
      sessionTimeRemaining.value <= SESSION_TIMEOUT - WARNING_TIMEOUT
    );
  });

  // Session management utilities
  const isSessionExpired = () => {
    if (!lastActivity.value) return true;
    return Date.now() - lastActivity.value > SESSION_TIMEOUT;
  };

  const updateLastActivity = () => {
    lastActivity.value = Date.now();
    localStorage.setItem("lastActivity", lastActivity.value.toString());
    resetSessionTimeout();
  };

  const resetSessionTimeout = () => {
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value);
    }

    sessionTimeout.value = setTimeout(() => {
      handleSessionTimeout();
    }, SESSION_TIMEOUT);
  };

  const handleSessionTimeout = () => {
    if (isAuthenticated.value) {
      // Import toast store dynamically to avoid circular dependency
      import("./toast.js").then(({ useToastStore }) => {
        useToastStore().showWarning(
          "Your session is about to expire due to inactivity.",
        );
      });
      // Give user 5 minutes warning before forced logout
      setTimeout(
        () => {
          if (isSessionExpired()) {
            import("./toast.js").then(({ useToastStore }) => {
              useToastStore().showError("Session expired. Please login again.");
            });
            clearAuth();
            window.location.href = "/login";
          }
        },
        5 * 60 * 1000,
      );
    }
  };

  const isTokenExpiringSoon = () => {
    if (!accessToken.value) return false;
    try {
      const payload = JSON.parse(atob(accessToken.value.split(".")[1]));
      const expiryTime = payload.exp * 1000;
      return Date.now() >= expiryTime - TOKEN_REFRESH_THRESHOLD;
    } catch {
      return true; // If we can't parse token, assume it's expiring
    }
  };

  // Initialize session on app load
  const initializeSession = async () => {
    if (accessToken.value && refreshToken.value) {
      try {
        // Check if session is expired
        if (isSessionExpired()) {
          clearAuth();
          return false;
        }

        // Check if token is expiring soon and refresh if needed
        if (isTokenExpiringSoon()) {
          await refreshTokens();
        }

        // Fetch fresh user data
        await fetchProfile();

        // Start session timeout
        resetSessionTimeout();

        return true;
      } catch (error) {
        console.error("Session initialization failed:", error);
        clearAuth();
        return false;
      }
    }
    return false;
  };

  // Enhanced login with session management
  const login = async (credentials) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.post("/auth/login", credentials);
      const {
        accessToken: token,
        refreshToken: refresh,
        user: userData,
      } = response.data;

      // Store tokens with additional security
      accessToken.value = token;
      refreshToken.value = refresh;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refresh);

      // Store user data
      user.value = userData;
      localStorage.setItem("user", JSON.stringify(userData));

      // Initialize session
      updateLastActivity();

      // Start session monitoring with session manager
      sessionManager.startMonitoring({
        isAuthenticated: true,
        updateLastActivity,
        sessionTimeRemaining: computed(() => sessionTimeRemaining.value),
      });

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Helper method to set tokens (used by OTP verification)
  const setTokens = (accessTokenValue, refreshTokenValue) => {
    accessToken.value = accessTokenValue;
    refreshToken.value = refreshTokenValue;
    localStorage.setItem("accessToken", accessTokenValue);
    localStorage.setItem("refreshToken", refreshTokenValue);
    
    updateLastActivity();
    sessionManager.startMonitoring({
      isAuthenticated: true,
      updateLastActivity,
      sessionTimeRemaining: computed(() => sessionTimeRemaining.value),
    });
  };

  // Helper method to set user (used by OTP verification)
  const setUser = (userData) => {
    user.value = userData;
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const register = async (userData) => {
    try {
      loading.value = true;
      error.value = null;

      // Note: Registration now uses OTP flow
      // This method is kept for compatibility but not used in OTP flow
      const response = await api.post("/user-requests/registration", userData);
      
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Registration request failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      if (accessToken.value) {
        await api.post("/auth/logout", { refreshToken: refreshToken.value });
      }
    } catch (err) {
      error.value = "Logout error: " + err.message;
    } finally {
      // Clear session data
      clearAuth();
      cleanupActivityMonitoring();
    }
  };

  const refreshTokens = async () => {
    // Prevent multiple refresh attempts
    if (isRefreshing.value) {
      return accessToken.value;
    }

    try {
      isRefreshing.value = true;

      if (!refreshToken.value) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/auth/refresh", {
        refreshToken: refreshToken.value,
      });

      const { accessToken: token } = response.data;
      accessToken.value = token;
      localStorage.setItem("accessToken", token);

      return token;
    } catch (err) {
      clearAuth();
      throw err;
    } finally {
      isRefreshing.value = false;
    }
  };

  const fetchProfile = async () => {
    try {
      loading.value = true;
      const response = await api.get("/auth/profile");
      user.value = response.data;
      // Update localStorage with fresh user data
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to fetch profile";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Activity monitoring
  let activityEvents = [];

  const cleanupActivityMonitoring = () => {
    activityEvents.forEach(({ event, handler }) => {
      if (event === "storage") {
        window.removeEventListener(event, handler);
      } else {
        document.removeEventListener(event, handler);
      }
    });
    activityEvents = [];
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    lastActivity.value = null;

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("lastActivity");

    // Clear session timeout
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value);
      sessionTimeout.value = null;
    }

    // Cleanup activity monitoring
    sessionManager.stopMonitoring();
    cleanupActivityMonitoring();
  };

  const clearError = () => {
    error.value = null;
  };

  // Extend session manually
  const extendSession = async () => {
    if (isAuthenticated.value) {
      try {
        if (isTokenExpiringSoon()) {
          await refreshTokens();
        }
        updateLastActivity();
        import("./toast.js").then(({ useToastStore }) => {
          useToastStore().showSuccess("Session extended successfully.");
        });
      } catch {
        import("./toast.js").then(({ useToastStore }) => {
          useToastStore().showError(
            "Failed to extend session. Please login again.",
          );
        });
        clearAuth();
      }
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.post("/auth/change-password", passwordData);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to change password";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.patch("/auth/profile", profileData);
      
      // Update local user data
      user.value = response.data;
      localStorage.setItem("user", JSON.stringify(response.data));
      
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update profile";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    lastActivity,
    sessionTimeRemaining,
    shouldShowSessionWarning,

    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isSuperAdmin,

    // Actions
    login,
    register,
    logout,
    refreshTokens,
    fetchProfile,
    updateProfile,
    clearAuth,
    clearError,
    initializeSession,
    extendSession,
    updateLastActivity,
    changePassword,
    setTokens,
    setUser,
  };
});
