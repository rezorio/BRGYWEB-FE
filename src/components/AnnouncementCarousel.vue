<template>
  <div class="relative px-12">
    <!-- Carousel Container -->
    <div class="overflow-hidden">
      <div 
        class="flex transition-transform duration-500 ease-in-out gap-6"
        :style="{ transform: `translateX(-${currentIndex * slideWidth}%)` }"
      >
        <div 
          v-for="(announcement, index) in announcements"
          :key="announcement.id"
          :class="cardWidthClass"
          class="flex-shrink-0"
        >
          <AnnouncementCard 
            :announcement="announcement"
            :show-read-more="showReadMore"
            @read-more="$emit('read-more', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <button
      v-if="announcements.length > cardsPerView"
      @click="previousSlide"
      class="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-3 hover:shadow-xl hover:bg-blue-50 transition-all z-10"
      :disabled="currentIndex === 0"
      :class="{ 'opacity-50 cursor-not-allowed': currentIndex === 0 }"
    >
      <i class="fas fa-chevron-left text-gray-700"></i>
    </button>
    
    <button
      v-if="announcements.length > cardsPerView"
      @click="nextSlide"
      class="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-3 hover:shadow-xl hover:bg-blue-50 transition-all z-10"
      :disabled="currentIndex === maxIndex"
      :class="{ 'opacity-50 cursor-not-allowed': currentIndex === maxIndex }"
    >
      <i class="fas fa-chevron-right text-gray-700"></i>
    </button>

    <!-- Dots Indicator -->
    <div v-if="announcements.length > cardsPerView" class="flex justify-center mt-8 space-x-2">
      <button
        v-for="index in maxIndex + 1"
        :key="index - 1"
        @click="goToSlide(index - 1)"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="currentIndex === index - 1 ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AnnouncementCard from './AnnouncementCard.vue';

const props = defineProps({
  announcements: {
    type: Array,
    required: true,
  },
  autoPlay: {
    type: Boolean,
    default: true,
  },
  autoPlayInterval: {
    type: Number,
    default: 5000, // 5 seconds
  },
  showReadMore: {
    type: Boolean,
    default: true,
  },
  cardsPerView: {
    type: Number,
    default: 3, // Show 3 cards at once on desktop
  },
});

defineEmits(['read-more']);

const currentIndex = ref(0);
let autoPlayTimer = null;

// Calculate how many cards to show and slide width
const cardWidthClass = computed(() => {
  // On mobile: 1 card, tablet: 2 cards, desktop: 3 cards
  return 'w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]';
});

const slideWidth = computed(() => {
  // Calculate slide width based on cards per view
  // Mobile: 100%, Tablet: 50%, Desktop: 33.333%
  return 100 / props.cardsPerView;
});

const maxIndex = computed(() => {
  // Maximum index we can scroll to
  return Math.max(0, props.announcements.length - props.cardsPerView);
});

const nextSlide = () => {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++;
  } else if (props.autoPlay) {
    currentIndex.value = 0; // Loop back to first slide
  }
};

const previousSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const goToSlide = (index) => {
  currentIndex.value = index;
  resetAutoPlay();
};

const startAutoPlay = () => {
  if (props.autoPlay && props.announcements.length > 1) {
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, props.autoPlayInterval);
  }
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

const resetAutoPlay = () => {
  stopAutoPlay();
  startAutoPlay();
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>
