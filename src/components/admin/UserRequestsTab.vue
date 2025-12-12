<template>
  <div class="space-y-6">
    <div class="card">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">User Requests</h2>
          <p class="text-sm text-gray-600 mt-1">
            Manage registration and password reset requests
          </p>
        </div>
        <button
          @click="fetchRequests"
          :disabled="loading"
          class="btn-outline text-sm"
        >
          <i
            :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"
            class="mr-2"
          ></i>
          Refresh
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <select v-model="typeFilter" class="form-input sm:w-48">
          <option value="">All Types</option>
          <option value="registration">Registration</option>
          <option value="password_reset">Password Reset</option>
        </select>
        <select v-model="statusFilter" class="form-input sm:w-48">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      <!-- Pending Count Badge -->
      <div v-if="pendingCount > 0" class="mb-4">
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <i class="fas fa-clock mr-2"></i>
          {{ pendingCount }} pending request{{ pendingCount !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <p class="mt-2 text-sm text-gray-600">Loading requests...</p>
      </div>

      <!-- Requests List -->
      <div v-else-if="requests.length > 0" class="space-y-4">
        <div
          v-for="request in requests"
          :key="request.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Type Badge -->
              <div class="flex items-center gap-2 mb-2">
                <span
                  :class="getTypeBadgeClass(request.type)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  <i :class="getTypeIcon(request.type)" class="mr-1"></i>
                  {{ formatType(request.type) }}
                </span>
                <span
                  :class="getStatusBadgeClass(request.status)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  <i :class="getStatusIcon(request.status)" class="mr-1"></i>
                  {{ formatStatus(request.status) }}
                </span>
              </div>

              <!-- Request Info -->
              <div class="mb-2">
                <p class="text-sm font-medium text-gray-900">
                  {{ getRequestTitle(request) }}
                </p>
                <p class="text-sm text-gray-600">{{ request.email }}</p>
              </div>

              <!-- Message (if any) -->
              <p v-if="request.message" class="text-sm text-gray-600 italic mb-2">
                "{{ request.message }}"
              </p>

              <!-- Metadata -->
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(request.createdAt) }}
                </span>
                <span v-if="request.ipAddress">
                  <i class="fas fa-network-wired mr-1"></i>
                  {{ request.ipAddress }}
                </span>
                <span v-if="request.processedBy">
                  <i class="fas fa-user-shield mr-1"></i>
                  Processed by {{ request.processedBy.firstName }} {{ request.processedBy.lastName }}
                </span>
              </div>

              <!-- Denial Reason -->
              <div v-if="request.denialReason" class="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p class="text-xs text-red-800">
                  <i class="fas fa-exclamation-circle mr-1"></i>
                  <strong>Denial Reason:</strong> {{ request.denialReason }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="request.status === 'pending'" class="flex flex-col gap-2 ml-4">
              <button
                @click="viewRequest(request)"
                class="btn-outline text-xs px-3 py-1.5 whitespace-nowrap"
                title="View Details"
              >
                <i class="fas fa-eye mr-1"></i>
                View
              </button>
              <button
                @click="approveRequest(request)"
                class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap"
                title="Approve Request"
              >
                <i class="fas fa-check mr-1"></i>
                Approve
              </button>
              <button
                @click="denyRequest(request)"
                class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap"
                title="Deny Request"
              >
                <i class="fas fa-times mr-1"></i>
                Deny
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <i class="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
        <p class="text-sm text-gray-500">No user requests found</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between border-t pt-4">
        <div class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn-outline text-sm px-4 py-2"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            <i class="fas fa-chevron-left mr-1"></i>
            Previous
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn-outline text-sm px-4 py-2"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
          >
            Next
            <i class="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- View Request Modal -->
  <ViewRequestModal
    :is-visible="showViewModal"
    :request="selectedRequest"
    @close="closeViewModal"
    @approve="approveRequest"
    @deny="denyRequest"
  />

  <!-- Approve Registration Modal -->
  <ConfirmationModal
    :is-visible="showApproveRegistrationModal"
    title="Approve Registration Request"
    :message="`Are you sure you want to approve the registration for ${selectedRequest?.userData?.firstName} ${selectedRequest?.userData?.lastName}?`"
    warning-message="This will create a new user account with Citizen role."
    confirm-text="Yes, Approve Registration"
    cancel-text="Cancel"
    loading-text="Approving..."
    type="success"
    :loading="processing"
    @confirm="confirmApproveRegistration"
    @cancel="showApproveRegistrationModal = false"
    @close="showApproveRegistrationModal = false"
  />

  <!-- Approve Password Reset Modal -->
  <div
    v-if="showApprovePasswordResetModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showApprovePasswordResetModal = false"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Approve Password Reset
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Enter a new temporary password for {{ selectedRequest?.email }}
      </p>
      <div class="mb-4">
        <label class="form-label">New Password</label>
        <input
          v-model="newPassword"
          type="text"
          class="form-input"
          placeholder="Enter temporary password"
        />
        <p class="text-xs text-gray-500 mt-1">
          User can change this password after logging in
        </p>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="showApprovePasswordResetModal = false"
          class="btn-outline"
          :disabled="processing"
        >
          Cancel
        </button>
        <button
          @click="confirmApprovePasswordReset"
          class="btn-primary"
          :disabled="processing || !newPassword"
        >
          <span v-if="processing" class="loading-spinner mr-2"></span>
          {{ processing ? 'Approving...' : 'Approve Reset' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Deny Request Modal -->
  <div
    v-if="showDenyModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showDenyModal = false"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Deny Request
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Please provide a reason for denying this request:
      </p>
      <div class="mb-4">
        <label class="form-label">Denial Reason</label>
        <textarea
          v-model="denialReason"
          rows="3"
          class="form-input"
          placeholder="Enter reason for denial..."
        ></textarea>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="showDenyModal = false"
          class="btn-outline"
          :disabled="processing"
        >
          Cancel
        </button>
        <button
          @click="confirmDeny"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          :disabled="processing || !denialReason"
        >
          <span v-if="processing" class="loading-spinner mr-2"></span>
          {{ processing ? 'Denying...' : 'Deny Request' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToastStore } from '@/stores/toast';
import api from '@/services/api';
import ViewRequestModal from './ViewRequestModal.vue';
import ConfirmationModal from '../common/ConfirmationModal.vue';

const toastStore = useToastStore();

const requests = ref([]);
const loading = ref(false);
const processing = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const total = ref(0);
const pendingCount = ref(0);
const typeFilter = ref('');
const statusFilter = ref('pending'); // Default to pending

const showViewModal = ref(false);
const showApproveRegistrationModal = ref(false);
const showApprovePasswordResetModal = ref(false);
const showDenyModal = ref(false);
const selectedRequest = ref(null);
const newPassword = ref('');
const denialReason = ref('');

// Fetch requests
const fetchRequests = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: 10,
    };
    
    if (typeFilter.value) params.type = typeFilter.value;
    if (statusFilter.value) params.status = statusFilter.value;

    const response = await api.get('/user-requests', { params });
    requests.value = response.data.requests;
    total.value = response.data.total;
    totalPages.value = response.data.pages;
  } catch (error) {
    toastStore.showError('Failed to fetch user requests');
    console.error('Error fetching requests:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch pending count
const fetchPendingCount = async () => {
  try {
    const response = await api.get('/user-requests/pending/count');
    pendingCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching pending count:', error);
  }
};

// Watch filters
watch([typeFilter, statusFilter], () => {
  currentPage.value = 1;
  fetchRequests();
});

// Pagination
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchRequests();
  }
};

// View request
const viewRequest = (request) => {
  selectedRequest.value = request;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedRequest.value = null;
};

// Approve request
const approveRequest = (request) => {
  selectedRequest.value = request;
  if (request.type === 'registration') {
    showApproveRegistrationModal.value = true;
  } else {
    newPassword.value = '';
    showApprovePasswordResetModal.value = true;
  }
};

const confirmApproveRegistration = async () => {
  try {
    processing.value = true;
    await api.patch(`/user-requests/${selectedRequest.value.id}/approve-registration`);
    toastStore.showSuccess('Registration approved successfully');
    showApproveRegistrationModal.value = false;
    selectedRequest.value = null;
    fetchRequests();
    fetchPendingCount();
  } catch (error) {
    toastStore.showError(error.response?.data?.message || 'Failed to approve registration');
  } finally {
    processing.value = false;
  }
};

const confirmApprovePasswordReset = async () => {
  try {
    processing.value = true;
    await api.patch(`/user-requests/${selectedRequest.value.id}/approve-password-reset`, {
      newPassword: newPassword.value,
    });
    toastStore.showSuccess('Password reset approved successfully');
    showApprovePasswordResetModal.value = false;
    selectedRequest.value = null;
    newPassword.value = '';
    fetchRequests();
    fetchPendingCount();
  } catch (error) {
    toastStore.showError(error.response?.data?.message || 'Failed to approve password reset');
  } finally {
    processing.value = false;
  }
};

// Deny request
const denyRequest = (request) => {
  selectedRequest.value = request;
  denialReason.value = '';
  showDenyModal.value = true;
};

const confirmDeny = async () => {
  try {
    processing.value = true;
    await api.patch(`/user-requests/${selectedRequest.value.id}/deny`, {
      denialReason: denialReason.value,
    });
    toastStore.showSuccess('Request denied successfully');
    showDenyModal.value = false;
    selectedRequest.value = null;
    denialReason.value = '';
    fetchRequests();
    fetchPendingCount();
  } catch (error) {
    toastStore.showError(error.response?.data?.message || 'Failed to deny request');
  } finally {
    processing.value = false;
  }
};

// Helper functions
const getRequestTitle = (request) => {
  if (request.type === 'registration' && request.userData) {
    return `${request.userData.firstName} ${request.userData.lastName}`;
  }
  if (request.type === 'password_reset' && request.user) {
    return `${request.user.firstName} ${request.user.lastName}`;
  }
  return request.email;
};

const formatType = (type) => {
  return type === 'registration' ? 'Registration' : 'Password Reset';
};

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTypeBadgeClass = (type) => {
  return type === 'registration'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-purple-100 text-purple-800';
};

const getTypeIcon = (type) => {
  return type === 'registration' ? 'fas fa-user-plus' : 'fas fa-key';
};

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  const icons = {
    pending: 'fas fa-clock',
    approved: 'fas fa-check',
    denied: 'fas fa-times',
  };
  return icons[status] || 'fas fa-question';
};

onMounted(() => {
  fetchRequests();
  fetchPendingCount();
});
</script>
