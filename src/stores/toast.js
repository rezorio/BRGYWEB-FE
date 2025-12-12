import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const toasts = ref([]);

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration,
    };

    toasts.value.push(toast);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const showSuccess = (message, duration) => {
    return addToast(message, "success", duration);
  };

  const showError = (message, duration) => {
    return addToast(message, "error", duration || 5000);
  };

  const showWarning = (message, duration) => {
    return addToast(message, "warning", duration);
  };

  const showInfo = (message, duration) => {
    return addToast(message, "info", duration);
  };

  const clearAll = () => {
    toasts.value = [];
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
});
