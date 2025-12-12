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
          <i class="fas fa-shield-alt text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Verify OTP
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter the 6-digit code sent to your phone
        </p>
        <p class="mt-1 text-sm font-medium text-gray-900">
          {{ maskedPhone }}
        </p>
      </div>

      <!-- Timer -->
      <div class="text-center">
        <div v-if="!isExpired" class="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
          <i class="fas fa-clock text-blue-600 mr-2"></i>
          <span class="text-sm font-medium text-blue-900">
            Code expires in {{ formatTime(timeRemaining) }}
          </span>
        </div>
        <div v-else class="inline-flex items-center px-4 py-2 bg-red-50 rounded-lg">
          <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
          <span class="text-sm font-medium text-red-900">
            Code expired
          </span>
        </div>
      </div>

      <!-- OTP Input -->
      <form @submit.prevent="handleVerify" class="mt-8 space-y-6">
        <div>
          <label class="form-label text-center block mb-4">
            Enter 6-Digit Code
          </label>
          <div class="flex justify-center space-x-2">
            <input
              v-for="(digit, index) in otpDigits"
              :key="index"
              :ref="el => otpInputs[index] = el"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]"
              class="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              :class="{ 'border-red-500': error }"
              @input="handleInput(index, $event)"
              @keydown="handleKeyDown(index, $event)"
              @paste="handlePaste"
            />
          </div>
          <p v-if="error" class="mt-2 text-sm text-red-600 text-center">
            {{ error }}
          </p>
        </div>

        <!-- Attempts Remaining -->
        <div v-if="attempts > 0" class="text-center">
          <p class="text-sm text-gray-600">
            Attempts remaining: <span class="font-semibold">{{ 5 - attempts }}</span>
          </p>
        </div>

        <!-- Verify Button -->
        <div>
          <button
            type="submit"
            :disabled="loading || !isCodeComplete || isExpired"
            class="w-full btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': loading || !isCodeComplete || isExpired }"
          >
            <span v-if="loading" class="loading-spinner mr-2"></span>
            {{ loading ? 'Verifying...' : 'Verify Code' }}
          </button>
        </div>

        <!-- Resend OTP -->
        <div class="text-center">
          <button
            type="button"
            @click="handleResend"
            :disabled="resendLoading || resendCooldown > 0"
            class="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="resendLoading" class="loading-spinner mr-2"></span>
            <span v-if="resendCooldown > 0">
              Resend code in {{ resendCooldown }}s
            </span>
            <span v-else>
              Didn't receive code? Resend
            </span>
          </button>
        </div>

        <!-- Back Link -->
        <div class="text-center">
          <button
            type="button"
            @click="goBack"
            class="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <i class="fas fa-arrow-left mr-1"></i>
            Go back
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const authStore = useAuthStore();

const otpId = ref(route.query.otpId || '');
const verificationType = ref(route.query.type || 'registration'); // registration or password-reset
const phoneNumber = ref(route.query.phone || '');
const expiresAt = ref(route.query.expiresAt ? new Date(route.query.expiresAt) : null);

const otpDigits = ref(['', '', '', '', '', '']);
const otpInputs = ref([]);
const loading = ref(false);
const resendLoading = ref(false);
const error = ref('');
const attempts = ref(0);
const timeRemaining = ref(0);
const resendCooldown = ref(0);

let timerInterval = null;
let resendInterval = null;

const maskedPhone = computed(() => {
  if (!phoneNumber.value) return '';
  const phone = phoneNumber.value.toString();
  if (phone.length < 4) return phone;
  return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
});

const isCodeComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

const isExpired = computed(() => {
  return timeRemaining.value <= 0;
});

const otpCode = computed(() => {
  return otpDigits.value.join('');
});

// Update timer
const updateTimer = () => {
  if (!expiresAt.value) return;
  
  const now = new Date().getTime();
  const expiry = new Date(expiresAt.value).getTime();
  const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
  
  timeRemaining.value = remaining;
  
  if (remaining === 0) {
    clearInterval(timerInterval);
  }
};

// Format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Handle input
const handleInput = (index, event) => {
  const value = event.target.value;
  
  // Only allow numbers
  if (value && !/^\d$/.test(value)) {
    otpDigits.value[index] = '';
    return;
  }
  
  otpDigits.value[index] = value;
  error.value = '';
  
  // Auto-focus next input
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

// Handle keydown
const handleKeyDown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
  
  if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
  
  if (event.key === 'ArrowRight' && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

// Handle paste
const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text').trim();
  
  if (!/^\d{6}$/.test(pastedData)) {
    error.value = 'Please paste a valid 6-digit code';
    return;
  }
  
  const digits = pastedData.split('');
  otpDigits.value = digits;
  otpInputs.value[5]?.focus();
};

// Verify OTP
const handleVerify = async () => {
  if (!isCodeComplete.value || isExpired.value) return;
  
  try {
    loading.value = true;
    error.value = '';
    
    if (verificationType.value === 'registration') {
      const response = await api.post('/otp/registration/verify', {
        otpId: otpId.value,
        code: otpCode.value,
      });
      
      // Store tokens and user data
      authStore.setTokens(response.data.accessToken, response.data.refreshToken);
      authStore.setUser(response.data.user);
      
      toastStore.showSuccess('Registration successful! Welcome!');
      router.push('/dashboard');
    } else {
      // Password reset verification
      const response = await api.post('/otp/password-reset/verify', {
        otpId: otpId.value,
        code: otpCode.value,
      });
      
      // Redirect to password reset page with token
      router.push({
        name: 'reset-password',
        query: {
          token: response.data.resetToken,
          email: response.data.email,
        },
      });
    }
  } catch (err) {
    attempts.value += 1;
    
    if (err.response?.status === 401) {
      error.value = 'Invalid code. Please try again.';
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'Verification failed. Please try again.';
    }
    
    // Clear inputs on error
    otpDigits.value = ['', '', '', '', '', ''];
    otpInputs.value[0]?.focus();
  } finally {
    loading.value = false;
  }
};

// Resend OTP
const handleResend = async () => {
  if (resendCooldown.value > 0) return;
  
  try {
    resendLoading.value = true;
    error.value = '';
    
    const response = await api.post(`/otp/resend/${otpId.value}`);
    
    // Update expiry time
    expiresAt.value = new Date(response.data.expiresAt);
    updateTimer();
    
    // Start resend cooldown (60 seconds)
    resendCooldown.value = 60;
    resendInterval = setInterval(() => {
      resendCooldown.value -= 1;
      if (resendCooldown.value <= 0) {
        clearInterval(resendInterval);
      }
    }, 1000);
    
    toastStore.showSuccess('New code sent to your phone');
    
    // Clear inputs
    otpDigits.value = ['', '', '', '', '', ''];
    otpInputs.value[0]?.focus();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to resend code';
  } finally {
    resendLoading.value = false;
  }
};

// Go back
const goBack = () => {
  if (verificationType.value === 'registration') {
    router.push('/register');
  } else {
    router.push('/forgot-password');
  }
};

onMounted(() => {
  // Validate required params
  if (!otpId.value || !phoneNumber.value || !expiresAt.value) {
    toastStore.showError('Invalid verification link');
    router.push('/login');
    return;
  }
  
  // Start timer
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  
  // Focus first input
  otpInputs.value[0]?.focus();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (resendInterval) clearInterval(resendInterval);
});
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
