<template>
  <div class="document-templates-tab">
    <div class="header-section">
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Document Templates
          </h2>
          <p class="text-gray-600 mb-6">
            Upload and manage Word templates used for generating certificates.
          </p>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg p-4 flex items-start gap-3"
      >
        <i class="fas fa-info-circle mt-0.5"></i>
        <div>
          <p class="font-medium mb-1">How templates work</p>
          <p>
            Upload a <span class="font-semibold">.docx</span> template for each
            document type. The system will fill in placeholders like
            <code>{{ '{full_name}' }}</code>, <code>{{ '{birth_date}' }}</code>,
            and <code>{{ '{request_purpose}' }}</code> when generating
            documents.
          </p>
        </div>
      </div>

      <div
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="template in templates"
          :key="template.key"
          class="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
        >
          <div>
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i :class="template.icon" class="text-blue-600"></i>
              <span>{{ template.label }}</span>
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ template.description }}
            </p>

            <div class="mt-3 text-sm">
              <span
                v-if="template.hasTemplate"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                <i class="fas fa-check-circle mr-1"></i>
                Template configured
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                <i class="fas fa-exclamation-circle mr-1"></i>
                Using default layout
              </span>
            </div>

            <p v-if="template.updatedAt" class="mt-2 text-xs text-gray-500">
              Last updated: {{ formatDate(template.updatedAt) }}
            </p>
          </div>

          <div class="mt-4 flex flex-col gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="template.uploading"
              @click="startUpload(template.key)"
            >
              <i
                v-if="template.uploading"
                class="fas fa-spinner fa-spin mr-2"
              ></i>
              <i v-else class="fas fa-upload mr-2"></i>
              {{ template.hasTemplate ? 'Replace Template' : 'Upload Template' }}
            </button>
            <p class="text-xs text-gray-500">
              Accepted format: DOCX only. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-6 text-sm text-gray-500">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        Loading template status...
      </div>
    </div>

    <!-- Hidden file input reused for all types -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      class="hidden"
      @change="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToastStore } from '@/stores/toast';
import api from '@/services/api';

const toastStore = useToastStore();

const loading = ref(false);
const fileInputRef = ref(null);
const activeTypeKey = ref(null);

const documentTypes = [
  {
    key: 'barangay_clearance',
    label: 'Barangay Clearance',
    description: 'Used for general barangay clearance requests.',
    icon: 'fas fa-id-card',
  },
  {
    key: 'certificate_of_residency',
    label: 'Certificate of Residency',
    description: 'Used for certifying residency within the barangay.',
    icon: 'fas fa-home',
  },
  {
    key: 'certificate_of_indigency',
    label: 'Certificate of Indigency',
    description: 'Used for financial assistance or indigency verification.',
    icon: 'fas fa-hand-holding-heart',
  },
];

const templates = ref(
  documentTypes.map((type) => ({
    ...type,
    hasTemplate: false,
    updatedAt: null,
    uploading: false,
  })),
);

/**
 * Format an ISO date string into a human-readable format.
 * @param {string|Date} value
 * @returns {string}
 */
const formatDate = (value) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Load current template status from the backend, if the endpoint exists.
 */
const fetchTemplates = async () => {
  loading.value = true;
  try {
    const response = await api.get('/documents/admin/templates');
    const data = response.data?.data || [];

    templates.value = documentTypes.map((type) => {
      const fromServer = data.find((item) => item.type === type.key);
      return {
        ...type,
        hasTemplate: !!fromServer?.hasTemplate,
        updatedAt: fromServer?.updatedAt || null,
        uploading: false,
      };
    });
  } catch (error) {
    // Endpoint might not exist yet; keep UI usable.
    // eslint-disable-next-line no-console
    console.error('Failed to load document templates:', error);
    toastStore.showError('Unable to load template status. Using defaults.');
  } finally {
    loading.value = false;
  }
};

/**
 * Start upload for a specific document type by opening the hidden file input.
 * @param {string} typeKey
 */
const startUpload = (typeKey) => {
  activeTypeKey.value = typeKey;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
};

/**
 * Handle file selection and upload the DOCX template for the active type.
 * @param {Event} event
 */
const handleFileSelected = async (event) => {
  const input = event.target;
  const file = input.files?.[0];
  const typeKey = activeTypeKey.value;

  if (!file || !typeKey) {
    activeTypeKey.value = null;
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toastStore.showError('File size must be 5MB or less');
    input.value = '';
    activeTypeKey.value = null;
    return;
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.docx')) {
    toastStore.showError('Please upload a .docx Word document');
    input.value = '';
    activeTypeKey.value = null;
    return;
  }

  const template = templates.value.find((item) => item.key === typeKey);
  if (!template) {
    activeTypeKey.value = null;
    input.value = '';
    return;
  }

  template.uploading = true;

  try {
    const formData = new FormData();
    formData.append('template', file);
    formData.append('type', typeKey);

    await api.post('/documents/admin/templates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toastStore.showSuccess('Template uploaded successfully');
    await fetchTemplates();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to upload template:', error);
    toastStore.showError('Failed to upload template');
  } finally {
    template.uploading = false;
    input.value = '';
    activeTypeKey.value = null;
  }
};

onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.document-templates-tab {
  padding: 1.5rem;
}

.header-section {
  margin-bottom: 1.5rem;
}
</style>
