<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">Request Details</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Content -->
      <div v-if="request" class="p-6 space-y-6">
        <!-- Type and Status -->
        <div class="flex items-center gap-3">
          <span
            :class="getTypeBadgeClass(request.type)"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          >
            <i :class="getTypeIcon(request.type)" class="mr-2"></i>
            {{ formatType(request.type) }}
          </span>
          <span
            :class="getStatusBadgeClass(request.status)"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          >
            <i :class="getStatusIcon(request.status)" class="mr-2"></i>
            {{ formatStatus(request.status) }}
          </span>
        </div>

        <!-- Registration Request Details -->
        <div v-if="request.type === 'registration' && request.userData" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">
            Registration Information
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">First Name</label>
              <p class="text-sm text-gray-900">{{ request.userData.firstName }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Last Name</label>
              <p class="text-sm text-gray-900">{{ request.userData.lastName }}</p>
            </div>
            <div v-if="request.userData.middleName">
              <label class="text-sm font-medium text-gray-600">Middle Name</label>
              <p class="text-sm text-gray-900">{{ request.userData.middleName }}</p>
            </div>
            <div v-if="request.userData.suffix">
              <label class="text-sm font-medium text-gray-600">Suffix</label>
              <p class="text-sm text-gray-900">{{ request.userData.suffix }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Email</label>
              <p class="text-sm text-gray-900">{{ request.userData.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Phone Number</label>
              <p class="text-sm text-gray-900">{{ request.userData.phoneNumber }}</p>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600">Address</label>
            <p class="text-sm text-gray-900">
              {{ formatAddress(request.userData) }}
            </p>
          </div>
        </div>

        <!-- Password Reset Request Details -->
        <div v-if="request.type === 'password_reset'" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">
            Password Reset Request
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">Email</label>
              <p class="text-sm text-gray-900">{{ request.email }}</p>
            </div>
            <div v-if="request.user">
              <label class="text-sm font-medium text-gray-600">User Name</label>
              <p class="text-sm text-gray-900">
                {{ request.user.firstName }} {{ request.user.lastName }}
              </p>
            </div>
          </div>

          <div v-if="request.message">
            <label class="text-sm font-medium text-gray-600">Message</label>
            <p class="text-sm text-gray-900 italic">"{{ request.message }}"</p>
          </div>
        </div>

        <!-- Request Metadata -->
        <div class="space-y-4 border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900">Request Metadata</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">Submitted On</label>
              <p class="text-sm text-gray-900">{{ formatDate(request.createdAt) }}</p>
            </div>
            <div v-if="request.ipAddress">
              <label class="text-sm font-medium text-gray-600">IP Address</label>
              <p class="text-sm text-gray-900">{{ request.ipAddress }}</p>
            </div>
            <div v-if="request.processedBy" class="md:col-span-2">
              <label class="text-sm font-medium text-gray-600">Processed By</label>
              <p class="text-sm text-gray-900">
                {{ request.processedBy.firstName }} {{ request.processedBy.lastName }}
                <span class="text-gray-500">
                  on {{ formatDate(request.processedAt) }}
                </span>
              </p>
            </div>
            <div v-if="request.denialReason" class="md:col-span-2">
              <label class="text-sm font-medium text-gray-600">Denial Reason</label>
              <div class="mt-1 p-3 bg-red-50 border border-red-200 rounded">
                <p class="text-sm text-red-800">{{ request.denialReason }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- User Agent (collapsed by default) -->
        <div v-if="request.userAgent" class="border-t pt-4">
          <button
            @click="showUserAgent = !showUserAgent"
            class="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <i
              :class="showUserAgent ? 'fa-chevron-down' : 'fa-chevron-right'"
              class="fas mr-2"
            ></i>
            User Agent
          </button>
          <div v-if="showUserAgent" class="mt-2 p-3 bg-gray-50 rounded">
            <p class="text-xs text-gray-700 font-mono break-all">
              {{ request.userAgent }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        v-if="request && request.status === 'pending'"
        class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3"
      >
        <button @click="$emit('close')" class="btn-outline">
          Close
        </button>
        <button
          @click="$emit('deny', request)"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          <i class="fas fa-times mr-2"></i>
          Deny
        </button>
        <button
          @click="$emit('approve', request)"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          <i class="fas fa-check mr-2"></i>
          Approve
        </button>
      </div>
      <div
        v-else
        class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end"
      >
        <button @click="$emit('close')" class="btn-primary">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  request: {
    type: Object,
    default: null,
  },
});

defineEmits(['close', 'approve', 'deny']);

const showUserAgent = ref(false);

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAddress = (userData) => {
  const parts = [];
  if (userData.houseNumber) parts.push(userData.houseNumber);
  if (userData.street) parts.push(userData.street);
  if (userData.barangay) parts.push(`Barangay ${userData.barangay}`);
  if (userData.city) parts.push(userData.city);
  return parts.join(', ') || 'N/A';
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
</script>
