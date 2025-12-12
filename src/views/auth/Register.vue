<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-3xl w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center"
        >
          <i class="fas fa-user-plus text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <router-link
            to="/login"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </router-link>
        </p>
      </div>

      <!-- Registration Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- Basic Information Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">
            <i class="fas fa-user mr-2"></i>Basic Information
          </h3>

          <!-- Name Fields Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label for="firstName" class="form-label">First Name *</label>
              <input
                id="firstName"
                v-model="form.firstName"
                name="firstName"
                type="text"
                required
                class="form-input"
                :class="{ 'border-red-500': errors.firstName }"
                placeholder="Juan"
              />
              <p v-if="errors.firstName" class="form-error">
                {{ errors.firstName }}
              </p>
            </div>

            <!-- Last Name -->
            <div>
              <label for="lastName" class="form-label">Last Name *</label>
              <input
                id="lastName"
                v-model="form.lastName"
                name="lastName"
                type="text"
                required
                class="form-input"
                :class="{ 'border-red-500': errors.lastName }"
                placeholder="Dela Cruz"
              />
              <p v-if="errors.lastName" class="form-error">
                {{ errors.lastName }}
              </p>
            </div>
          </div>

          <!-- Middle Name & Suffix Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label for="middleName" class="form-label">Middle Name</label>
              <input
                id="middleName"
                v-model="form.middleName"
                name="middleName"
                type="text"
                class="form-input"
                placeholder="Santos (Optional)"
              />
            </div>

            <div>
              <label for="suffix" class="form-label">Suffix</label>
              <input
                id="suffix"
                v-model="form.suffix"
                name="suffix"
                type="text"
                class="form-input"
                placeholder="Jr., Sr., III"
              />
            </div>
          </div>
        </div>

        <!-- Contact Information Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">
            <i class="fas fa-phone mr-2"></i>Contact Information
          </h3>

          <!-- Email -->
          <div>
            <label for="email" class="form-label">Email Address *</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.email }"
              placeholder="juan.delacruz@example.com"
            />
            <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
          </div>

          <!-- Phone Number -->
          <div>
            <label for="phoneNumber" class="form-label">Phone Number *</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.phoneNumber }"
              placeholder="09XX XXX XXXX"
            />
            <p v-if="errors.phoneNumber" class="form-error">
              {{ errors.phoneNumber }}
            </p>
          </div>
        </div>

        <!-- Address Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">
            <i class="fas fa-map-marker-alt mr-2"></i>Address
          </h3>

          <!-- House Number & Street -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="houseNumber" class="form-label">House No.</label>
              <input
                id="houseNumber"
                v-model="form.houseNumber"
                name="houseNumber"
                type="text"
                class="form-input"
                placeholder="123"
              />
            </div>

            <div class="md:col-span-2">
              <label for="street" class="form-label">Street *</label>
              <input
                id="street"
                v-model="form.street"
                name="street"
                type="text"
                required
                class="form-input"
                :class="{ 'border-red-500': errors.street }"
                placeholder="Rizal Street"
              />
              <p v-if="errors.street" class="form-error">
                {{ errors.street }}
              </p>
            </div>
          </div>

        </div>

        <!-- Account Security Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">
            <i class="fas fa-lock mr-2"></i>Account Security
          </h3>

          <!-- Password -->
          <div>
            <label for="password" class="form-label">Password *</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="form-input pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i
                  :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  class="text-gray-400 hover:text-gray-600"
                ></i>
              </button>
            </div>
            <p v-if="errors.password" class="form-error">
              {{ errors.password }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Must be at least 6 characters long
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="form-label">
              Confirm Password *
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="form-input pr-10"
                :class="{ 'border-red-500': errors.confirmPassword }"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i
                  :class="
                    showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                  "
                  class="text-gray-400 hover:text-gray-600"
                ></i>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="form-error">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="authStore.error"
          class="bg-red-50 border border-red-200 rounded-md p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ authStore.error }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full btn-primary"
          >
            <span v-if="authStore.loading" class="loading-spinner mr-2"></span>
            {{ authStore.loading ? "Creating account..." : "Create account" }}
          </button>
        </div>
      </form>

     
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import api from "@/services/api";

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const form = reactive({
  // Basic Information
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  // Contact Information
  email: "",
  phoneNumber: "",
  // Address
  houseNumber: "",
  street: "",
  barangay: "Bagong Barrio", // Default barangay
  city: "Caloocan", // Default city
  // Account Security
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  street: "",
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

  // First Name validation
  if (!form.firstName) {
    errors.firstName = "First name is required";
    isValid = false;
  } else if (form.firstName.length < 2) {
    errors.firstName = "First name must be at least 2 characters";
    isValid = false;
  }

  // Last Name validation
  if (!form.lastName) {
    errors.lastName = "Last name is required";
    isValid = false;
  } else if (form.lastName.length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
    isValid = false;
  }

  // Email validation
  if (!form.email) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Email is invalid";
    isValid = false;
  }

  // Phone Number validation
  if (!form.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
    isValid = false;
  } else if (!/^(09|\+639)\d{9}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
    errors.phoneNumber = "Invalid Philippine phone number";
    isValid = false;
  }

  // Street validation (required for profile completeness)
  if (!form.street) {
    errors.street = "Street is required";
    isValid = false;
  }

  // Password validation
  if (!form.password) {
    errors.password = "Password is required";
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
    isValid = false;
  }

  // Confirm Password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  try {
    const response = await api.post('/otp/registration/request', {
      // Basic Information
      firstName: form.firstName,
      middleName: form.middleName || null,
      lastName: form.lastName,
      suffix: form.suffix || null,
      // Contact Information
      email: form.email,
      phoneNumber: form.phoneNumber,
      // Address
      houseNumber: form.houseNumber || null,
      street: form.street,
      barangay: "Bagong Barrio", // Always set to Bagong Barrio
      city: "Caloocan", // Always set to Caloocan
      province: null,
      region: null,
      zipCode: null,
      // Account Security
      password: form.password,
    });

    toastStore.showSuccess(
      "OTP sent to your phone! Please verify to complete registration."
    );
    
    // Redirect to OTP verification page
    router.push({
      name: 'verify-otp',
      query: {
        otpId: response.data.otpId,
        type: 'registration',
        phone: form.phoneNumber,
        expiresAt: response.data.expiresAt,
      },
    });
  } catch (error) {
    toastStore.showError(
      error.response?.data?.message || 'Registration failed. Please try again.'
    );
  }
};

onMounted(() => {
  // Clear any existing errors
  authStore.clearError();
});
</script>
