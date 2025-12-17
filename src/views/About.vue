<template>
  <PublicLayout>

    <!-- About Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          About Barangay Bagong Barrio
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn more about our community, our mission, and the services we
          provide to our residents.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p class="text-gray-600 mb-6">
            To serve the residents of Barangay Bagong Barrio with dedication,
            integrity, and excellence. we strive to provide efficient public
            services, foster community development, and maintain peace and order
            within our barangay.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
          <p class="text-gray-600 mb-6">
            A progressive, peaceful, and self-reliant community where residents
            enjoy quality public services, sustainable development, and a high
            quality of life.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Core Values</h2>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center">
              <i class="fas fa-check-circle text-blue-600 mr-3"></i>
              Service Excellence
            </li>
            <li class="flex items-center">
              <i class="fas fa-check-circle text-blue-600 mr-3"></i>
              Transparency and Accountability
            </li>
            <li class="flex items-center">
              <i class="fas fa-check-circle text-blue-600 mr-3"></i>
              Community Participation
            </li>
            <li class="flex items-center">
              <i class="fas fa-check-circle text-blue-600 mr-3"></i>
              Integrity and Honesty
            </li>
          </ul>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="text-center">
            <i class="fas fa-landmark text-blue-600 text-6xl mb-6"></i>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              Barangay Hall Information
            </h3>
            <div class="space-y-4 text-left">
              <div class="flex items-start space-x-3">
                <i class="fas fa-map-marker-alt text-blue-600 mt-1"></i>
                <div>
                  <p class="font-medium text-gray-900">Address</p>
                  <p class="text-gray-600">Bagong Barrio, City</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-phone text-blue-600 mt-1"></i>
                <div>
                  <p class="font-medium text-gray-900">Contact Number</p>
                  <p class="text-gray-600">(123) 456-7890</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-envelope text-blue-600 mt-1"></i>
                <div>
                  <p class="font-medium text-gray-900">Email</p>
                  <p class="text-gray-600">bagongbarrio@barangay.gov</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-clock text-blue-600 mt-1"></i>
                <div>
                  <p class="font-medium text-gray-900">Office Hours</p>
                  <p class="text-gray-600">
                    Monday - Friday: 8:00 AM - 5:00 PM
                  </p>
                  <p class="text-gray-600">Saturday: 8:00 AM - 12:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import PublicLayout from "@/layouts/PublicLayout.vue";
</script>
