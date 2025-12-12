<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Template Test Page</h1>
        <p class="mt-1 text-sm text-gray-600">
          Upload a Word (.docx) template and preview it in your browser without downloading.
        </p>
      </div>

      <!-- Info Box -->
      <div
        class="mb-6 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg p-4 flex items-start gap-3"
      >
        <i class="fas fa-info-circle mt-0.5"></i>
        <div>
          <p class="font-medium mb-1">How this works</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Choose a .docx template file and upload it.</li>
            <li>The system extracts the document content and shows you a visual preview.</li>
            <li>You can see what the document looks like without downloading it.</li>
            <li>Detected placeholders (like {full_name}) are also shown.</li>
          </ul>
        </div>
      </div>

      <!-- Upload Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Upload Word Template
        </h2>

        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              ref="fileInputRef"
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              class="hidden"
              @change="handleFileChange"
            />

            <button
              type="button"
              class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              @click="selectFile"
            >
              <i class="fas fa-file-upload mr-2"></i>
              Choose .docx file
            </button>

            <span v-if="selectedFileName" class="text-sm text-gray-700 break-all">
              {{ selectedFileName }}
            </span>
            <span v-else class="text-sm text-gray-400">No file selected</span>
          </div>

          <p class="text-xs text-gray-500">
            Accepted format: DOCX only. Max size 5MB.
          </p>

          <div class="flex flex-wrap gap-3 mt-2">
            <button
              type="button"
              class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!selectedFile || uploading"
              @click="uploadTemplate"
            >
              <i v-if="uploading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-cloud-upload-alt mr-2"></i>
              Upload Template
            </button>

            <button
              v-if="previewHtml"
              type="button"
              class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              @click="showPreviewModal = true"
            >
              <i class="fas fa-eye mr-2"></i>
              View Last Preview
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Card -->
      <div v-if="jsonResult" class="mt-6 bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Last Upload Summary</h2>
        <p class="text-sm text-gray-600 mb-3">
          File: <span class="font-mono">{{ jsonResult.fileName }}</span>
        </p>
        <p class="text-sm text-gray-600 mb-2">
          Size: <span class="font-mono">{{ formatSize(jsonResult.size) }}</span>
        </p>
        <div class="mt-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-700">Placeholders</p>
            <p class="text-xs text-gray-500">Fill in sample data for preview/PDF</p>
          </div>
          <div v-if="placeholderList.length" class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="name in placeholderList"
              :key="name"
              class="space-y-1"
            >
              <label class="block text-xs font-medium text-gray-600">
                {{ name }}
              </label>
              <input
                v-model="placeholderValues[name]"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter sample value"
              />
            </div>
          </div>
          <div
            v-else
            class="mt-2 text-xs text-gray-500 italic"
          >
            No placeholders detected. You can still render the template as-is.
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canRender || previewing"
            @click="renderPreview"
          >
            <i v-if="previewing" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-magic mr-2"></i>
            Generate Preview
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!previewHtml"
            @click="showPreviewModal = true"
          >
            <i class="fas fa-file-word mr-2"></i>
            Open Preview
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!hasRenderResult || downloading"
            @click="downloadRenderedDocx"
          >
            <i v-if="downloading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-download mr-2"></i>
            Download DOCX
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canRender || renderingPdf"
            @click="renderPdf"
          >
            <i v-if="renderingPdf" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-file-pdf mr-2"></i>
            Generate PDF
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!renderedPdfBase64 || downloading"
            @click="downloadPdf"
          >
            <i v-if="downloading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-download mr-2"></i>
            Download PDF
          </button>
        </div>
      </div>

      <!-- Preview Modal -->
      <div
        v-if="showPreviewModal && jsonResult"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="showPreviewModal = false"
      >
        <div
          class="relative top-16 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Document Preview
            </h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="showPreviewModal = false"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="space-y-3">
            <p class="text-sm text-gray-600">
              This is a visual preview of your Word document. The formatting is approximate.
            </p>

            <div class="text-xs text-gray-500 mb-4">
              File: <span class="font-mono">{{ jsonResult.fileName }}</span>
              - Size:
              <span class="font-mono">{{ formatSize(jsonResult.size) }}</span>
            </div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
              Filled Document Preview
            </label>
            <div
              class="border border-gray-300 rounded-md bg-white p-4 max-h-[70vh] overflow-auto text-sm text-gray-900 shadow-inner"
            >
              <div v-if="!previewHtml" class="text-xs text-gray-500 text-center py-8">
                Generate a preview to see the filled document with your sample data.
              </div>
              <div v-else class="prose max-w-none" v-html="previewHtml"></div>
            </div>

            <details class="mt-4">
              <summary class="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                Show raw JSON (advanced)
              </summary>
              <pre
                class="mt-2 max-h-64 overflow-auto text-xs bg-gray-900 text-green-100 rounded-md p-3 whitespace-pre-wrap"
              >{{ prettyJson }}</pre>
            </details>
          </div>

          <div class="mt-5 flex justify-end gap-3">
            <button
              type="button"
              class="btn-outline"
              @click="showPreviewModal = false"
            >
              Close
            </button>
            <button
              type="button"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!hasRenderResult || downloading"
              @click="downloadRenderedDocx"
            >
              <i class="fas fa-download mr-2"></i>
              Download DOCX
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

const fileInputRef = ref(null);
const selectedFile = ref(null);
const selectedFileName = ref('');
const uploading = ref(false);
const downloading = ref(false);
const jsonResult = ref(null);
const showPreviewModal = ref(false);
const placeholderValues = ref({});
const previewing = ref(false);
const previewHtml = ref('');
const renderedDocxBase64 = ref('');
const renderedFileName = ref('');
const renderedPdfBase64 = ref('');
const pdfFileName = ref('');
const renderingPdf = ref(false);

const selectFile = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
};

const handleFileChange = (event) => {
  const input = event.target;
  const file = input.files?.[0];

  if (!file) {
    selectedFile.value = null;
    selectedFileName.value = '';
    return;
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.docx')) {
    toastStore.showError('Please select a .docx Word document');
    input.value = '';
    selectedFile.value = null;
    selectedFileName.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toastStore.showError('File size must be 5MB or less');
    input.value = '';
    selectedFile.value = null;
    selectedFileName.value = '';
    return;
  }

  selectedFile.value = file;
  selectedFileName.value = file.name;
};

const resetRenderState = () => {
  previewHtml.value = '';
  renderedDocxBase64.value = '';
  renderedFileName.value = '';
  renderedPdfBase64.value = '';
  pdfFileName.value = '';
};

const initializePlaceholderValues = () => {
  const placeholders = jsonResult.value?.placeholders || [];
  if (!placeholders.length) {
    placeholderValues.value = {};
    return;
  }

  const current = { ...placeholderValues.value };
  placeholders.forEach((name) => {
    if (typeof current[name] !== 'string') {
      current[name] = '';
    }
  });

  Object.keys(current).forEach((key) => {
    if (!placeholders.includes(key)) {
      delete current[key];
    }
  });

  placeholderValues.value = current;
};

const uploadTemplate = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('template', selectedFile.value);

    const response = await api.post('/documents/test/upload-template', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const payload = response.data?.data || null;
    jsonResult.value = payload;
    resetRenderState();

    if (jsonResult.value) {
      toastStore.showSuccess('Template uploaded. Fill the placeholders below to preview.');
      initializePlaceholderValues();
    } else {
      toastStore.showError('No data returned from server');
    }
  } catch (error) {
    console.error('Failed to upload template:', error);
    toastStore.showError('Failed to upload template');
  } finally {
    uploading.value = false;
  }
};

const placeholderList = computed(() => jsonResult.value?.placeholders || []);

const canRender = computed(() => Boolean(jsonResult.value?.docxBase64));

const hasRenderResult = computed(() => Boolean(renderedDocxBase64.value));

const buildDataPayload = () => {
  const data = {};
  placeholderList.value.forEach((key) => {
    data[key] = placeholderValues.value[key] || '';
  });
  return data;
};

const renderPreview = async () => {
  if (!jsonResult.value?.docxBase64) {
    toastStore.showError('Upload a template first');
    return;
  }

  previewing.value = true;
  try {
    const payload = {
      docxBase64: jsonResult.value.docxBase64,
      data: buildDataPayload(),
      fileName: jsonResult.value.fileName,
    };

    const response = await api.post('/documents/test/render-preview', payload);
    const result = response.data?.data;

    previewHtml.value = result?.html || '';
    renderedDocxBase64.value = result?.docxBase64 || '';
    renderedFileName.value = result?.fileName || jsonResult.value.fileName || 'template.docx';

    if (!previewHtml.value) {
      toastStore.showError('Preview returned empty content');
      return;
    }

    toastStore.showSuccess('Preview generated');
    showPreviewModal.value = true;
  } catch (error) {
    console.error('Failed to render preview:', error);
    toastStore.showError('Failed to render preview');
  } finally {
    previewing.value = false;
  }
};

const downloadRenderedDocx = async () => {
  if (!renderedDocxBase64.value) {
    toastStore.showError('Generate a preview before downloading');
    return;
  }

  downloading.value = true;
  try {
    const payload = {
      docxBase64: renderedDocxBase64.value,
      fileName: renderedFileName.value,
    };

    const response = await api.post('/documents/test/download-rendered', payload, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', renderedFileName.value || 'preview.docx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toastStore.showSuccess('DOCX downloaded successfully');
  } catch (error) {
    console.error('Failed to download DOCX:', error);
    toastStore.showError('Failed to download DOCX');
  } finally {
    downloading.value = false;
  }
};

const formatSize = (size) => {
  if (!size && size !== 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const prettyJson = computed(() => {
  if (!jsonResult.value) return '';
  try {
    return JSON.stringify(jsonResult.value, null, 2);
  } catch {
    return '';
  }
});

const previewParagraphs = computed(() => []);

const renderPdf = async () => {
  if (!jsonResult.value?.docxBase64) {
    toastStore.showError('Upload a template first');
    return;
  }

  renderingPdf.value = true;
  try {
    const payload = {
      docxBase64: jsonResult.value.docxBase64,
      data: buildDataPayload(),
      fileName: jsonResult.value.fileName,
    };

    const response = await api.post('/documents/test/render-pdf', payload);
    const result = response.data?.data;

    renderedPdfBase64.value = result?.pdfBase64 || '';
    pdfFileName.value = result?.fileName || 'document.pdf';
    previewHtml.value = result?.html || '';

    if (!renderedPdfBase64.value) {
      toastStore.showError('PDF generation returned empty content');
      return;
    }

    toastStore.showSuccess('PDF generated successfully! Click "Download PDF" to save.');
  } catch (error) {
    console.error('Failed to render PDF:', error);
    toastStore.showError('Failed to render PDF');
  } finally {
    renderingPdf.value = false;
  }
};

const downloadPdf = async () => {
  if (!renderedPdfBase64.value) {
    toastStore.showError('Generate a PDF first');
    return;
  }

  downloading.value = true;
  try {
    const payload = {
      pdfBase64: renderedPdfBase64.value,
      fileName: pdfFileName.value,
    };

    const response = await api.post('/documents/test/download-pdf', payload, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/pdf',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', pdfFileName.value || 'document.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toastStore.showSuccess('PDF downloaded successfully');
  } catch (error) {
    console.error('Failed to download PDF:', error);
    toastStore.showError('Failed to download PDF');
  } finally {
    downloading.value = false;
  }
};
</script>
