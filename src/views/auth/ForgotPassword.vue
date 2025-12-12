<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center"
        >
          <i class="fas fa-key text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your phone number to receive an OTP
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="submitted"
        class="bg-green-50 border border-green-200 rounded-md p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-check-circle text-green-400 text-xl"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              Request Submitted Successfully
            </h3>
            <div class="mt-2 text-sm text-green-700">
              <p>
                Your password reset request has been submitted to the admin.
                You will be notified once it's processed.
              </p>
            </div>
            <div class="mt-4">
              <router-link to="/login" class="text-sm font-medium text-green-600 hover:text-green-500">
                <i class="fas fa-arrow-left mr-1"></i>
                Return to Login
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Phone Number -->
          <div>
            <label for="phoneNumber" class="form-label">Phone Number *</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              name="phoneNumber"
              type="tel"
              autocomplete="tel"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.phoneNumber }"
              placeholder="09123456789"
            />
            <p v-if="errors.phoneNumber" class="form-error">{{ errors.phoneNumber }}</p>
            <p class="text-xs text-gray-500 mt-1">
              Enter the phone number registered with your account
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full btn-primary"
          >
            <span v-if="loading" class="loading-spinner mr-2"></span>
            {{ loading ? "Submitting..." : "Submit Request" }}
          </button>
        </div>

        <!-- Back to Login -->
        <div class="text-center">
          <router-link
            to="/login"
            class="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <i class="fas fa-arrow-left mr-1"></i>
            Back to Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useToastStore } from "@/stores/toast";
import api from "@/services/api";

const router = useRouter();
const toastStore = useToastStore();

const form = reactive({
  phoneNumber: "",
});

const errors = reactive({
  phoneNumber: "",
});

const loading = ref(false);
const error = ref(null);
const submitted = ref(false);

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
  error.value = null;

  // Phone number validation
  if (!form.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
    isValid = false;
  } else if (!/^09\d{9}$/.test(form.phoneNumber)) {
    errors.phoneNumber = "Please enter a valid Philippine phone number (09XXXXXXXXX)";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    error.value = null;

    const response = await api.post("/otp/password-reset/request", {
      phoneNumber: form.phoneNumber,
    });

    toastStore.showSuccess("OTP sent to your phone!");
    
    // Redirect to OTP verification page
    router.push({
      name: 'verify-otp',
      query: {
        otpId: response.data.otpId,
        type: 'password-reset',
        phone: form.phoneNumber,
        expiresAt: response.data.expiresAt,
      },
    });
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Failed to send OTP. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
