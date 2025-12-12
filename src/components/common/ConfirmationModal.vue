<template>
  <transition name="modal-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="handleCancel"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
        <!-- Modal Content -->
        <div
          class="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
          @click.stop
        >
          <!-- Header -->
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div class="flex items-start justify-between">
              <div class="flex items-center">
                <div
                  :class="iconBgClass"
                  class="flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full"
                >
                  <i :class="iconClass" class="text-lg sm:text-xl"></i>
                </div>
                <h3
                  class="ml-3 text-base sm:text-lg font-semibold text-gray-900"
                >
                  {{ title }}
                </h3>
              </div>
              <button
                @click="handleCancel"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-4 py-5 sm:px-6">
            <p class="text-sm sm:text-base text-gray-600">
              {{ message }}
            </p>
            <p
              v-if="warningMessage"
              class="mt-3 text-xs sm:text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200"
            >
              <i class="fas fa-exclamation-triangle mr-2"></i>
              {{ warningMessage }}
            </p>
          </div>

          <!-- Footer -->
          <div
            class="px-4 py-4 sm:px-6 bg-gray-50 rounded-b-lg flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3"
          >
            <button
              @click="handleCancel"
              :disabled="loading"
              class="w-full sm:w-auto btn-outline text-sm sm:text-base"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :disabled="loading"
              :class="confirmButtonClass"
              class="w-full sm:w-auto text-sm sm:text-base"
            >
              <i
                v-if="loading"
                class="fas fa-spinner fa-spin mr-2"
              ></i>
              <i v-else :class="confirmIconClass" class="mr-2"></i>
              {{ loading ? loadingText : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "Confirm Action",
  },
  message: {
    type: String,
    required: true,
  },
  warningMessage: {
    type: String,
    default: "",
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  loadingText: {
    type: String,
    default: "Processing...",
  },
  type: {
    type: String,
    default: "warning", // warning, danger, info, success
    validator: (value) => ["warning", "danger", "info", "success"].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "cancel", "close"]);

const iconClass = computed(() => {
  const icons = {
    warning: "fas fa-exclamation-triangle text-yellow-600",
    danger: "fas fa-exclamation-circle text-red-600",
    info: "fas fa-info-circle text-blue-600",
    success: "fas fa-check-circle text-green-600",
  };
  return icons[props.type] || icons.warning;
});

const iconBgClass = computed(() => {
  const classes = {
    warning: "bg-yellow-100",
    danger: "bg-red-100",
    info: "bg-blue-100",
    success: "bg-green-100",
  };
  return classes[props.type] || classes.warning;
});

const confirmButtonClass = computed(() => {
  const classes = {
    warning: "btn-warning bg-yellow-600 hover:bg-yellow-700 text-white",
    danger: "btn-danger bg-red-600 hover:bg-red-700 text-white",
    info: "btn-primary",
    success: "btn-success bg-green-600 hover:bg-green-700 text-white",
  };
  return classes[props.type] || classes.warning;
});

const confirmIconClass = computed(() => {
  const icons = {
    warning: "fas fa-exclamation-triangle",
    danger: "fas fa-trash",
    info: "fas fa-check",
    success: "fas fa-check",
  };
  return icons[props.type] || icons.warning;
});

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  if (!props.loading) {
    emit("cancel");
    emit("close");
  }
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .bg-white,
.modal-fade-leave-to .bg-white {
  transform: scale(0.95);
}

/* Prevent body scroll when modal is open */
body:has(.modal-fade-enter-active) {
  overflow: hidden;
}
</style>
