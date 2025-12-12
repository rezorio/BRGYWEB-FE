import { ref, computed } from "vue";
import { defineStore } from "pinia";
import api from "@/services/api";
import { useAuthStore } from "@/stores/auth";

export const useActivityLogsStore = defineStore("activityLogs", () => {
  const logs = ref([]);
  const currentPage = ref(1);
  const logsPerPage = ref(5);
  const totalLogs = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Fetch logs from API
  const fetchLogs = async (page = 1, limit = 5) => {
    try {
      loading.value = true;
      error.value = null;

      // Check if user is authenticated
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        console.warn("Cannot fetch activity logs: User not authenticated");
        logs.value = [];
        totalLogs.value = 0;
        return;
      }

      const response = await api.get("/activity-logs", {
        params: { page, limit },
      });

      logs.value = response.data.logs.map((log) => ({
        ...log,
        displayTimestamp: new Date(log.timestamp).toLocaleString(),
      }));
      totalLogs.value = response.data.total;
      currentPage.value = page;
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      if (err.response?.status === 401) {
        error.value = "Please login to view activity logs";
        logs.value = [];
        totalLogs.value = 0;
      } else {
        error.value =
          err.response?.data?.message || "Failed to fetch activity logs";
        logs.value = [];
        totalLogs.value = 0;
      }
    } finally {
      loading.value = false;
    }
  };

  // Add a new activity log via API
  const addLog = async (
    title,
    description,
    type = "system",
    changes = null,
  ) => {
    try {
      // Prevent logging routine access/viewing events
      const restrictedEvents = [
        "access",
        "view",
        "login",
        "logout",
        "signin",
        "signout",
        "opened",
        "navigated",
        "visited",
        "displayed",
        "loaded",
      ];

      const titleLower = title.toLowerCase();
      const descriptionLower = description.toLowerCase();

      const isRestrictedEvent = restrictedEvents.some(
        (event) =>
          titleLower.includes(event) || descriptionLower.includes(event),
      );

      if (isRestrictedEvent) {
        console.warn(
          "Activity log blocked: Routine access/viewing events are not logged",
        );
        return;
      }

      const currentUserInfo = getCurrentUserInfo();

      const logData = {
        title,
        description,
        type,
        changes,
        ...currentUserInfo,
      };

      const response = await api.post("/activity-logs", logData);

      // Add the new log to the beginning of the array
      const newLog = {
        ...response.data,
        displayTimestamp: new Date(response.data.timestamp).toLocaleString(),
      };

      logs.value.unshift(newLog);
      totalLogs.value += 1;
    } catch (err) {
      console.error("Error adding activity log:", err);
      error.value = err.response?.data?.message || "Failed to add activity log";
    }
  };

  // Add a new activity log with user info provided directly
  const addLogWithUserInfo = async (
    title,
    description,
    type = "system",
    changes = null,
    userInfo = null,
  ) => {
    try {
      // Prevent logging routine access/viewing events
      const restrictedEvents = [
        "access",
        "view",
        "login",
        "logout",
        "signin",
        "signout",
        "opened",
        "navigated",
        "visited",
        "displayed",
        "loaded",
      ];

      const titleLower = title.toLowerCase();
      const descriptionLower = description.toLowerCase();

      const isRestrictedEvent = restrictedEvents.some(
        (event) =>
          titleLower.includes(event) || descriptionLower.includes(event),
      );

      if (isRestrictedEvent) {
        console.warn(
          "Activity log blocked: Routine access/viewing events are not logged",
        );
        return;
      }

      const logData = {
        title,
        description,
        type,
        changes,
        ...userInfo,
      };

      const response = await api.post("/activity-logs", logData);

      // Add the new log to the beginning of the array
      const newLog = {
        ...response.data,
        displayTimestamp: new Date(response.data.timestamp).toLocaleString(),
      };

      logs.value.unshift(newLog);
      totalLogs.value += 1;
    } catch (err) {
      console.error("Error adding activity log:", err);
      error.value = err.response?.data?.message || "Failed to add activity log";
    }
  };

  // Get current user info for logging
  const getCurrentUserInfo = () => {
    try {
      // Try to get user info from current auth store in memory first
      const authStores = window.__pinia?.state?.value?.auth;
      if (authStores?.user) {
        return {
          userId: authStores.user.id || null,
          userEmail: authStores.user.email || "Unknown",
          userName:
            `${authStores.user.firstName || ""} ${authStores.user.lastName || ""}`.trim() ||
            "Unknown User",
          userRole: authStores.user.roles?.[0] || "Unknown Role",
        };
      }

      // Fallback: try to get from localStorage tokens
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          return {
            userId: payload.sub || null,
            userEmail: payload.email || "Unknown",
            userName: "Current User", // We don't have name in JWT payload
            userRole: payload.roles?.[0] || "Unknown Role",
          };
        } catch {
          // Token parsing failed
        }
      }

      // Last fallback
      return {
        userId: null,
        userEmail: "Unknown",
        userName: "Unknown User",
        userRole: "Unknown Role",
      };
    } catch {
      return {
        userId: null,
        userEmail: "Unknown",
        userName: "Unknown User",
        userRole: "Unknown Role",
      };
    }
  };

  // Computed properties for pagination
  const totalPages = computed(() => {
    return Math.ceil(totalLogs.value / logsPerPage.value);
  });

  const paginatedLogs = computed(() => {
    return logs.value;
  });

  // Pagination methods
  const nextPage = async () => {
    if (currentPage.value < totalPages.value) {
      await fetchLogs(currentPage.value + 1, logsPerPage.value);
    }
  };

  const prevPage = async () => {
    if (currentPage.value > 1) {
      await fetchLogs(currentPage.value - 1, logsPerPage.value);
    }
  };

  const goToPage = async (page) => {
    if (page >= 1 && page <= totalPages.value) {
      await fetchLogs(page, logsPerPage.value);
    }
  };

  // Search logs via API
  const searchLogs = async (query, page = 1) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.get("/activity-logs/search", {
        params: { q: query, page, limit: logsPerPage.value },
      });

      logs.value = response.data.logs.map((log) => ({
        ...log,
        displayTimestamp: new Date(log.timestamp).toLocaleString(),
      }));
      totalLogs.value = response.data.total;
      currentPage.value = page;
    } catch (err) {
      console.error("Error searching activity logs:", err);
      error.value =
        err.response?.data?.message || "Failed to search activity logs";
      logs.value = [];
      totalLogs.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // Filter logs by type via API
  const getLogsByType = async (type, page = 1) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.get("/activity-logs/type", {
        params: { type, page, limit: logsPerPage.value },
      });

      logs.value = response.data.logs.map((log) => ({
        ...log,
        displayTimestamp: new Date(log.timestamp).toLocaleString(),
      }));
      totalLogs.value = response.data.total;
      currentPage.value = page;
    } catch (err) {
      console.error("Error filtering activity logs by type:", err);
      error.value =
        err.response?.data?.message || "Failed to filter activity logs";
      logs.value = [];
      totalLogs.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // Clear all logs (admin function) via API
  const clearAllLogs = async () => {
    try {
      loading.value = true;
      error.value = null;

      await api.delete("/activity-logs");

      logs.value = [];
      totalLogs.value = 0;
      currentPage.value = 1;
    } catch (err) {
      console.error("Error clearing activity logs:", err);
      error.value =
        err.response?.data?.message || "Failed to clear activity logs";
    } finally {
      loading.value = false;
    }
  };

  // Initialize logs on store creation (only if authenticated)
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    fetchLogs();
  }

  return {
    logs,
    currentPage,
    logsPerPage,
    totalLogs,
    totalPages,
    paginatedLogs,
    loading,
    error,
    addLog,
    addLogWithUserInfo,
    nextPage,
    prevPage,
    goToPage,
    getLogsByType,
    searchLogs,
    clearAllLogs,
    fetchLogs,
  };
});
