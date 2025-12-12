<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white">
    <!-- Modern Navigation Bar -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
                >
                  <i class="fas fa-building text-white text-sm"></i>
                </div>
              </div>
              <span class="ml-3 text-xl font-semibold text-gray-900"
                >Barangay Bagong Barrio</span
              >
            </router-link>
          </div>

          <!-- Desktop Navigation Links -->
          <div class="hidden lg:flex items-center space-x-8 transition-all duration-300 ease-in-out">
            <router-link
              to="/about"
              :class="isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'"
              class="px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out"
            >
              About
            </router-link>
            <router-link
              to="/contact"
              :class="isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'"
              class="px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out"
            >
              Contact Us
            </router-link>
            <router-link
              to="/services"
              :class="isActive('/services') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'"
              class="px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out"
            >
              Services
            </router-link>
            <router-link
              to="/request-document"
              class="cta-link"
            >
              Request a Document
            </router-link>
          </div>

          <!-- Authentication Section -->
          <div class="hidden lg:flex items-center space-x-4 transition-all duration-300 ease-in-out">
            <!-- Authenticated User -->
            <div v-if="authStore.isAuthenticated">
              <!-- Admin/Super Admin - Dashboard Link -->
              <router-link
                v-if="authStore.isAdmin"
                to="/dashboard"
                class="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
              >
                Dashboard
              </router-link>
              
              <!-- Citizen - Profile Dropdown -->
              <div v-else class="relative">
                <button
                  @click="toggleUserMenu"
                  class="flex items-center space-x-2 text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
                >
                  <i class="fas fa-user"></i>
                  <span>{{ authStore.user?.firstName }}</span>
                  <i class="fas fa-chevron-down text-xs"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <transition name="fade">
                  <div
                    v-if="showUserMenu"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div class="px-4 py-2 border-b border-gray-200">
                      <p class="text-sm font-medium text-gray-900">
                        {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                      </p>
                      <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                    </div>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <i class="fas fa-sign-out-alt mr-2"></i>
                      Logout
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Unauthenticated User - Unified Log In Button -->
            <div v-else>
              <router-link
                to="/login"
                class="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out"
              >
                Log In
              </router-link>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="lg:hidden flex items-center space-x-2">
            <!-- Mobile Auth Status -->
            <div
              v-if="authStore.isAuthenticated"
              class="flex items-center space-x-2"
            >
              <div
                class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
              ></div>
              <span class="text-xs text-gray-600 font-medium">
                {{ authStore.user?.firstName }}
              </span>
            </div>
            <button
              @click="toggleMobileMenu"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <transition name="slide-down">
          <div v-if="showMobileMenu" class="lg:hidden border-t border-gray-200">
            <div class="px-2 pt-2 pb-3 space-y-1">
              <router-link
                to="/about"
                @click="closeMobileMenu"
                :class="isActive('/about') ? 'text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'"
                class="block px-3 py-2 text-base font-medium transition-all duration-200"
              >
                About
              </router-link>
              <router-link
                to="/contact"
                @click="closeMobileMenu"
                :class="isActive('/contact') ? 'text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'"
                class="block px-3 py-2 text-base font-medium transition-all duration-200"
              >
                Contact Us
              </router-link>
              <router-link
                to="/services"
                @click="closeMobileMenu"
                :class="isActive('/services') ? 'text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'"
                class="block px-3 py-2 text-base font-medium transition-all duration-200"
              >
                Services
              </router-link>
              <router-link
                to="/request-document"
                @click="closeMobileMenu"
                :class="isActive('/request-document') ? 'text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'"
                class="block px-3 py-2 text-base font-medium transition-all duration-200"
              >
                Request a Document
              </router-link>
              
              <!-- Mobile Auth Section -->
              <div class="pt-4 pb-3 border-t border-gray-200">
                <!-- Admin/Super Admin - Dashboard Link -->
                <router-link
                  v-if="authStore.isAuthenticated && authStore.isAdmin"
                  to="/dashboard"
                  @click="closeMobileMenu"
                  class="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Dashboard
                </router-link>
                
                <!-- Citizen - Profile Info and Logout -->
                <div v-else-if="authStore.isAuthenticated" class="space-y-2">
                  <div class="px-4 py-2 bg-gray-50 rounded-lg">
                    <p class="text-sm font-medium text-gray-900">
                      {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                    </p>
                    <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                  </div>
                  <button
                    @click="handleLogout"
                    class="block w-full text-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                  >
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </button>
                </div>
                
                <!-- Unauthenticated - Login Link -->
                <router-link
                  v-else
                  to="/login"
                  @click="closeMobileMenu"
                  class="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Log In
                </router-link>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </nav>

    <!-- Page Content -->
    <slot></slot>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

const authStore = useAuthStore();
const toastStore = useToastStore();
const route = useRoute();
const router = useRouter();
const showMobileMenu = ref(false);
const showUserMenu = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  showUserMenu.value = false; // Close user menu when opening mobile menu
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

const isActive = (path) => {
  return route.path === path;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    toastStore.showSuccess("Logged out successfully");
    showUserMenu.value = false;
    showMobileMenu.value = false;
    router.push("/");
  } catch {
    toastStore.showError("Logout failed");
  }
};

// Close dropdowns when clicking outside
if (typeof document !== 'undefined') {
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".relative")) {
      showUserMenu.value = false;
    }
  });
}
</script>

<style scoped>
/* CTA Link Styles */
.cta-link {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  transform: scale(1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.cta-link:hover {
  background: linear-gradient(to right, #1d4ed8, #1e40af);
  transform: scale(1.05);
}

/* Slide down transition for mobile menu */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Fade transition for dropdown */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
