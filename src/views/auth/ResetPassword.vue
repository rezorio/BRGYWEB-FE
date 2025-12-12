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
          <i class="fas fa-lock text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Reset Password
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your new password for {{ maskedEmail }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleResetPassword" class="mt-8 space-y-6">
        <!-- New Password -->
        <div>
          <label for="password" class="form-label">New Password *</label>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="form-input pr-10"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Enter new password"
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
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
          
          <!-- Password strength indicator -->
          <div v-if="form.password" class="mt-2">
            <div class="flex items-center space-x-2">
              <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  :class="passwordStrengthColor"
                  :style="{ width: passwordStrengthWidth }"
                  class="h-full transition-all duration-300"
                ></div>
              </div>
              <span :class="passwordStrengthColor" class="text-xs font-medium">
                {{ passwordStrengthText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="form-label">Confirm Password *</label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="form-input pr-10"
              :class="{ 'border-red-500': errors.confirmPassword }"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <i
                :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                class="text-gray-400 hover:text-gray-600"
              ></i>
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="form-error">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Password Requirements -->
        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p class="text-sm font-medium text-blue-900 mb-2">
            Password must contain:
          </p>
          <ul class="text-sm text-blue-800 space-y-1">
            <li :class="hasMinLength ? 'text-green-600' : ''">
              <i :class="hasMinLength ? 'fas fa-check' : 'fas fa-circle'" class="text-xs mr-2"></i>
              At least 8 characters
            </li>
            <li :class="hasUpperCase ? 'text-green-600' : ''">
              <i :class="hasUpperCase ? 'fas fa-check' : 'fas fa-circle'" class="text-xs mr-2"></i>
              One uppercase letter
            </li>
            <li :class="hasLowerCase ? 'text-green-600' : ''">
              <i :class="hasLowerCase ? 'fas fa-check' : 'fas fa-circle'" class="text-xs mr-2"></i>
              One lowercase letter
            </li>
            <li :class="hasNumber ? 'text-green-600' : ''">
              <i :class="hasNumber ? 'fas fa-check' : 'fas fa-circle'" class="text-xs mr-2"></i>
              One number
            </li>
          </ul>
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
            :disabled="loading || !isFormValid"
            class="w-full btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': loading || !isFormValid }"
          >
            <span v-if="loading" class="loading-spinner mr-2"></span>
            {{ loading ? 'Resetting Password...' : 'Reset Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const resetToken = ref(route.query.token || '');
const email = ref(route.query.email || '');

const form = ref({
  password: '',
  confirmPassword: '',
});

const errors = ref({
  password: '',
  confirmPassword: '',
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const error = ref('');

// Password validation
const hasMinLength = computed(() => form.value.password.length >= 8);
const hasUpperCase = computed(() => /[A-Z]/.test(form.value.password));
const hasLowerCase = computed(() => /[a-z]/.test(form.value.password));
const hasNumber = computed(() => /\d/.test(form.value.password));

const passwordStrength = computed(() => {
  let strength = 0;
  if (hasMinLength.value) strength++;
  if (hasUpperCase.value) strength++;
  if (hasLowerCase.value) strength++;
  if (hasNumber.value) strength++;
  return strength;
});

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 4) * 100}%`;
});

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-red-500 text-red-600';
  if (passwordStrength.value === 2) return 'bg-yellow-500 text-yellow-600';
  if (passwordStrength.value === 3) return 'bg-blue-500 text-blue-600';
  return 'bg-green-500 text-green-600';
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value <= 1) return 'Weak';
  if (passwordStrength.value === 2) return 'Fair';
  if (passwordStrength.value === 3) return 'Good';
  return 'Strong';
});

const isFormValid = computed(() => {
  return (
    hasMinLength.value &&
    hasUpperCase.value &&
    hasLowerCase.value &&
    hasNumber.value &&
    form.value.password === form.value.confirmPassword
  );
});

const maskedEmail = computed(() => {
  if (!email.value) return '';
  const [username, domain] = email.value.split('@');
  if (!username || !domain) return email.value;
  const maskedUsername =
    username.charAt(0) +
    '*'.repeat(Math.max(0, username.length - 2)) +
    (username.length > 1 ? username.charAt(username.length - 1) : '');
  return `${maskedUsername}@${domain}`;
});

const validateForm = () => {
  let isValid = true;
  errors.value = { password: '', confirmPassword: '' };
  error.value = '';

  if (!form.value.password) {
    errors.value.password = 'Password is required';
    isValid = false;
  } else if (!isFormValid.value) {
    errors.value.password = 'Password does not meet requirements';
    isValid = false;
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

const handleResetPassword = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    error.value = '';

    await api.patch('/otp/password-reset/complete', {
      resetToken: resetToken.value,
      newPassword: form.value.password,
    });

    toastStore.showSuccess('Password reset successful! You can now login with your new password.');
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reset password. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
