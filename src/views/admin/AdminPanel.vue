<template>
  <!-- Access Denied for Citizens -->
  <div
    v-if="!canAccessUserManagement"
    class="min-h-screen bg-gray-50 flex items-center justify-center"
  >
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mb-4">
        <i class="fas fa-shield-alt text-red-500 text-6xl"></i>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p class="text-gray-600 mb-6">
        You do not have permission to access the admin panel. This area is
        restricted to administrators only.
      </p>
      <router-link to="/dashboard" class="btn-primary">
        <i class="fas fa-arrow-left mr-2"></i>
        Return to Dashboard
      </router-link>
    </div>
  </div>

  <!-- Admin Panel Content -->
  <div v-else class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p class="mt-1 text-sm text-gray-600">
              Manage users, roles, and system settings
            </p>
            <div class="mt-2 flex items-center">
              <span class="text-xs text-gray-500 mr-2">Logged in as:</span>
              <span
                :class="getRoleBadgeClass(authStore.userRole)"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              >
                {{ authStore.userRole }}
              </span>
            </div>
          </div>
          <router-link to="/dashboard" class="btn-outline">
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Users Management Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">User Management</h2>
            <div class="flex space-x-2">
              <button
                @click="fetchUsers"
                :disabled="loading"
                class="btn-outline text-sm"
              >
                <i
                  :class="
                    loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'
                  "
                  class="mr-2"
                ></i>
                Refresh
              </button>
              <button
                @click="showAddUserModal = true"
                class="btn-primary text-sm"
              >
                <i class="fas fa-user-plus mr-2"></i>
                Add User
              </button>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="flex-1">
              <div class="relative">
                <input
                  v-model="userSearch"
                  type="text"
                  placeholder="Search users..."
                  class="form-input pl-10 pr-4"
                />
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <i class="fas fa-search text-gray-400 text-sm"></i>
                </div>
              </div>
            </div>
            <select v-model="roleFilter" class="form-input sm:w-48">
              <option value="">All Roles</option>
              <option value="Citizen">Citizen</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <!-- Users Table (Desktop) -->
          <div class="hidden lg:block overflow-x-auto">
            <div v-if="loading" class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
              <p class="mt-2 text-sm text-gray-600">Loading users...</p>
            </div>
            <table v-else class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Joined
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                        >
                          <i class="fas fa-user text-gray-500"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ user.firstName }} {{ user.lastName }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ user.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getRoleBadgeClass(user.role)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="
                        user.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      "
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      <i
                        :class="
                          user.status === 'Active'
                            ? 'fas fa-check'
                            : 'fas fa-times'
                        "
                        class="mr-1"
                      ></i>
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.joinedDate }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="viewUser(user)"
                      class="text-green-600 hover:text-green-900 mr-3"
                      title="View Profile"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="canEditSpecificUser(user)"
                      @click="editUser(user)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit User"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      v-if="canDeleteUsers"
                      @click="deleteUser(user)"
                      class="text-red-600 hover:text-red-900"
                      title="Delete User (Super Admin Only)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                    <span
                      v-if="!canEditSpecificUser(user) && !canDeleteUsers"
                      class="text-gray-400 text-sm"
                      title="Insufficient permissions for this user"
                    >
                      No permissions
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Users List (Mobile) -->
          <div class="lg:hidden divide-y divide-gray-200">
            <div
              v-for="user in paginatedUsers"
              :key="user.id"
              class="flex items-center justify-between p-4"
            >
              <div class="mr-3 flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ user.firstName }} {{ user.lastName }}
                </div>
                <div class="text-xs text-gray-500 truncate">
                  {{ user.email }}
                </div>
              </div>
              <div class="relative flex-shrink-0">
                <button
                  @click="toggleUserActions(user.id)"
                  class="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div
                  v-if="mobileActionsUserId === user.id"
                  class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                >
                  <button
                    @click="viewUser(user); mobileActionsUserId = null;"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View
                  </button>
                  <button
                    v-if="canEditSpecificUser(user)"
                    @click="editUser(user); mobileActionsUserId = null;"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canDeleteUsers"
                    @click="deleteUser(user); mobileActionsUserId = null;"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="usersTotalPages > 1" class="mt-6 px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white rounded-b-lg">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="usersCurrentPage--"
                :disabled="usersCurrentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="usersCurrentPage++"
                :disabled="usersCurrentPage === usersTotalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ (usersCurrentPage - 1) * usersItemsPerPage + 1 }}</span>
                  to
                  <span class="font-medium">{{ Math.min(usersCurrentPage * usersItemsPerPage, filteredUsers.length) }}</span>
                  of
                  <span class="font-medium">{{ filteredUsers.length }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    @click="usersCurrentPage--"
                    :disabled="usersCurrentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button
                    v-for="page in usersDisplayedPages"
                    :key="page"
                    @click="usersCurrentPage = page"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === usersCurrentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <button
                    @click="usersCurrentPage++"
                    :disabled="usersCurrentPage === usersTotalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Announcements Tab -->
      <div v-if="activeTab === 'announcements'">
        <AnnouncementsManagement @announcement-changed="handleAnnouncementChanged" />
      </div>

      <!-- Document Requests Tab -->
      <div v-if="activeTab === 'documents'">
        <DocumentRequestsTab />
      </div>

      <!-- Document Templates Tab -->
      <div v-if="activeTab === 'documentTemplates'">
        <DocumentTemplatesTab />
      </div>

      <!-- User Requests Tab -->
      <div v-if="activeTab === 'userRequests'">
        <UserRequestsTab />
      </div>

      <!-- Activity Logs Tab -->
      <div v-if="activeTab === 'logs'" class="space-y-4 sm:space-y-6">
        <div class="card">
          <!-- Mobile Header -->
          <div class="block lg:hidden mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Activity Logs</h2>
            </div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-600 font-medium">
                Total: {{ activityLogsStore.totalLogs }} logs
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="activityLogsStore.fetchLogs()"
                :disabled="activityLogsStore.loading"
                class="btn-outline py-3 text-base font-medium"
                title="Refresh activity logs"
              >
                <i 
                  :class="activityLogsStore.loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"
                  class="mr-2"
                ></i>
                Refresh
              </button>
              <button
                @click="showClearLogsConfirmation = true"
                class="btn-outline py-3 text-base font-medium"
                title="Clear all logs (Admin only)"
              >
                <i class="fas fa-trash mr-2"></i>
                Clear All
              </button>
            </div>
          </div>

          <!-- Desktop Header -->
          <div class="hidden lg:flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Activity Logs</h2>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-500">
                Total: {{ activityLogsStore.totalLogs }} logs
              </span>
              <button
                @click="activityLogsStore.fetchLogs()"
                :disabled="activityLogsStore.loading"
                class="btn-outline text-sm"
                title="Refresh activity logs"
              >
                <i 
                  :class="activityLogsStore.loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"
                  class="mr-2"
                ></i>
                Refresh
              </button>
              <button
                @click="showClearLogsConfirmation = true"
                class="btn-outline text-sm"
                title="Clear all logs (Admin only)"
              >
                <i class="fas fa-trash mr-2"></i>
                Clear All
              </button>
            </div>
          </div>

          <!-- Logs List -->
          <div class="space-y-3 sm:space-y-4 mb-6">
            <div
              v-for="log in activityLogs"
              :key="log.id"
              class="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex-shrink-0">
                <div :class="getLogIconClass(log.type)" class="rounded-lg p-2 sm:p-2.5">
                  <i :class="getLogIcon(log.type)" class="text-base sm:text-sm"></i>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h3 class="text-base sm:text-sm font-medium text-gray-900 leading-snug">
                      {{ log.title }}
                    </h3>
                    <p class="text-sm sm:text-sm text-gray-600 mt-2 leading-relaxed">
                      {{ log.description }}
                    </p>
                    
                    <!-- Summary of changes -->
                    <div
                      v-if="log.changes && Object.keys(log.changes).length > 0"
                      class="mt-3 flex items-center gap-2 text-sm sm:text-xs text-gray-500"
                    >
                      <i class="fas fa-edit"></i>
                      <span>{{ Object.keys(log.changes).length }} field(s) modified</span>
                    </div>

                    <div class="flex flex-wrap items-center mt-3 text-sm sm:text-xs text-gray-500 gap-x-2 gap-y-1">
                      <div class="flex items-center">
                        <i class="fas fa-user mr-1"></i>
                        <span>{{ log.userName }}</span>
                      </div>
                      <span class="hidden sm:inline">•</span>
                      <span class="capitalize">{{ log.userRole }}</span>
                      <span class="hidden sm:inline">•</span>
                      <span class="w-full sm:w-auto text-xs text-gray-400 mt-1 sm:mt-0">{{ log.displayTimestamp }}</span>
                    </div>
                  </div>
                  
                  <!-- View Details Button (Desktop) -->
                  <div class="hidden lg:block">
                    <button
                      @click="viewLogDetails(log)"
                      class="btn-outline text-xs px-3 py-1.5 whitespace-nowrap"
                      title="View full details"
                    >
                      <i class="fas fa-eye mr-1"></i>
                      Details
                    </button>
                  </div>
                  
                  <!-- View Details Button (Mobile) -->
                  <div class="lg:hidden flex-shrink-0">
                    <button
                      @click="viewLogDetails(log)"
                      class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="View full details"
                    >
                      <i class="fas fa-chevron-right text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="activityLogs.length === 0" class="text-center py-12 sm:py-8">
              <i class="fas fa-list-alt text-gray-400 text-5xl sm:text-4xl mb-4"></i>
              <p class="text-base sm:text-sm text-gray-500">No activity logs found</p>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="flex flex-col sm:flex-row items-center justify-between border-t pt-4 gap-3"
          >
            <div class="text-sm sm:text-sm text-gray-600 font-medium">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="activityLogsStore.prevPage()"
                :disabled="currentPage === 1"
                class="btn-outline text-sm sm:text-sm px-4 py-2"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
              >
                <i class="fas fa-chevron-left mr-1 sm:mr-1"></i>
                <span class="hidden sm:inline">Previous</span>
                <span class="sm:hidden">Prev</span>
              </button>

              <!-- Page numbers -->
              <div class="flex items-center space-x-1 sm:space-x-1">
                <button
                  v-for="page in getVisiblePages()"
                  :key="page"
                  @click="activityLogsStore.goToPage(page)"
                  class="px-3 py-2 text-sm rounded min-w-[40px]"
                  :class="
                    page === currentPage
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  "
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="activityLogsStore.nextPage()"
                :disabled="currentPage === totalPages"
                class="btn-outline text-sm sm:text-sm px-4 py-2"
                :class="{
                  'opacity-50 cursor-not-allowed': currentPage === totalPages,
                }"
              >
                Next
                <i class="fas fa-chevron-right ml-1 sm:ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- View User Modal -->
  <ViewUserModal
    :is-visible="showViewUserModal"
    :user="selectedUser"
    @close="closeViewModal"
    @edit="editUserFromView"
  />

  <!-- Edit User Modal -->
  <EditUserModal
    :is-visible="showEditUserModal"
    :user="selectedUser"
    @close="closeEditModal"
    @user-updated="handleUserUpdated"
  />

  <!-- Activity Log Details Modal -->
  <ActivityLogDetailsModal
    :is-visible="showLogDetailsModal"
    :log="selectedLog"
    @close="closeLogDetailsModal"
  />

  <!-- Clear Logs Confirmation Modal -->
  <ConfirmationModal
    :is-visible="showClearLogsConfirmation"
    title="Clear All Activity Logs"
    message="Are you sure you want to clear all activity logs? This will permanently delete all log entries from the database."
    warning-message="This action cannot be undone. All activity history will be lost forever."
    confirm-text="Yes, Clear All Logs"
    cancel-text="Cancel"
    loading-text="Clearing..."
    type="danger"
    :loading="clearingLogs"
    @confirm="handleClearAllLogs"
    @cancel="showClearLogsConfirmation = false"
    @close="showClearLogsConfirmation = false"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { useAuthStore } from "@/stores/auth";
import { useActivityLogsStore } from "@/stores/activityLogs";
import api from "@/services/api";
import ViewUserModal from "@/components/admin/ViewUserModal.vue";
import EditUserModal from "@/components/admin/EditUserModal.vue";
import ActivityLogDetailsModal from "@/components/admin/ActivityLogDetailsModal.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";
import AnnouncementsManagement from "@/views/admin/AnnouncementsManagement.vue";
import DocumentRequestsTab from "@/components/admin/DocumentRequestsTab.vue";
import DocumentTemplatesTab from "@/components/admin/DocumentTemplatesTab.vue";
import UserRequestsTab from "@/components/admin/UserRequestsTab.vue";

const toastStore = useToastStore();
const authStore = useAuthStore();
const activityLogsStore = useActivityLogsStore();
const route = useRoute();

const validAdminTabs = [
  "announcements",
  "documents",
  "documentTemplates",
  "users",
  "userRequests",
  "logs",
];
const activeTab = ref("announcements");

const syncActiveTabWithRoute = () => {
  const tabParam = route.query.tab;
  if (typeof tabParam === "string" && validAdminTabs.includes(tabParam)) {
    activeTab.value = tabParam;
  } else {
    activeTab.value = "announcements";
  }
};

syncActiveTabWithRoute();

watch(
  () => route.query.tab,
  () => {
    syncActiveTabWithRoute();
  },
);

// Watch for tab changes and refresh activity logs when switching to logs tab
watch(activeTab, (newTab) => {
  if (newTab === "logs" && authStore.accessToken) {
    activityLogsStore.fetchLogs();
  }
});
const userSearch = ref("");
const roleFilter = ref("");
const showAddUserModal = ref(false);
const showViewUserModal = ref(false);
const showEditUserModal = ref(false);
const selectedUser = ref(null);
const showLogDetailsModal = ref(false);
const selectedLog = ref(null);
const loading = ref(false);
const mobileActionsUserId = ref(null);
const showClearLogsConfirmation = ref(false);
const clearingLogs = ref(false);
const usersCurrentPage = ref(1);
const usersItemsPerPage = 5;

// Role-based permissions
const canDeleteUsers = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Super Admin";
});

const canAccessUserManagement = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Admin" || userRole === "Super Admin";
});

// Check if current user can edit a specific user based on role hierarchy
const canEditSpecificUser = (targetUser) => {
  const currentUserRole = authStore.userRole;
  const targetUserRole = targetUser.role;

  // Super Admin can edit anyone
  if (currentUserRole === "Super Admin") {
    return true;
  }

  // Admin can only edit Citizens
  if (currentUserRole === "Admin") {
    return targetUserRole === "Citizen";
  }

  // Citizens cannot edit anyone
  return false;
};

const tabs = [
  { key: "announcements", label: "Announcements", icon: "fas fa-bullhorn" },
  { key: "documents", label: "Document Requests", icon: "fas fa-file-alt" },
  { key: "users", label: "Users", icon: "fas fa-users" },
  { key: "logs", label: "Activity Logs", icon: "fas fa-list-alt" },
];

// Real users data from backend
const users = ref([]);

// Fetch users from backend
const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await api.get("/users");
    users.value = response.data;
  } catch (error) {
    toastStore.showError("Failed to fetch users");
    // eslint-disable-next-line no-console
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(userSearch.value.toLowerCase());
    const matchesRole = !roleFilter.value || user.role === roleFilter.value;
    return matchesSearch && matchesRole;
  });
});

const usersTotalPages = computed(() => Math.ceil(filteredUsers.value.length / usersItemsPerPage));

const paginatedUsers = computed(() => {
  const start = (usersCurrentPage.value - 1) * usersItemsPerPage;
  const end = start + usersItemsPerPage;
  return filteredUsers.value.slice(start, end);
});

const usersDisplayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let startPage = Math.max(1, usersCurrentPage.value - Math.floor(maxPages / 2));
  let endPage = Math.min(usersTotalPages.value, startPage + maxPages - 1);
  
  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

const getRoleBadgeClass = (role) => {
  const classes = {
    Citizen: "bg-blue-100 text-blue-800",
    Admin: "bg-green-100 text-green-800",
    "Super Admin": "bg-purple-100 text-purple-800",
  };
  return classes[role] || "bg-gray-100 text-gray-800";
};

const getLogIcon = (type) => {
  const icons = {
    user: "fas fa-user text-blue-600",
    security: "fas fa-shield-alt text-green-600",
    system: "fas fa-cog text-purple-600",
  };
  return icons[type] || "fas fa-info-circle text-gray-600";
};

const getLogIconClass = (type) => {
  const classes = {
    user: "bg-blue-100",
    security: "bg-green-100",
    system: "bg-purple-100",
  };
  return classes[type] || "bg-gray-100";
};

// Helper method for pagination
const getVisiblePages = () => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show smart pagination
    if (current <= 4) {
      // Show first 5 pages + ... + last page
      for (let i = 1; i <= 5; i++) pages.push(i);
      if (total > 6) pages.push("...", total);
    } else if (current >= total - 3) {
      // Show first page + ... + last 5 pages
      pages.push(1, "...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      // Show first + ... + current-1, current, current+1 + ... + last
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
  }

  return pages.filter(
    (page) => page !== "..." || pages.indexOf(page) === pages.lastIndexOf(page),
  );
};

// Activity logs data from store
const activityLogs = computed(() => activityLogsStore.paginatedLogs);
const currentPage = computed(() => activityLogsStore.currentPage);
const totalPages = computed(() => activityLogsStore.totalPages);

// Add activity log entry with change tracking
const addActivityLog = async (
  title,
  description,
  type = "system",
  changes = null,
) => {
  // Get current user info from auth store
  const currentUserInfo = {
    userId: authStore.user?.id || null,
    userEmail: authStore.user?.email || "Unknown",
    userName:
      `${authStore.user?.firstName || ""} ${authStore.user?.lastName || ""}`.trim() ||
      "Unknown User",
    userRole: authStore.userRole || "Unknown Role",
  };

  await activityLogsStore.addLogWithUserInfo(
    title,
    description,
    type,
    changes,
    currentUserInfo,
  );
};

const editUser = async (user) => {
  if (!canEditSpecificUser(user)) {
    toastStore.showError(
      `You do not have permission to edit ${user.role} users`,
    );
    return;
  }

  selectedUser.value = user;
  showEditUserModal.value = true;
};

const deleteUser = async (user) => {
  if (!canDeleteUsers.value) {
    toastStore.showError("You do not have permission to delete users");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    // In a real app, this would be an API call to delete the user
    // await api.delete(`/users/${user.id}`);

    // For now, just remove from local array and show success
    const index = users.value.findIndex((u) => u.id === user.id);
    if (index > -1) {
      users.value.splice(index, 1);
    }

    toastStore.showSuccess(
      `User ${user.firstName} ${user.lastName} deleted successfully`,
    );
    await addActivityLog(
      "User Deleted",
      `${authStore.user?.firstName || "Super Admin"} deleted user ${user.firstName} ${user.lastName}`,
      "user",
    );
  } catch (error) {
    toastStore.showError(`Failed to delete user: ${error.message}`);
  }
};

const toggleUserActions = (id) => {
  mobileActionsUserId.value =
    mobileActionsUserId.value === id ? null : id;
};

// Modal event handlers
const viewUser = (user) => {
  selectedUser.value = user;
  showViewUserModal.value = true;
};

const closeViewModal = () => {
  showViewUserModal.value = false;
  selectedUser.value = null;
};

const editUserFromView = (user) => {
  // Close view modal and open edit modal
  showViewUserModal.value = false;
  showEditUserModal.value = true;
  // selectedUser is already set
};

const viewLogDetails = (log) => {
  selectedLog.value = log;
  showLogDetailsModal.value = true;
};

const closeLogDetailsModal = () => {
  showLogDetailsModal.value = false;
  selectedLog.value = null;
};

const closeEditModal = () => {
  showEditUserModal.value = false;
  selectedUser.value = null;
};

const handleUserUpdated = async (updatedUser) => {
  // Find the original user to track changes
  const originalUser = users.value.find((u) => u.id === updatedUser.id);

  // Track ALL field changes
  const changes = {};
  if (originalUser) {
    // List of all fields to track
    const fieldsToTrack = [
      'firstName', 'middleName', 'lastName', 'suffix',
      'email', 'phoneNumber', 
      'dateOfBirth', 'gender', 'civilStatus',
      'houseNumber', 'street',
      'role', 'status'
    ];

    fieldsToTrack.forEach(field => {
      if (originalUser[field] !== updatedUser[field]) {
        changes[field] = {
          from: originalUser[field] || '',
          to: updatedUser[field] || '',
        };
      }
    });
  }

  // Update the user in the users array
  const index = users.value.findIndex((u) => u.id === updatedUser.id);
  if (index > -1) {
    users.value[index] = updatedUser;
  }

  // Create simple description without listing changes
  const changeDescription = `${authStore.user?.firstName || "Admin"} updated profile for user ${updatedUser.firstName} ${updatedUser.lastName}`;

  await addActivityLog(
    "User Profile Updated",
    changeDescription,
    "user",
    changes,
  );
};

// Handle announcement changes - refresh activity logs
const handleAnnouncementChanged = () => {
  if (authStore.accessToken) {
    activityLogsStore.fetchLogs();
  }
};

// Handle clear all logs with confirmation
const handleClearAllLogs = async () => {
  try {
    clearingLogs.value = true;
    await activityLogsStore.clearAllLogs();
    showClearLogsConfirmation.value = false;
    toastStore.showSuccess("All activity logs cleared successfully");
  } catch (error) {
    toastStore.showError("Failed to clear activity logs");
  } finally {
    clearingLogs.value = false;
  }
};

onMounted(() => {
  fetchUsers();
  // Fetch activity logs if user is authenticated
  if (authStore.accessToken) {
    activityLogsStore.fetchLogs();
  }
});
</script>
