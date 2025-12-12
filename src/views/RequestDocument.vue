<template>
  <PublicLayout>

    <!-- Document Request Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Request a Document
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Select a document type and submit your request. Your profile information will be used automatically.
        </p>
        <div class="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          <i class="fas fa-check-circle mr-2"></i>
          Logged in as: {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
        </div>
      </div>


      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Document Types -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              Available Documents
            </h2>
            <div class="space-y-2">
              <button
                v-for="doc in documentTypes"
                :key="doc.id"
                @click="selectDocument(doc)"
                :class="[
                  'w-full text-left p-4 rounded-lg transition-colors duration-200 relative',
                  selectedDocument?.id === doc.id
                    ? 'bg-blue-600 text-white'
                    : getPendingRequestForType(doc.documentType)
                    ? 'bg-yellow-50 border-2 border-yellow-400 text-gray-700 hover:bg-yellow-100'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
                ]"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="font-semibold text-base">{{ doc.name }}</p>
                    <p class="text-sm opacity-75 mt-1">{{ doc.description }}</p>
                    <div v-if="getPendingRequestForType(doc.documentType)" class="mt-2 flex items-center text-xs">
                      <i class="fas fa-clock text-yellow-600 mr-1"></i>
                      <span class="text-yellow-700 font-medium">Pending Request</span>
                    </div>
                  </div>
                  <div v-if="getPendingRequestForType(doc.documentType)" class="ml-2">
                    <i class="fas fa-hourglass-half text-yellow-500 text-xl"></i>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Request Details -->
        <div class="lg:col-span-2">
          <div
            v-if="selectedDocument"
            class="bg-white rounded-2xl shadow-xl p-8"
          >
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-2xl font-bold text-gray-900">
                  Request {{ selectedDocument.name }}
                </h2>
                <div v-if="getPendingRequestForType(selectedDocument.documentType)" class="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  <i class="fas fa-clock mr-2"></i>
                  Pending Request
                </div>
              </div>
              <p class="text-gray-600">{{ selectedDocument.description }}</p>
              
              <!-- Pending Request Info -->
              <div v-if="getPendingRequestForType(selectedDocument.documentType)" class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p class="text-sm text-yellow-800">
                  <i class="fas fa-info-circle mr-2"></i>
                  You have a pending request for this document. You can cancel it below to submit a new request.
                </p>
                <p class="text-xs text-yellow-700 mt-1">
                  Submitted: {{ formatDateTime(getPendingRequestForType(selectedDocument.documentType)?.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Profile Information Preview -->
            <div class="space-y-6">
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Your Information (from profile)
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Name:</span>
                    <span class="ml-2 text-gray-900 font-medium">
                      {{ authStore.user?.firstName }} {{ authStore.user?.middleName }} {{ authStore.user?.lastName }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500">Email:</span>
                    <span class="ml-2 text-gray-900">{{ authStore.user?.email }}</span>
                  </div>
                  <div v-if="authStore.user?.phoneNumber">
                    <span class="text-gray-500">Phone:</span>
                    <span class="ml-2 text-gray-900">{{ authStore.user?.phoneNumber }}</span>
                  </div>
                  <div v-if="authStore.user?.dateOfBirth">
                    <span class="text-gray-500">Date of Birth:</span>
                    <span class="ml-2 text-gray-900">{{ formatDate(authStore.user?.dateOfBirth) }}</span>
                  </div>
                  <div v-if="authStore.user?.civilStatus">
                    <span class="text-gray-500">Civil Status:</span>
                    <span class="ml-2 text-gray-900">{{ authStore.user?.civilStatus }}</span>
                  </div>
                  <div v-if="authStore.user?.gender">
                    <span class="text-gray-500">Gender:</span>
                    <span class="ml-2 text-gray-900">{{ authStore.user?.gender }}</span>
                  </div>
                </div>
                <div class="mt-4" v-if="authStore.user?.street || authStore.user?.barangay">
                  <span class="text-gray-500">Address:</span>
                  <span class="ml-2 text-gray-900">
                    {{ getFullAddress() }}
                  </span>
                </div>
              </div>

              <!-- Purpose Input (only show if no pending request) -->
              <div v-if="!getPendingRequestForType(selectedDocument.documentType)">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Purpose of Request
                </h3>
                <textarea
                  v-model="purpose"
                  required
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please specify the purpose of your document request..."
                ></textarea>
              </div>
              
              <!-- Show pending request purpose if exists -->
              <div v-else class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Request Purpose
                </h3>
                <p class="text-gray-700">{{ getPendingRequestForType(selectedDocument.documentType)?.purpose }}</p>
              </div>

              <!-- Profile Incomplete Warning -->
              <div v-if="!isProfileComplete" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex">
                  <i class="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-yellow-800">Profile Incomplete</h4>
                    <p class="text-sm text-yellow-700 mt-1">
                      Your profile is missing required information. Please complete the following fields:
                    </p>
                    <ul class="text-xs text-yellow-700 mt-2 ml-4 list-disc">
                      <li v-if="!authStore.user?.firstName">First Name</li>
                      <li v-if="!authStore.user?.lastName">Last Name</li>
                      <li v-if="!authStore.user?.phoneNumber">Phone Number</li>
                      <li v-if="!authStore.user?.street">Street Address</li>
                    </ul>
                    <p class="text-xs text-yellow-600 mt-2">
                      Note: All other fields are optional.
                    </p>
                    <router-link to="/profile" class="text-sm text-yellow-800 underline hover:text-yellow-900 mt-2 inline-block">
                      Complete Profile →
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Requirements -->
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-2">Requirements:</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li
                    v-for="requirement in selectedDocument.requirements"
                    :key="requirement"
                  >
                    • {{ requirement }}
                  </li>
                </ul>
              </div>

              <!-- Submit/Cancel Button -->
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  @click="selectedDocument = null"
                  class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Back
                </button>
                
                <!-- Show Cancel Request button if this document type has a pending request -->
                <button
                  v-if="getPendingRequestForType(selectedDocument.documentType)"
                  @click="cancelPendingRequestForType(selectedDocument.documentType)"
                  :disabled="isCancelling"
                  class="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i
                    v-if="isCancelling"
                    class="fas fa-spinner fa-spin mr-2"
                  ></i>
                  <i v-else class="fas fa-times-circle mr-2"></i>
                  {{ isCancelling ? "Cancelling..." : "Cancel Request" }}
                </button>
                
                <!-- Show Submit Request button if no pending request for this document type -->
                <button
                  v-else
                  @click="submitRequest"
                  :disabled="isSubmitting || !purpose || !isProfileComplete"
                  class="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i
                    v-if="isSubmitting"
                    class="fas fa-spinner fa-spin mr-2"
                  ></i>
                  {{ isSubmitting ? "Submitting..." : "Submit Request" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Initial State -->
          <div v-else class="bg-white rounded-2xl shadow-xl p-8 text-center">
            <i class="fas fa-file-alt text-blue-600 text-6xl mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Select a Document Type
            </h3>
            <p class="text-gray-600">
              Choose from the available document types on the left to start your
              request.
            </p>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { useRouter } from "vue-router";
import api from "@/services/api";

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const isSubmitting = ref(false);
const documentTypes = ref([]);
const purpose = ref('');
const isLoading = ref(true);
const pendingRequests = ref([]);
const isCancelling = ref(false);

// Check authentication and redirect if needed
onMounted(async () => {
  // Redirect to login if not authenticated - do this FIRST before any API calls
  if (!authStore.isAuthenticated) {
    await router.push('/login');
    return;
  }
  
  // Only proceed if authenticated
  try {
    // Refresh user profile to get latest data
    console.log('[RequestDocument] Fetching user profile...');
    await authStore.fetchProfile();
    console.log('[RequestDocument] User profile loaded:', authStore.user);
    
    // Check for existing pending request
    await checkPendingRequest();
    console.log('[RequestDocument] Profile completeness check:', {
      firstName: authStore.user?.firstName,
      lastName: authStore.user?.lastName,
      streetNumber: authStore.user?.streetNumber,
      streetName: authStore.user?.streetName,
      dateOfBirth: authStore.user?.dateOfBirth,
      isComplete: isProfileComplete.value
    });
    
    // Use predefined document types (no need to fetch from API)
    documentTypes.value = [
      {
        id: 1,
        documentType: 'barangay_clearance',
        name: "Barangay Clearance",
        description: "Proof of residency in the barangay",
        requirements: [
          "Valid ID",
          "Proof of residence (utility bill, etc.)",
          "Accomplished application form",
        ],
      },
      {
        id: 2,
        documentType: 'certificate_of_residency',
        name: "Certificate of Residency",
        description: "Certificate of residency for specific purposes",
        requirements: ["Valid ID", "Proof of residence", "Purpose documentation"],
      },
      {
        id: 3,
        documentType: 'barangay_certificate',
        name: "Barangay Certificate",
        description: "General barangay certificate for various purposes",
        requirements: [
          "Valid ID",
          "Proof of residence",
          "Accomplished application form",
        ],
      },
      {
        id: 4,
        documentType: 'certificate_of_indigency',
        name: "Certificate of Indigency",
        description: "Certificate for financial assistance programs",
        requirements: [
          "Valid ID",
          "Proof of low income",
          "Case study social worker report (if applicable)",
        ],
      },
      {
        id: 5,
        documentType: 'business_permit',
        name: "Business Permit",
        description: "Permit to operate business within the barangay",
        requirements: [
          "Valid ID",
          "Business registration documents",
          "Proof of address",
          "Sanitary permit (if applicable)",
        ],
      }
    ];
    
    isLoading.value = false;
  } catch (error) {
    console.error('Failed to load profile:', error);
    toastStore.showError('Failed to load profile data');
    isLoading.value = false;
  }
});

const selectedDocument = ref(null);

// Check if user profile is complete - TRUST THE BACKEND
// The backend returns isProfileComplete field after checking all required fields
const isProfileComplete = computed(() => {
  const user = authStore.user;
  if (!user) {
    console.log('[RequestDocument] No user found in authStore');
    return false;
  }

  // PRIMARY CHECK: Use the backend's isProfileComplete field if available
  if (user.isProfileComplete !== undefined && user.isProfileComplete !== null) {
    console.log('[RequestDocument] ✅ Using backend isProfileComplete status:', user.isProfileComplete);
    return user.isProfileComplete;
  }

  // FALLBACK: If backend didn't provide isProfileComplete, compute it client-side
  // Required fields for document generation: firstName, lastName, birthday, streetNumber, streetName
  const requiredFields = {
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    streetNumber: user.streetNumber,
    streetName: user.streetName,
  };

  const missingRequired = Object.entries(requiredFields)
    .filter(([_, value]) => !value || (typeof value === 'string' && value.trim().length === 0))
    .map(([key]) => key);

  if (missingRequired.length > 0) {
    console.log('[RequestDocument] ❌ Profile INCOMPLETE - Missing REQUIRED fields:', missingRequired);
    console.log('[RequestDocument] Current field values:', requiredFields);
  } else {
    console.log('[RequestDocument] ✅ Profile is COMPLETE - All required fields filled');
  }

  return missingRequired.length === 0;
});

const selectDocument = (document) => {
  selectedDocument.value = document;
  purpose.value = '';
};

const getFullAddress = () => {
  const user = authStore.user;
  if (!user) return '';
  
  const parts = [];
  if (user.houseNumber) parts.push(user.houseNumber);
  if (user.street) parts.push(user.street);
  if (user.barangay) parts.push(`Barangay ${user.barangay}`);
  if (user.city) parts.push(user.city);
  if (user.province) parts.push(user.province);
  if (user.zipCode) parts.push(user.zipCode);
  
  return parts.filter(Boolean).join(', ');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getDocumentDescription = (documentType) => {
  const descriptions = {
    'barangay_clearance': 'Barangay clearance for various purposes',
    'certificate_of_residency': 'Certificate of residency for specific purposes',
    'barangay_certificate': 'General barangay certificate for various purposes',
    'certificate_of_indigency': 'Certificate for financial assistance programs',
    'business_permit': 'Permit to operate business within the barangay'
  };
  return descriptions[documentType] || 'Official barangay document';
};

const getDocumentRequirements = (documentType) => {
  const requirements = {
    'barangay_clearance': [
      'Valid ID',
      'Proof of residence (utility bill, etc.)',
      'Purpose documentation'
    ],
    'certificate_of_residency': [
      'Valid ID',
      'Proof of residence',
      'Purpose documentation'
    ],
    'barangay_certificate': [
      'Valid ID',
      'Proof of residence',
      'Accomplished application form'
    ],
    'certificate_of_indigency': [
      'Valid ID',
      'Proof of low income',
      'Case study social worker report (if applicable)'
    ],
    'business_permit': [
      'Valid ID',
      'Business registration documents',
      'Proof of address',
      'Sanitary permit (if applicable)'
    ]
  };
  return requirements[documentType] || ['Valid ID', 'Proof of residence'];
};

const checkPendingRequest = async () => {
  try {
    const response = await api.get('/documents/my-pending-requests');
    pendingRequests.value = response.data.data || [];
    console.log('[RequestDocument] Pending requests:', pendingRequests.value);
  } catch (error) {
    console.error('[RequestDocument] Failed to check pending requests:', error);
    // Set to empty array on error to prevent undefined issues
    pendingRequests.value = [];
  }
};

const getPendingRequestForType = (documentType) => {
  if (!pendingRequests.value || !Array.isArray(pendingRequests.value)) {
    return null;
  }
  return pendingRequests.value.find(req => req.requestType === documentType) || null;
};

const cancelPendingRequestForType = async (documentType) => {
  const request = getPendingRequestForType(documentType);
  if (!request) return;
  
  if (!confirm(`Are you sure you want to cancel your pending ${getDocumentTypeName(documentType)} request?`)) {
    return;
  }
  
  isCancelling.value = true;
  
  try {
    await api.post(`/documents/cancel/${request.id}`);
    toastStore.showSuccess('Request cancelled successfully!');
    
    // Remove from pending requests array
    pendingRequests.value = pendingRequests.value.filter(req => req.id !== request.id);
    
    // Clear selected document to go back to selection
    selectedDocument.value = null;
    purpose.value = '';
  } catch (error) {
    console.error('[RequestDocument] Failed to cancel request:', error);
    toastStore.showError(error.response?.data?.message || 'Failed to cancel request');
  } finally {
    isCancelling.value = false;
  }
};

const getDocumentTypeName = (type) => {
  const names = {
    'barangay_clearance': 'Barangay Clearance',
    'certificate_of_residency': 'Certificate of Residency',
    'barangay_certificate': 'Barangay Certificate',
    'certificate_of_indigency': 'Certificate of Indigency',
    'business_permit': 'Business Permit'
  };
  return names[type] || type;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const submitRequest = async () => {
  console.log('=== Submit Request Debug ===');
  
  if (!selectedDocument.value) {
    alert('Please select a document type');
    return;
  }

  if (!purpose.value) {
    alert('Please specify the purpose of your request');
    return;
  }

  // CRITICAL: Refresh profile data from backend before checking completeness
  console.log('[RequestDocument] Refreshing profile data before submission...');
  try {
    await authStore.fetchProfile();
    console.log('[RequestDocument] Profile refreshed. User data:', authStore.user);
    console.log('[RequestDocument] Backend isProfileComplete:', authStore.user?.isProfileComplete);
  } catch (error) {
    console.error('[RequestDocument] Failed to refresh profile:', error);
    alert('Failed to verify profile status. Please try again.');
    return;
  }

  console.log('[RequestDocument] Profile complete?', isProfileComplete.value);

  if (!isProfileComplete.value) {
    const user = authStore.user;
    const missing = [];
    if (!user?.firstName || user.firstName.trim().length === 0) missing.push('First Name');
    if (!user?.lastName || user.lastName.trim().length === 0) missing.push('Last Name');
    if (!user?.dateOfBirth) missing.push('Date of Birth');
    if (!user?.streetNumber || user.streetNumber.trim().length === 0) missing.push('Street Number');
    if (!user?.streetName || user.streetName.trim().length === 0) missing.push('Street Name');
    
    console.error('[RequestDocument] Profile incomplete! Missing required fields:', missing);
    console.log('[RequestDocument] Current profile:', {
      firstName: user?.firstName,
      lastName: user?.lastName,
      dateOfBirth: user?.dateOfBirth,
      streetNumber: user?.streetNumber,
      streetName: user?.streetName,
      backendIsProfileComplete: user?.isProfileComplete
    });
    
    toastStore.showError(`Please complete your profile before requesting documents.\n\nMissing: ${missing.join(', ')}`);
    router.push('/profile');
    return;
  }

  isSubmitting.value = true;

  try {
    console.log('[RequestDocument] Submitting request:', {
      documentType: selectedDocument.value.documentType,
      purpose: purpose.value,
      userFirstName: authStore.user?.firstName,
      userLastName: authStore.user?.lastName
    });
    
    // Submit request with authenticated user's data using API directly
    const response = await api.post('/documents/request', {
      requestType: selectedDocument.value.documentType,
      purpose: purpose.value
    });
    
    console.log('[RequestDocument] Request submitted successfully:', response.data);
    toastStore.showSuccess('Document request submitted successfully! Please wait for approval.');
    
    // Refresh pending requests status
    await checkPendingRequest();
    
    // Keep the document selected but clear purpose to show the cancel button
    purpose.value = '';
  } catch (error) {
    console.error('[RequestDocument] Submit error:', error);
    const backendMessage = error.response?.data?.message;
    toastStore.showError(backendMessage || 'Error submitting request. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
