<template>
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <!-- Close Button -->
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <i class="fas fa-times text-gray-600"></i>
          </button>
          
          <!-- Announcement Image -->
          <div v-if="announcement.image" class="relative h-64 md:h-96 overflow-hidden bg-gray-200">
            <img
              :src="getImageUrl(announcement.image)"
              :alt="announcement.title"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          <div v-else class="relative h-64 md:h-96 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
            <i class="fas fa-bullhorn text-white text-7xl"></i>
          </div>
          
          <!-- Announcement Content -->
          <div class="p-6 md:p-8 overflow-y-auto max-h-[50vh]">
            <div class="flex items-center text-sm text-gray-500 mb-4">
              <i class="fas fa-calendar-alt mr-2"></i>
              <span>{{ formatDate(announcement.date) }}</span>
            </div>
            
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {{ announcement.title }}
            </h2>
            
            <div class="prose prose-lg max-w-none text-gray-600">
              <p class="whitespace-pre-wrap">{{ announcement.description }}</p>
            </div>
            
            <div v-if="announcement.createdBy" class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-500">
                Posted by: {{ announcement.createdBy.firstName }} {{ announcement.createdBy.lastName }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  announcement: {
    type: Object,
    required: true,
  },
});

defineEmits(['close']);

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${apiBaseUrl}${image}`;
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
  event.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600"><i class="fas fa-bullhorn text-white text-7xl"></i></div>';
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative {
  transform: scale(0.9);
}

.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
