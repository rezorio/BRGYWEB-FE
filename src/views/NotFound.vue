<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div
          class="mx-auto h-24 w-24 bg-blue-100 rounded-lg flex items-center justify-center mb-6"
        >
          <i class="fas fa-search text-blue-600 text-3xl"></i>
        </div>
        <h1 class="text-6xl font-bold text-gray-900">404</h1>
        <h2 class="mt-4 text-3xl font-extrabold text-gray-900">
          Page not found
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div class="mt-6">
          <router-link to="/" class="btn-primary">
            <i class="fas fa-home mr-2"></i>
            Go back home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No script needed for this simple component
</script>
