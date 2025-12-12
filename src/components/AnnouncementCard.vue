<template>
  <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
    <!-- Announcement Image -->
    <div class="relative h-56 overflow-hidden bg-gray-200 flex-shrink-0">
      <img
        v-if="announcement.image"
        :src="getImageUrl(announcement.image)"
        :alt="announcement.title"
        class="w-full h-full object-contain bg-gray-100 group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
        <i class="fas fa-bullhorn text-white text-5xl"></i>
      </div>
    </div>

    <!-- Announcement Content -->
    <div class="p-6 flex flex-col flex-grow">
      <div class="flex items-center text-sm text-gray-500 mb-3">
        <i class="fas fa-calendar-alt mr-2"></i>
        <span>{{ formatDate(announcement.date) }}</span>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
        {{ announcement.title }}
      </h3>
      <p class="text-gray-600 leading-relaxed line-clamp-3 flex-grow">
        {{ announcement.description }}
      </p>
      <button 
        v-if="showReadMore"
        @click="$emit('read-more', announcement)"
        class="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
      >
        Read More
        <i class="fas fa-arrow-right ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  announcement: {
    type: Object,
    required: true,
  },
  showReadMore: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['read-more']);

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

const getImageUrl = (image) => {
  // If it's already a full URL, return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  // Otherwise, prepend the API base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${apiBaseUrl}${image}`;
};

const handleImageError = (event) => {
  // Hide broken image and show default icon
  event.target.style.display = 'none';
  event.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600"><i class="fas fa-bullhorn text-white text-5xl"></i></div>';
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
