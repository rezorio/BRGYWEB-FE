<template>
  <PublicLayout>

    <!-- Services Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Barangay Bagong Barrio offers a comprehensive range of services to
          serve our community better.
        </p>
      </div>

      <!-- Service Categories -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div
          v-for="service in services"
          :key="service.id"
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div class="p-6">
            <div
              class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4"
            >
              <i :class="service.icon" class="text-blue-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              {{ service.title }}
            </h3>
            <p class="text-gray-600 mb-4">{{ service.description }}</p>
            <ul class="space-y-2 text-sm text-gray-600">
              <li
                v-for="feature in service.features"
                :key="feature"
                class="flex items-center"
              >
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Document Services Section -->
      <div class="bg-blue-600 rounded-2xl p-8 text-white mb-16">
        <div class="text-center">
          <h2 class="text-3xl font-bold mb-4">Need Official Documents?</h2>
          <p class="text-xl mb-8 opacity-90">
            Request barangay certificates, clearances, and other documents
            online through our portal.
          </p>
          <router-link
            to="/request-document"
            class="cta-link inline-flex items-center"
          >
            <i class="fas fa-file-alt mr-3"></i>
            Request a Document
          </router-link>
        </div>
      </div>

      <!-- Service Process -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-6">
            How to Avail Our Services
          </h2>
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div
                class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-white font-bold">1</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Visit Our Office
                </h3>
                <p class="text-gray-600">
                  Come to the barangay hall during office hours with your
                  requirements.
                </p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-white font-bold">2</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Submit Requirements
                </h3>
                <p class="text-gray-600">
                  Present necessary documents and fill out the required forms.
                </p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-white font-bold">3</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Processing
                </h3>
                <p class="text-gray-600">
                  Our staff will process your request promptly and efficiently.
                </p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-white font-bold">4</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Receive Service
                </h3>
                <p class="text-gray-600">
                  Get your documents or services on the promised date.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Service Hours</h3>
          <div class="space-y-4">
            <div
              class="flex justify-between items-center py-3 border-b border-gray-200"
            >
              <span class="font-medium text-gray-900">Monday - Friday</span>
              <span class="text-gray-600">8:00 AM - 5:00 PM</span>
            </div>
            <div
              class="flex justify-between items-center py-3 border-b border-gray-200"
            >
              <span class="font-medium text-gray-900">Saturday</span>
              <span class="text-gray-600">8:00 AM - 12:00 PM</span>
            </div>
            <div
              class="flex justify-between items-center py-3 border-b border-gray-200"
            >
              <span class="font-medium text-gray-900">Sunday</span>
              <span class="text-gray-600">Closed</span>
            </div>
            <div class="flex justify-between items-center py-3">
              <span class="font-medium text-gray-900">Holidays</span>
              <span class="text-gray-600">Closed</span>
            </div>
          </div>

          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle mr-2"></i>
              For emergency services, please call our hotline: (123) 456-7891
            </p>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref } from "vue";
import PublicLayout from "@/layouts/PublicLayout.vue";

const services = ref([
  {
    id: 1,
    icon: "fas fa-file-certificate",
    title: "Document Services",
    description: "Official barangay documents and certificates",
    features: [
      "Barangay Certificate",
      "Residency Certificate",
      "Clearance Certificate",
      "Indigency Certificate",
    ],
  },
  {
    id: 2,
    icon: "fas fa-hands-helping",
    title: "Social Services",
    description: "Assistance programs for residents in need",
    features: [
      "Financial Assistance",
      "Medical Assistance",
      "Educational Support",
      "Livelihood Programs",
    ],
  },
  {
    id: 3,
    icon: "fas fa-shield-alt",
    title: "Peace & Order",
    description: "Maintaining safety and security in the community",
    features: [
      "Tanod Services",
      "Dispute Resolution",
      "Emergency Response",
      "Community Watch",
    ],
  },
  {
    id: 4,
    icon: "fas fa-broom",
    title: "Environmental Services",
    description: "Clean and green programs for the community",
    features: [
      "Waste Management",
      "Tree Planting",
      "Clean-up Drives",
      "Recycling Programs",
    ],
  },
  {
    id: 5,
    icon: "fas fa-users",
    title: "Community Development",
    description: "Programs for community growth and development",
    features: [
      "Youth Programs",
      "Senior Citizens Services",
      "Women's Development",
      "Sports Activities",
    ],
  },
  {
    id: 6,
    icon: "fas fa-heartbeat",
    title: "Health Services",
    description: "Basic health and wellness programs",
    features: [
      "Health Check-ups",
      "Vaccination Programs",
      "Health Education",
      "Medical Referrals",
    ],
  },
]);
</script>
