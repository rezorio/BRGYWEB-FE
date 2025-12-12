<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Announcements Management</h1>
        <p class="text-gray-600 mt-1">Create and manage barangay announcements</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
      >
        <i class="fas fa-plus mr-2"></i>
        New Announcement
      </button>
    </div>

    <!-- Announcements List -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <p class="mt-2 text-gray-600">Loading announcements...</p>
      </div>

      <div v-else-if="announcements.length === 0" class="p-8 text-center">
        <i class="fas fa-bullhorn text-gray-300 text-5xl mb-4"></i>
        <p class="text-gray-600">No announcements yet. Create your first one!</p>
      </div>

      <div v-else>
        <!-- Desktop Table -->
        <div class="hidden md:block">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="announcement in paginatedAnnouncements" :key="announcement.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img
                          v-if="announcement.image"
                          :src="getImageUrl(announcement.image)"
                          :alt="announcement.title"
                          class="h-10 w-10 rounded object-cover"
                        />
                        <div v-else class="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                          <i class="fas fa-bullhorn text-blue-600"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ announcement.title }}
                        </div>
                        <div class="text-sm text-gray-500 line-clamp-1">
                          {{ announcement.description }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDate(announcement.date) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        announcement.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ announcement.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ announcement.createdBy?.firstName }} {{ announcement.createdBy?.lastName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="toggleActive(announcement)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                      :title="announcement.isActive ? 'Deactivate' : 'Activate'"
                    >
                      <i :class="announcement.isActive ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                    <button
                      @click="openEditModal(announcement)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="confirmDelete(announcement)"
                      class="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile List with 3-dot menu (title + options only) -->
        <div class="md:hidden divide-y divide-gray-200">
          <div
            v-for="announcement in paginatedAnnouncements"
            :key="announcement.id"
            class="flex items-center justify-between p-4"
          >
            <div class="mr-3 flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">
                {{ announcement.title }}
              </div>
            </div>
            <div class="relative flex-shrink-0">
              <button
                @click="toggleAnnouncementActions(announcement.id)"
                class="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div
                v-if="mobileActionsAnnouncementId === announcement.id"
                class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
              >
                <button
                  @click="toggleActive(announcement); mobileActionsAnnouncementId = null;"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {{ announcement.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button
                  @click="openEditModal(announcement); mobileActionsAnnouncementId = null;"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(announcement); mobileActionsAnnouncementId = null;"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
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
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, announcements.length) }}</span>
                of
                <span class="font-medium">{{ announcements.length }}</span>
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
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditing ? 'Edit Announcement' : 'Create New Announcement' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveAnnouncement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter announcement title"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              v-model="form.description"
              required
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter announcement description"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div class="space-y-2">
              <!-- File Upload -->
              <div class="flex items-center space-x-2">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i class="fas fa-upload mr-2"></i>
                  {{ selectedFile ? 'Change File' : 'Choose File' }}
                </button>
                <span v-if="selectedFile" class="text-sm text-gray-600">
                  {{ selectedFile.name }}
                </span>
                <button
                  v-if="selectedFile"
                  type="button"
                  @click="clearFile"
                  class="text-red-600 hover:text-red-700"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <!-- Image Preview -->
              <div v-if="imagePreview || form.image" class="mt-2">
                <img
                  :src="imagePreview || getImageUrl(form.image)"
                  alt="Preview"
                  class="h-32 w-auto rounded-md object-cover"
                />
              </div>
              
              <p class="text-xs text-gray-500">Optional: Upload an image (JPG, PNG, GIF, WebP - Max 5MB)</p>
            </div>
          </div>

          <div v-if="isEditing" class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isActive" class="ml-2 block text-sm text-gray-900">
              Active (visible on landing page)
            </label>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
              {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import announcementService from '@/services/announcementService';

const emit = defineEmits(['announcement-changed']);

const announcements = ref([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const currentAnnouncementId = ref(null);
const selectedFile = ref(null);
const imagePreview = ref(null);
const currentPage = ref(1);
const itemsPerPage = 5;
const mobileActionsAnnouncementId = ref(null);

const form = ref({
  title: '',
  description: '',
  date: '',
  image: '',
  isActive: true,
});

// Pagination computed properties
const totalPages = computed(() => Math.ceil(announcements.value.length / itemsPerPage));

const paginatedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return announcements.value.slice(start, end);
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

const toggleAnnouncementActions = (id) => {
  mobileActionsAnnouncementId.value =
    mobileActionsAnnouncementId.value === id ? null : id;
};

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    announcements.value = await announcementService.getAllForAdmin();
  } catch (error) {
    console.error('Error fetching announcements:', error);
    alert('Failed to load announcements');
  } finally {
    loading.value = false;
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    selectedFile.value = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const clearFile = () => {
  selectedFile.value = null;
  imagePreview.value = null;
  if (form.value.$refs && form.value.$refs.fileInput) {
    form.value.$refs.fileInput.value = '';
  }
};

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${apiBaseUrl}${image}`;
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    isActive: true,
  };
  selectedFile.value = null;
  imagePreview.value = null;
  showModal.value = true;
};

const openEditModal = (announcement) => {
  isEditing.value = true;
  currentAnnouncementId.value = announcement.id;
  form.value = {
    title: announcement.title,
    description: announcement.description,
    date: new Date(announcement.date).toISOString().split('T')[0],
    image: announcement.image || '',
    isActive: announcement.isActive,
  };
  selectedFile.value = null;
  imagePreview.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  currentAnnouncementId.value = null;
  selectedFile.value = null;
  imagePreview.value = null;
};

const saveAnnouncement = async () => {
  saving.value = true;
  try {
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('date', form.value.date);
    
    if (isEditing.value) {
      formData.append('isActive', form.value.isActive.toString());
    }
    
    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    } else if (!isEditing.value || !form.value.image) {
      // Only append image URL if no file is selected and we're not editing
      // or if editing and there's no existing image
      formData.append('image', '');
    }
    
    if (isEditing.value) {
      await announcementService.updateWithFile(currentAnnouncementId.value, formData);
      alert('Announcement updated successfully!');
    } else {
      await announcementService.createWithFile(formData);
      alert('Announcement created successfully!');
    }
    closeModal();
    await fetchAnnouncements();
    currentPage.value = 1; // Reset to first page after save
    emit('announcement-changed'); // Notify parent to refresh activity logs
  } catch (error) {
    console.error('Error saving announcement:', error);
    alert('Failed to save announcement');
  } finally {
    saving.value = false;
  }
};

const toggleActive = async (announcement) => {
  try {
    await announcementService.toggleActive(announcement.id);
    await fetchAnnouncements();
    emit('announcement-changed'); // Notify parent to refresh activity logs
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    alert('Failed to update announcement status');
  }
};

const confirmDelete = async (announcement) => {
  if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
    try {
      await announcementService.delete(announcement.id);
      alert('Announcement deleted successfully!');
      await fetchAnnouncements();
      emit('announcement-changed'); // Notify parent to refresh activity logs
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  }
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

onMounted(() => {
  fetchAnnouncements();
});
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
