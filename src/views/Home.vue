<template>
  <PublicLayout>

    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div class="text-center">
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
          >
            Welcome to
            <span class="text-blue-600">Barangay Bagong Barrio</span>
          </h1>
          <p
            class="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed"
          >
            Your comprehensive barangay management system. Streamline services,
            connect with your community, and access essential resources all in
            one secure platform.
          </p>
          <div
            class="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/register"
              class="w-full sm:w-auto bg-blue-600 text-white text-lg font-medium px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started
              <i class="fas fa-arrow-right ml-2"></i>
            </router-link>
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/login"
              class="w-full sm:w-auto border border-blue-600 text-blue-600 text-lg font-medium px-8 py-4 rounded-lg hover:bg-blue-50-transition-all duration-200"
            >
              Sign In
            </router-link>
            <router-link
              v-if="authStore.isAuthenticated"
              to="/dashboard"
              class="w-full sm:w-auto bg-blue-600 text-white text-lg font-medium px-8 py-4 rounded-lg hover:bg-blue-700-transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Go to Dashboard
              <i class="fas fa-tachometer-alt ml-2"></i>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Decorative background elements -->
      <div class="absolute top-10 left-10 opacity-10 hidden lg:block">
        <i class="fas fa-building text-blue-600" style="font-size: 120px"></i>
      </div>
      <div class="absolute bottom-10 right-10 opacity-10 hidden lg:block">
        <i class="fas fa-users text-blue-400" style="font-size: 100px"></i>
      </div>
    </div>

    <!-- Announcements Section -->
    <div class="py-16 lg:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">
            Latest Announcements
          </h2>
          <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest news and announcements from Barangay Bagong Barrio.
          </p>
        </div>

        <!-- Announcements Display -->
        <div v-if="announcements.length > 0">
          <!-- Grid Layout for 3 or fewer announcements -->
          <div v-if="announcements.length <= 3" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnnouncementCard
              v-for="announcement in displayedAnnouncements"
              :key="announcement.id"
              :announcement="announcement"
              :show-read-more="true"
              @read-more="handleReadMore"
            />
          </div>
          
          <!-- Carousel for more than 3 announcements -->
          <div v-else>
            <AnnouncementCarousel
              :announcements="announcements"
              :auto-play="true"
              :auto-play-interval="5000"
              :show-read-more="true"
              @read-more="handleReadMore"
            />
          </div>
        </div>

        <!-- No Announcements State -->
        <div v-else class="text-center py-12">
          <i class="fas fa-bullhorn text-gray-300 text-6xl mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
          <p class="text-gray-600">Check back later for updates from the barangay.</p>
        </div>
      </div>
    </div>

    <!-- Announcement Modal -->
    <AnnouncementModal
      v-if="selectedAnnouncement"
      :show="showAnnouncementModal"
      :announcement="selectedAnnouncement"
      @close="showAnnouncementModal = false"
    />

    <!-- Community Info Section -->
    <div class="py-16 lg:py-24 bg-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">
            Serving Our Community
          </h2>
          <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Connecting residents with essential services and fostering community
            engagement.
          </p>
        </div>

        <div class="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <div class="flex items-start space-x-4">
              <div
                class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <i class="fas fa-file-alt text-white"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Document Requests
                </h3>
                <p class="text-gray-600">
                  Request barangay certificates, clearances, and other documents
                  online.
                </p>
              </div>
            </div>
            <div class="flex items-start space-x-4">
              <div
                class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <i class="fas fa-calendar-check text-white"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Service Scheduling
                </h3>
                <p class="text-gray-600">
                  Book appointments and schedule barangay services conveniently.
                </p>
              </div>
            </div>
            <div class="flex items-start space-x-4">
              <div
                class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <i class="fas fa-bullhorn text-white"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Announcements
                </h3>
                <p class="text-gray-600">
                  Stay updated with the latest barangay news and important
                  notices.
                </p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center">
              <i class="fas fa-users text-blue-600 text-4xl mb-4"></i>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">
                Community First
              </h3>
              <p class="text-gray-600 mb-6">
                Join thousands of residents already using our platform to access
                barangay services efficiently.
              </p>
              <div class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-blue-600">24/7</div>
                  <div class="text-sm text-gray-600">Access</div>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-blue-600">100%</div>
                  <div class="text-sm text-gray-600">Digital</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-blue-600">
      <div
        class="max-w-4xl mx-auto text-center py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
      >
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p class="text-lg sm:text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
          Join your barangay's digital platform today and experience seamless
          community management services.
        </p>
        <div
          class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <router-link
            v-if="!authStore.isAuthenticated"
            to="/register"
            class="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-50-transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Create Account
            <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/dashboard"
            class="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-50-transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Go to Dashboard
            <i class="fas fa-tachometer-alt ml-2"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="flex items-center justify-center space-x-2 mb-4">
            <div
              class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
            >
              <i class="fas fa-building text-white text-sm"></i>
            </div>
            <span class="text-xl font-semibold">Barangay Bagong Barrio</span>
          </div>
          <p class="text-gray-400 mb-4">
            Serving the community with digital excellence
          </p>
          <div class="flex justify-center space-x-4 text-sm text-gray-500">
            <span> 2024 Barangay Bagong Barrio</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import announcementService from "@/services/announcementService";
import AnnouncementCard from "@/components/AnnouncementCard.vue";
import AnnouncementCarousel from "@/components/AnnouncementCarousel.vue";
import AnnouncementModal from "@/components/AnnouncementModal.vue";
import PublicLayout from "@/layouts/PublicLayout.vue";

const authStore = useAuthStore();
const announcements = ref([]);
const showAnnouncementModal = ref(false);
const selectedAnnouncement = ref(null);

// Computed property to limit displayed announcements to 3
const displayedAnnouncements = computed(() => {
  return announcements.value.slice(0, 3);
});

// Format date helper function
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Handle read more click
const handleReadMore = (announcement) => {
  selectedAnnouncement.value = announcement;
  showAnnouncementModal.value = true;
};

// Fetch announcements from API
const fetchAnnouncements = async () => {
  try {
    const data = await announcementService.getAll();
    // Sort by date descending and take only active announcements
    announcements.value = data
      .filter(a => a.isActive)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch announcements:", error);
    // Keep announcements empty on error
    announcements.value = [];
  }
};

// Initialize authentication state and fetch announcements on component mount
onMounted(async () => {
  try {
    await authStore.initializeSession();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize authentication session:", error);
  }
  
  // Fetch announcements
  await fetchAnnouncements();
});
</script>

<style scoped>
/* Line clamp utilities for text truncation */
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
