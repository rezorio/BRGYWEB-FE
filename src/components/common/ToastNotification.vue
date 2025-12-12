<template>
  <div class="fixed top-20 right-4 z-50 space-y-2">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="toastClasses(toast.type)"
        class="max-w-sm w-full p-4 rounded-lg shadow-lg border pointer-events-auto"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <i :class="toastIcon(toast.type)" class="text-lg"></i>
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium">
              {{ toast.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="toastStore.removeToast(toast.id)"
              class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from "@/stores/toast";

const toastStore = useToastStore();

const toastClasses = (type) => {
  const baseClasses = "bg-white border-l-4";
  const typeClasses = {
    success: "border-green-400 text-green-800",
    error: "border-red-400 text-red-800",
    warning: "border-yellow-400 text-yellow-800",
    info: "border-blue-400 text-blue-800",
  };
  return `${baseClasses} ${typeClasses[type]}`;
};

const toastIcon = (type) => {
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };
  return icons[type];
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
