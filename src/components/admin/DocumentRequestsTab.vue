<template>
  <div class="document-requests-tab">
    <div class="header-section">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Document Requests</h2>
          <p class="text-gray-600 mb-6">Review and process citizen document requests</p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-plus mr-2"></i>
          New Request
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          @click="currentFilter = status.value"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            currentFilter === status.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ status.label }}
          <span
            v-if="getCountByStatus(status.value) > 0"
            class="ml-2 px-2 py-0.5 rounded-full text-xs"
            :class="currentFilter === status.value ? 'bg-blue-700' : 'bg-gray-300'"
          >
            {{ getCountByStatus(status.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading requests...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRequests.length === 0" class="text-center py-12">
      <i class="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-600 text-lg">No {{ currentFilter }} requests found</p>
    </div>

    <!-- Requests Table / List -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Desktop table -->
      <div class="hidden md:block">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Requested
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="request in paginatedRequests" :key="request.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ request.user.firstName }} {{ request.user.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">{{ request.user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ formatDocumentType(request.requestType) }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate" :title="request.purpose">
                    {{ request.purpose }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(request.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      getStatusClass(request.status)
                    ]"
                  >
                    {{ request.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button
                      v-if="request.status === 'pending'"
                      @click="openApproveModal(request)"
                      class="text-green-600 hover:text-green-900"
                      title="Approve"
                    >
                      <i class="fas fa-check-circle"></i> Approve
                    </button>
                    <button
                      v-if="request.status === 'pending'"
                      @click="openDenyModal(request)"
                      class="text-red-600 hover:text-red-900"
                      title="Deny"
                    >
                      <i class="fas fa-times-circle"></i> Deny
                    </button>
                    <button
                      @click="viewDetails(request)"
                      class="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <i class="fas fa-eye"></i> View
                    </button>
                    <button
                      v-if="request.status === 'approved' && request.generatedFilePath"
                      @click="downloadDocument(request.id)"
                      class="text-purple-600 hover:text-purple-900"
                      title="Download Document"
                    >
                      <i class="fas fa-download"></i> Download
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile list with 3-dot menu -->
      <div class="md:hidden divide-y divide-gray-200">
        <div
          v-for="request in paginatedRequests"
          :key="request.id"
          class="flex items-center justify-between p-4"
        >
          <div class="mr-3 flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate">
              {{ request.user.firstName }} {{ request.user.lastName }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDocumentType(request.requestType) }} • {{ formatDate(request.createdAt) }}
            </div>
            <div class="mt-1">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusClass(request.status)
                ]"
              >
                {{ request.status }}
              </span>
            </div>
          </div>
          <div class="relative flex-shrink-0">
            <button
              @click="toggleMobileRequestActions(request.id)"
              class="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div
              v-if="mobileActionsRequestId === request.id"
              class="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10"
            >
              <button
                v-if="request.status === 'pending'"
                @click="openApproveModal(request); mobileActionsRequestId = null;"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Approve
              </button>
              <button
                v-if="request.status === 'pending'"
                @click="openDenyModal(request); mobileActionsRequestId = null;"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Deny
              </button>
              <button
                @click="viewDetails(request); mobileActionsRequestId = null;"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>
              <button
                v-if="request.status === 'approved' && request.generatedFilePath"
                @click="downloadDocument(request.id); mobileActionsRequestId = null;"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredRequests.length) }}</span>
              of
              <span class="font-medium">{{ filteredRequests.length }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Request Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeCreateModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div class="mt-1">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium leading-6 text-gray-900">New Document Request</h3>
            <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form @submit.prevent="createRequest">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Citizen <span class="text-red-500">*</span></label>
                <select
                  v-model="createForm.userId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="usersLoading || users.length === 0"
                  required
                >
                  <option value="" disabled>Select a citizen</option>
                  <option
                    v-for="user in users"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                  </option>
                </select>
                <p v-if="usersLoading" class="mt-1 text-xs text-gray-500">Loading citizens...</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  v-model="createForm.requestType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="barangay_clearance">Barangay Clearance</option>
                  <option value="certificate_of_residency">Certificate of Residency</option>
                  <option value="certificate_of_indigency">Certificate of Indigency</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Purpose <span class="text-red-500">*</span></label>
                <textarea
                  v-model="createForm.purpose"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter purpose for this document"
                  required
                ></textarea>
              </div>
            </div>

            <div class="flex gap-3 justify-end mt-6">
              <button
                type="button"
                @click="closeCreateModal"
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="createSubmitting || !createForm.userId || !createForm.purpose.trim()"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <span v-if="createSubmitting">
                  <i class="fas fa-spinner fa-spin mr-1"></i>
                  Creating...
                </span>
                <span v-else>
                  <i class="fas fa-save mr-1"></i>
                  Create Request
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div
      v-if="showApproveModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeApproveModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Approve Document Request
          </h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500 mb-4">
              Approve request for <strong>{{ selectedRequest?.user.firstName }} {{ selectedRequest?.user.lastName }}</strong>?
            </p>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                v-model="approvalNotes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes..."
              ></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-4">
            <button
              @click="closeApproveModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              @click="approveRequest"
              :disabled="processing"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <span v-if="processing">
                <i class="fas fa-spinner fa-spin"></i> Processing...
              </span>
              <span v-else>
                <i class="fas fa-check"></i> Approve & Generate
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deny Modal -->
    <div
      v-if="showDenyModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeDenyModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Deny Document Request
          </h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500 mb-4">
              Deny request for <strong>{{ selectedRequest?.user.firstName }} {{ selectedRequest?.user.lastName }}</strong>?
            </p>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reason for Denial <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="denialReason"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide a reason..."
                required
              ></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-4">
            <button
              @click="closeDenyModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              @click="denyRequest"
              :disabled="processing || !denialReason.trim()"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <span v-if="processing">
                <i class="fas fa-spinner fa-spin"></i> Processing...
              </span>
              <span v-else>
                <i class="fas fa-times"></i> Deny Request
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeDetailsModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-2xl max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              Request Details
            </h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div v-if="selectedRequest" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Citizen Name</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedRequest.user.firstName }} {{ selectedRequest.user.lastName }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedRequest.user.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Document Type</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDocumentType(selectedRequest.requestType) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <p class="mt-1">
                  <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusClass(selectedRequest.status)]">
                    {{ selectedRequest.status }}
                  </span>
                </p>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Purpose</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedRequest.purpose }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date Requested</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedRequest.createdAt) }}</p>
              </div>
              <div v-if="selectedRequest.processedAt">
                <label class="block text-sm font-medium text-gray-700">Date Processed</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedRequest.processedAt) }}</p>
              </div>
              <div v-if="selectedRequest.processedBy" class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Processed By</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedRequest.processedBy.firstName }} {{ selectedRequest.processedBy.lastName }}
                </p>
              </div>
              <div v-if="selectedRequest.adminNotes" class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Admin Notes</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedRequest.adminNotes }}</p>
              </div>
              <div v-if="selectedRequest.denialReason" class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Denial Reason</label>
                <p class="mt-1 text-sm text-red-600">{{ selectedRequest.denialReason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToastStore } from '@/stores/toast';
import api from '@/services/api';

const toastStore = useToastStore();

// State
const requests = ref([]);
const loading = ref(false);
const processing = ref(false);
const currentFilter = ref('all');
const showCreateModal = ref(false);
const showApproveModal = ref(false);
const showDenyModal = ref(false);
const showDetailsModal = ref(false);
const selectedRequest = ref(null);
const approvalNotes = ref('');
const denialReason = ref('');
const createSubmitting = ref(false);
const createForm = ref({
  userId: '',
  requestType: 'barangay_clearance',
  purpose: '',
});
const users = ref([]);
const usersLoading = ref(false);
const mobileActionsRequestId = ref(null);
const currentPage = ref(1);
const itemsPerPage = 5;

// Filters
const statusFilters = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' }
];

// Computed
const filteredRequests = computed(() => {
  if (currentFilter.value === 'all') {
    return requests.value;
  }
  return requests.value.filter(req => req.status === currentFilter.value);
});

const totalPages = computed(() => Math.ceil(filteredRequests.value.length / itemsPerPage));

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRequests.value.slice(start, end);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxPages - 1);
  
  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Methods
const fetchRequests = async () => {
  try {
    loading.value = true;
    const response = await api.get('/documents/admin/all');
    requests.value = response.data.data || [];
    currentPage.value = 1; // Reset to first page after fetch
  } catch (error) {
    toastStore.showError('Failed to fetch document requests');
    console.error('Error fetching requests:', error);
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  if (users.value.length > 0) {
    return;
  }

  try {
    usersLoading.value = true;
    const response = await api.get('/users');
    users.value = response.data || [];
  } catch (error) {
    toastStore.showError('Failed to load citizens list');
    console.error('Error fetching users:', error);
  } finally {
    usersLoading.value = false;
  }
};

const getCountByStatus = (status) => {
  if (status === 'all') {
    return requests.value.length;
  }
  return requests.value.filter(req => req.status === status).length;
};

const formatDocumentType = (type) => {
  const types = {
    'barangay_clearance': 'Barangay Clearance',
    'certificate_of_residency': 'Certificate of Residency',
    'certificate_of_indigency': 'Certificate of Indigency'
  };
  return types[type] || type;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'denied': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const toggleMobileRequestActions = (id) => {
  mobileActionsRequestId.value =
    mobileActionsRequestId.value === id ? null : id;
};

const openCreateModal = async () => {
  await fetchUsers();
  createForm.value = {
    userId: '',
    requestType: 'barangay_clearance',
    purpose: '',
  };
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  createForm.value = {
    userId: '',
    requestType: 'barangay_clearance',
    purpose: '',
  };
  createSubmitting.value = false;
};

const createRequest = async () => {
  if (!createForm.value.userId || !createForm.value.purpose.trim()) {
    toastStore.showError('Please select a citizen and provide a purpose');
    return;
  }

  try {
    createSubmitting.value = true;
    await api.post('/documents/admin/requests', {
      userId: createForm.value.userId,
      requestType: createForm.value.requestType,
      purpose: createForm.value.purpose.trim(),
    });

    toastStore.showSuccess('Document request created successfully');
    closeCreateModal();
    await fetchRequests();
  } catch (error) {
    toastStore.showError('Failed to create document request');
    console.error('Error creating document request:', error);
  } finally {
    createSubmitting.value = false;
  }
};

const openApproveModal = (request) => {
  selectedRequest.value = request;
  approvalNotes.value = '';
  showApproveModal.value = true;
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  selectedRequest.value = null;
  approvalNotes.value = '';
};

const approveRequest = async () => {
  if (!selectedRequest.value) return;
  
  try {
    processing.value = true;
    const response = await api.post(
      `/documents/admin/requests/${selectedRequest.value.id}/approve`,
      { adminNotes: approvalNotes.value },
      { responseType: 'blob' }
    );
    
    // Download the generated document
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Clearance_${selectedRequest.value.user.lastName}_${new Date().toISOString().substring(0, 10)}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toastStore.showSuccess('Request approved and document generated!');
    closeApproveModal();
    await fetchRequests();
  } catch (error) {
    toastStore.showError('Failed to approve request');
    console.error('Error approving request:', error);
  } finally {
    processing.value = false;
  }
};

const openDenyModal = (request) => {
  selectedRequest.value = request;
  denialReason.value = '';
  showDenyModal.value = true;
};

const closeDenyModal = () => {
  showDenyModal.value = false;
  selectedRequest.value = null;
  denialReason.value = '';
};

const denyRequest = async () => {
  if (!selectedRequest.value || !denialReason.value.trim()) return;
  
  try {
    processing.value = true;
    await api.post(`/documents/admin/requests/${selectedRequest.value.id}/deny`, {
      denialReason: denialReason.value
    });
    
    toastStore.showSuccess('Request denied');
    closeDenyModal();
    await fetchRequests();
  } catch (error) {
    toastStore.showError('Failed to deny request');
    console.error('Error denying request:', error);
  } finally {
    processing.value = false;
  }
};

const viewDetails = (request) => {
  selectedRequest.value = request;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedRequest.value = null;
};

const downloadDocument = async (requestId) => {
  try {
    const response = await api.get(`/documents/download/${requestId}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Document_${requestId}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toastStore.showSuccess('Document downloaded');
  } catch (error) {
    toastStore.showError('Failed to download document');
    console.error('Error downloading document:', error);
  }
};

// Lifecycle
onMounted(() => {
  fetchRequests();
});
</script>

<style scoped>
.document-requests-tab {
  padding: 1.5rem;
}

.header-section {
  margin-bottom: 1.5rem;
}

.filters-section {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
