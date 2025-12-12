<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-4 pb-4 border-b">
        <h3 class="text-lg font-medium text-gray-900">User Profile Details</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal Content -->
      <div v-if="loading" class="text-center py-8">
        <i class="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
        <p class="mt-2 text-gray-600">Loading user data...</p>
      </div>
      <div v-else-if="displayUser" class="space-y-6">
        <!-- Personal Information -->
        <div>
          <h4 class="text-md font-semibold text-gray-900 mb-3 pb-2 border-b">Personal Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500">First Name</label>
              <p class="text-sm text-gray-900">{{ displayUser.firstName || '-' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Middle Name</label>
              <p class="text-sm text-gray-900">{{ displayUser.middleName || '-' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Last Name</label>
              <p class="text-sm text-gray-900">{{ displayUser.lastName || '-' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Suffix</label>
              <p class="text-sm text-gray-900">{{ displayUser.suffix || '-' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Date of Birth</label>
              <p class="text-sm text-gray-900">{{ formatDate(displayUser.dateOfBirth) }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Gender</label>
              <p class="text-sm text-gray-900">{{ formatGender(displayUser.gender) }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Civil Status</label>
              <p class="text-sm text-gray-900">{{ formatCivilStatus(displayUser.civilStatus) }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div>
          <h4 class="text-md font-semibold text-gray-900 mb-3 pb-2 border-b">Contact Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500">Email</label>
              <p class="text-sm text-gray-900">{{ displayUser.email || '-' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Phone Number</label>
              <p class="text-sm text-gray-900">{{ displayUser.phoneNumber || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div>
          <h4 class="text-md font-semibold text-gray-900 mb-3 pb-2 border-b">Address</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500">House Number</label>
              <p class="text-sm text-gray-900">{{ displayUser.houseNumber || '-' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Street</label>
              <p class="text-sm text-gray-900">{{ displayUser.street || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div>
          <h4 class="text-md font-semibold text-gray-900 mb-3 pb-2 border-b">Account Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500">Role</label>
              <p class="text-sm text-gray-900">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-purple-100 text-purple-800': displayUser.role === 'Super Admin',
                    'bg-blue-100 text-blue-800': displayUser.role === 'Admin',
                    'bg-green-100 text-green-800': displayUser.role === 'Citizen'
                  }">
                  {{ displayUser.role || 'Citizen' }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Status</label>
              <p class="text-sm text-gray-900">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': displayUser.status === 'Active',
                    'bg-red-100 text-red-800': displayUser.status === 'Inactive'
                  }">
                  {{ displayUser.status || 'Active' }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Profile Complete</label>
              <p class="text-sm text-gray-900">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': displayUser.isProfileComplete,
                    'bg-yellow-100 text-yellow-800': !displayUser.isProfileComplete
                  }">
                  {{ displayUser.isProfileComplete ? 'Complete' : 'Incomplete' }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Joined Date</label>
              <p class="text-sm text-gray-900">{{ displayUser.joinedDate || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="mt-6 flex justify-end space-x-3 pt-4 border-t">
        <button @click="closeModal" class="btn-outline">
          Close
        </button>
        <button @click="editUser" class="btn-primary">
          <i class="fas fa-edit mr-1"></i>
          Edit Profile
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, computed } from 'vue';
import api from '@/services/api';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'edit']);

const freshUserData = ref(null);
const loading = ref(false);

// Fetch fresh data from database when modal opens
watch(() => props.isVisible, async (isVisible) => {
  if (isVisible && props.user?.id) {
    loading.value = true;
    try {
      console.log('[ViewUserModal] Fetching fresh data for user:', props.user.id);
      const response = await api.get(`/users/${props.user.id}`);
      freshUserData.value = response.data;
      console.log('[ViewUserModal] Fresh user data loaded:', freshUserData.value);
    } catch (error) {
      console.error('[ViewUserModal] Error fetching user data:', error);
      // Fall back to props.user if fetch fails
      freshUserData.value = props.user;
    } finally {
      loading.value = false;
    }
  }
});

// Use fresh data if available, otherwise use props.user
const displayUser = computed(() => freshUserData.value || props.user);

const closeModal = () => {
  freshUserData.value = null;
  emit('close');
};

const editUser = () => {
  emit('edit', displayUser.value);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatGender = (gender) => {
  if (!gender) return '-';
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const formatCivilStatus = (status) => {
  if (!status) return '-';
  return status.charAt(0).toUpperCase() + status.slice(1);
};
</script>
