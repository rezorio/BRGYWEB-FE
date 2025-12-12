<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4"
    @click="closeModal"
  >
    <div
      class="relative top-4 md:top-20 mx-auto p-4 md:p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b">
        <div class="flex items-center space-x-3">
          <div class="bg-blue-100 rounded-full p-2">
            <i class="fas fa-user text-blue-600 text-lg"></i>
          </div>
          <h3 class="text-lg md:text-xl font-semibold text-gray-900">Activity Log Details</h3>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Modal Content -->
      <div v-if="log" class="space-y-4">
        <!-- Changes List (for updates/edits) -->
        <div v-if="log.changes && Object.keys(log.changes).length > 0">
          <h4 class="text-base font-semibold text-gray-900 mb-4">Changes Made:</h4>
          <div class="space-y-3">
            <div
              v-for="[field, change] in Object.entries(log.changes)"
              :key="field"
              class="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200"
            >
              <div class="flex items-start gap-2">
                <i class="fas fa-arrow-right text-blue-500 text-sm mt-0.5 flex-shrink-0"></i>
                <div class="flex-1 min-w-0">
                  <p class="text-sm md:text-base text-gray-800 break-words">
                    <span class="font-semibold text-gray-900">{{ getFieldDisplayName(field) }}</span>
                    <span class="text-gray-600"> changed from </span>
                    <span class="font-medium text-red-600">"{{ change.from }}"</span>
                    <span class="text-gray-600"> to </span>
                    <span class="font-medium text-green-600">"{{ change.to }}"</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Only (for create/delete actions) -->
        <div v-else class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div>
              <p class="text-sm md:text-base font-medium text-gray-900">
                {{ getActionMessage(log) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="mt-6 flex justify-end pt-4 border-t">
        <button @click="closeModal" class="btn-outline px-4 py-2">
          <i class="fas fa-times mr-2"></i>
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  log: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const getLogIcon = (type) => {
  const icons = {
    user: 'fas fa-user text-blue-600',
    security: 'fas fa-shield-alt text-green-600',
    system: 'fas fa-cog text-purple-600',
  };
  return icons[type] || 'fas fa-info-circle text-gray-600';
};

const getLogIconClass = (type) => {
  const classes = {
    user: 'bg-blue-100',
    security: 'bg-green-100',
    system: 'bg-purple-100',
  };
  return classes[type] || 'bg-gray-100';
};

const getFieldDisplayName = (field) => {
  const fieldNames = {
    // User fields
    firstName: 'First Name',
    lastName: 'Last Name',
    middleName: 'Middle Name',
    suffix: 'Suffix',
    role: 'Role',
    status: 'Status',
    email: 'Email',
    phoneNumber: 'Phone Number',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    civilStatus: 'Civil Status',
    houseNumber: 'House Number',
    street: 'Street',
    isProfileComplete: 'Profile Complete',
    // Announcement fields
    title: 'Title',
    description: 'Description',
    date: 'Date',
    image: 'Image',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
};

const getActionMessage = (log) => {
  const title = log.title.toLowerCase();
  const description = log.description.toLowerCase();
  
  // User-related actions
  if (title.includes('user created') || description.includes('created new user')) {
    return 'Account has been created';
  }
  if (title.includes('user deleted') || description.includes('deleted user')) {
    return 'Account has been deleted';
  }
  
  // Announcement-related actions
  if (title.includes('announcement created') || description.includes('created announcement')) {
    return 'Announcement has been created';
  }
  if (title.includes('announcement deleted') || description.includes('deleted announcement')) {
    return 'Announcement has been deleted';
  }
  
  // Document-related actions
  if (title.includes('document') && (title.includes('approved') || description.includes('approved'))) {
    return 'Document request has been approved';
  }
  if (title.includes('document') && (title.includes('denied') || description.includes('denied'))) {
    return 'Document request has been denied';
  }
  
  // Default fallback
  return log.description;
};
</script>
