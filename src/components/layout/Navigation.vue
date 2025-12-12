<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link :to="authStore.isAdmin ? '/dashboard' : '/'" class="flex items-center space-x-2">
            <div
              class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
            >
              <i class="fas fa-building text-white text-sm"></i>
            </div>
            <span class="text-xl font-semibold text-gray-900">BRGY Portal</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center space-x-4">
          <router-link
            v-if="authStore.isAdmin"
            :to="{ path: '/admin', query: { tab: 'announcements' } }"
            :class="adminNavLinkClass('announcements')"
            class="nav-link"
          >
            <i class="fas fa-bullhorn mr-2"></i>
            Announcements
          </router-link>
          <div
            v-if="authStore.isAdmin"
            class="relative documents-menu-container"
          >
            <button
              @click.stop="toggleDocumentsMenu"
              :class="[
                'nav-link flex items-center',
                isDocumentsSectionActive ? 'nav-link-active' : ''
              ]"
            >
              <i class="fas fa-file-alt mr-2"></i>
              <span>Documents</span>
              <i class="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            <transition name="fade">
              <div
                v-if="showDocumentsMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40"
              >
                <router-link
                  :to="{ path: '/admin', query: { tab: 'documents' } }"
                  :class="[
                    'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                    adminNavLinkClass('documents')
                  ]"
                  @click="closeDocumentsMenus"
                >
                  <i class="fas fa-inbox mr-2"></i>
                  Requests
                </router-link>
                <router-link
                  :to="{ path: '/admin', query: { tab: 'documentTemplates' } }"
                  :class="[
                    'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                    adminNavLinkClass('documentTemplates')
                  ]"
                  @click="closeDocumentsMenus"
                >
                  <i class="fas fa-file-signature mr-2"></i>
                  Templates
                </router-link>
              </div>
            </transition>
          </div>
          <div
            v-if="authStore.isAdmin"
            class="relative users-menu-container"
          >
            <button
              @click.stop="toggleUsersMenu"
              :class="[
                'nav-link flex items-center',
                isUsersSectionActive ? 'nav-link-active' : ''
              ]"
            >
              <i class="fas fa-users mr-2"></i>
              <span>Users</span>
              <i class="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            <transition name="fade">
              <div
                v-if="showUsersMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40"
              >
                <router-link
                  :to="{ path: '/admin', query: { tab: 'users' } }"
                  :class="[
                    'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                    adminNavLinkClass('users')
                  ]"
                  @click="closeUsersMenus"
                >
                  <i class="fas fa-list mr-2"></i>
                  List
                </router-link>
                <router-link
                  :to="{ path: '/admin', query: { tab: 'userRequests' } }"
                  :class="[
                    'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                    adminNavLinkClass('userRequests')
                  ]"
                  @click="closeUsersMenus"
                >
                  <i class="fas fa-user-clock mr-2"></i>
                  Requests
                </router-link>
              </div>
            </transition>
          </div>
          <router-link
            v-if="authStore.isAdmin"
            :to="{ path: '/admin', query: { tab: 'logs' } }"
            :class="adminNavLinkClass('logs')"
            class="nav-link"
          >
            <i class="fas fa-list-alt mr-2"></i>
            Activity Logs
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <div class="relative user-menu-container">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 hover:bg-gray-100"
            >
              <div
                class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <i class="fas fa-user text-blue-600"></i>
              </div>
              <span class="hidden lg:block font-medium text-gray-700">
                {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
              </span>
              <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
            </button>

            <!-- Dropdown Menu -->
            <transition name="fade">
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-900">
                    {{ authStore.user?.firstName }}
                    {{ authStore.user?.lastName }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ authStore.user?.email }}
                  </p>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1"
                  >
                    {{ authStore.userRole }}
                  </span>
                  <!-- Session Status -->
                  <div class="mt-2 flex items-center justify-between">
                    <span class="text-xs text-gray-600">Session:</span>
                    <div class="flex items-center space-x-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        :class="sessionStatusClass"
                      ></div>
                      <span class="text-xs" :class="sessionStatusTextClass">
                        {{ sessionStatusText }}
                      </span>
                    </div>
                  </div>
                  <div v-if="authStore.sessionTimeRemaining > 0" class="mt-1">
                    <div class="text-xs text-gray-600">
                      Time remaining:
                      {{ formatSessionTime(authStore.sessionTimeRemaining) }}
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        class="bg-blue-600 h-1 rounded-full transition-all duration-1000"
                        :style="{ width: sessionProgressPercentage + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  <i class="fas fa-user-circle mr-2"></i>
                  Profile
                </router-link>
                <button
                  @click="handleExtendSession"
                  class="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                >
                  <i class="fas fa-clock mr-2"></i>
                  Extend Session
                </button>
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

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 mobile-menu-toggle"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <transition name="fade">
        <div
          v-if="showMobileMenu"
          class="lg:hidden border-t border-gray-200 py-2 mobile-menu-container"
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            <router-link
              v-if="authStore.isAdmin"
              :to="{ path: '/admin', query: { tab: 'announcements' } }"
              :class="adminNavLinkClass('announcements')"
              class="block px-3 py-2 rounded-md text-base font-medium"
              @click="showMobileMenu = false"
            >
              <i class="fas fa-bullhorn mr-2"></i>
              Announcements
            </router-link>
            <div
              v-if="authStore.isAdmin"
              class="mobile-documents-menu-container"
            >
              <button
                @click="toggleMobileDocumentsMenu"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                <span>
                  <i class="fas fa-file-alt mr-2"></i>
                  Documents
                </span>
                <i
                  :class="[
                    'fas text-xs transition-transform',
                    showMobileDocumentsMenu ? 'fa-chevron-up' : 'fa-chevron-down'
                  ]"
                ></i>
              </button>
              <div v-if="showMobileDocumentsMenu" class="mt-1 space-y-1 pl-6">
                <router-link
                  :to="{ path: '/admin', query: { tab: 'documents' } }"
                  :class="[
                    'block px-3 py-2 rounded-md text-base font-medium',
                    adminNavLinkClass('documents')
                  ]"
                  @click="
                    showMobileMenu = false;
                    showMobileDocumentsMenu = false;
                  "
                >
                  <i class="fas fa-inbox mr-2"></i>
                  Requests
                </router-link>
                <router-link
                  :to="{ path: '/admin', query: { tab: 'documentTemplates' } }"
                  :class="[
                    'block px-3 py-2 rounded-md text-base font-medium',
                    adminNavLinkClass('documentTemplates')
                  ]"
                  @click="
                    showMobileMenu = false;
                    showMobileDocumentsMenu = false;
                  "
                >
                  <i class="fas fa-file-signature mr-2"></i>
                  Templates
                </router-link>
              </div>
            </div>
            <div
              v-if="authStore.isAdmin"
              class="mobile-users-menu-container"
            >
              <button
                @click="toggleMobileUsersMenu"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                <span>
                  <i class="fas fa-users mr-2"></i>
                  Users
                </span>
                <i
                  :class="[
                    'fas text-xs transition-transform',
                    showMobileUsersMenu ? 'fa-chevron-up' : 'fa-chevron-down'
                  ]"
                ></i>
              </button>
              <div v-if="showMobileUsersMenu" class="mt-1 space-y-1 pl-6">
                <router-link
                  :to="{ path: '/admin', query: { tab: 'users' } }"
                  :class="[
                    'block px-3 py-2 rounded-md text-base font-medium',
                    adminNavLinkClass('users')
                  ]"
                  @click="
                    showMobileMenu = false;
                    showMobileUsersMenu = false;
                  "
                >
                  <i class="fas fa-list mr-2"></i>
                  List
                </router-link>
                <router-link
                  :to="{ path: '/admin', query: { tab: 'userRequests' } }"
                  :class="[
                    'block px-3 py-2 rounded-md text-base font-medium',
                    adminNavLinkClass('userRequests')
                  ]"
                  @click="
                    showMobileMenu = false;
                    showMobileUsersMenu = false;
                  "
                >
                  <i class="fas fa-user-clock mr-2"></i>
                  Requests
                </router-link>
              </div>
            </div>
            <router-link
              v-if="authStore.isAdmin"
              :to="{ path: '/admin', query: { tab: 'logs' } }"
              :class="adminNavLinkClass('logs')"
              class="block px-3 py-2 rounded-md text-base font-medium"
              @click="showMobileMenu = false"
            >
              <i class="fas fa-list-alt mr-2"></i>
              Activity Logs
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);
const showDocumentsMenu = ref(false);
const showMobileDocumentsMenu = ref(false);
const showUsersMenu = ref(false);
const showMobileUsersMenu = ref(false);

// Session management computed properties
const sessionStatusClass = computed(() => {
  const remaining = authStore.sessionTimeRemaining;
  if (remaining <= 5 * 60 * 1000) return "bg-red-500"; // Less than 5 minutes
  if (remaining <= 10 * 60 * 1000) return "bg-yellow-500"; // Less than 10 minutes
  return "bg-green-500"; // More than 10 minutes
});

const sessionStatusText = computed(() => {
  const remaining = authStore.sessionTimeRemaining;
  if (remaining <= 5 * 60 * 1000) return "Expiring Soon";
  if (remaining <= 10 * 60 * 1000) return "Warning";
  return "Active";
});

const sessionStatusTextClass = computed(() => {
  const remaining = authStore.sessionTimeRemaining;
  if (remaining <= 5 * 60 * 1000) return "text-red-600";
  if (remaining <= 10 * 60 * 1000) return "text-yellow-600";
  return "text-green-600";
});

const sessionProgressPercentage = computed(() => {
  const totalSessionTime = 30 * 60 * 1000; // 30 minutes
  const remaining = authStore.sessionTimeRemaining;
  return Math.max(0, Math.min(100, (remaining / totalSessionTime) * 100));
});

const formatSessionTime = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const navLinkClass = (routeName) => {
  return route.name === routeName ? "nav-link-active" : "";
};

const adminNavLinkClass = (tabKey) => {
  const isAdminRoute = route.name === "admin";
  const currentTab = typeof route.query.tab === "string" ? route.query.tab : null;
  return isAdminRoute && currentTab === tabKey ? "nav-link-active" : "";
};
const isDocumentsSectionActive = computed(() => {
  const isAdminRoute = route.name === "admin";
  const currentTab =
    typeof route.query.tab === "string" ? route.query.tab : null;
  return (
    isAdminRoute &&
    (currentTab === "documents" || currentTab === "documentTemplates")
  );
});

const isUsersSectionActive = computed(() => {
  const isAdminRoute = route.name === "admin";
  const currentTab =
    typeof route.query.tab === "string" ? route.query.tab : null;
  return (
    isAdminRoute &&
    (currentTab === "users" || currentTab === "userRequests")
  );
});

const closeDocumentsMenus = () => {
  showDocumentsMenu.value = false;
  showMobileDocumentsMenu.value = false;
};

const closeUsersMenus = () => {
  showUsersMenu.value = false;
  showMobileUsersMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showMobileMenu.value = false;
  closeDocumentsMenus();
  closeUsersMenus();
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  showUserMenu.value = false;
  showDocumentsMenu.value = false;
  showUsersMenu.value = false;
  if (!showMobileMenu.value) {
    showMobileDocumentsMenu.value = false;
    showMobileUsersMenu.value = false;
  }
};

const toggleDocumentsMenu = () => {
  showDocumentsMenu.value = !showDocumentsMenu.value;
  showUserMenu.value = false;
  showMobileMenu.value = false;
  showUsersMenu.value = false;
};

const toggleUsersMenu = () => {
  showUsersMenu.value = !showUsersMenu.value;
  showUserMenu.value = false;
  showMobileMenu.value = false;
  showDocumentsMenu.value = false;
};

const toggleMobileDocumentsMenu = () => {
  showMobileDocumentsMenu.value = !showMobileDocumentsMenu.value;
};

const toggleMobileUsersMenu = () => {
  showMobileUsersMenu.value = !showMobileUsersMenu.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    toastStore.showSuccess("Logged out successfully");
    router.push("/login");
  } catch {
    toastStore.showError("Logout failed");
  }
  showUserMenu.value = false;
};

const handleExtendSession = async () => {
  try {
    await authStore.extendSession();
    showUserMenu.value = false;
  } catch {
    // Error is handled by the auth store
  }
};

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  const target = event.target;

  // User menu: only close if click is outside the user menu container
  const isInUserMenu = target.closest(".user-menu-container");
  if (!isInUserMenu) {
    showUserMenu.value = false;
  }

  const isInDocumentsMenu = target.closest(".documents-menu-container");
  if (!isInDocumentsMenu) {
    showDocumentsMenu.value = false;
  }

  const isInUsersMenu = target.closest(".users-menu-container");
  if (!isInUsersMenu) {
    showUsersMenu.value = false;
  }

  // Mobile menu: only close if click is outside the mobile menu and the hamburger button
  const isInMobileMenu =
    target.closest(".mobile-menu-container") ||
    target.closest(".mobile-menu-toggle");
  if (!isInMobileMenu) {
    showMobileMenu.value = false;
    showMobileDocumentsMenu.value = false;
    showMobileUsersMenu.value = false;
  }
});
</script>
