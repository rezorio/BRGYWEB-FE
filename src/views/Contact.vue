<template>
  <PublicLayout>

    <!-- Contact Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Get in touch with Barangay Bagong Barrio for your concerns, inquiries,
          and service requests.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Send us a Message
          </h2>
          <form @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Full Name</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Email Address</label
              >
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Phone Number</label
              >
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Subject</label
              >
              <select
                v-model="form.subject"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="complaint">Complaint</option>
                <option value="service">Service Request</option>
                <option value="document">Document Request</option>
                <option value="emergency">Emergency Report</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Message</label
              >
              <textarea
                v-model="form.message"
                required
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message here..."
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <i class="fas fa-paper-plane mr-2"></i>
              Send Message
            </button>
          </form>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <i class="fas fa-map-marker-alt text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    Office Address
                  </h3>
                  <p class="text-gray-600">
                    Barangay Bagong Barrio Hall<br />
                    Main Street, Bagong Barrio<br />
                    City, Province 1234
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <i class="fas fa-phone text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    Phone Numbers
                  </h3>
                  <p class="text-gray-600">
                    Main Office: (123) 456-7890<br />
                    Hotline: (123) 456-7891<br />
                    Emergency: 911
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <i class="fas fa-envelope text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    Email Addresses
                  </h3>
                  <p class="text-gray-600">
                    General: bagongbarrio@barangay.gov<br />
                    Services: services@bagongbarrio.gov<br />
                    Emergency: emergency@bagongbarrio.gov
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <i class="fas fa-clock text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    Office Hours
                  </h3>
                  <p class="text-gray-600">
                    Monday - Friday: 8:00 AM - 5:00 PM<br />
                    Saturday: 8:00 AM - 12:00 PM<br />
                    Sunday & Holidays: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div class="flex items-center space-x-3 mb-4">
              <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
              <h3 class="text-xl font-bold text-red-900">Emergency Hotline</h3>
            </div>
            <p class="text-red-800 mb-2">
              For urgent matters and emergency situations, please call our 24/7
              hotline:
            </p>
            <p class="text-3xl font-bold text-red-600">(123) 456-7891</p>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref } from "vue";
import PublicLayout from "@/layouts/PublicLayout.vue";

const form = ref({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
});

const submitForm = () => {
  // Handle form submission
  alert("Thank you for your message! We will get back to you soon.");
  // Reset form
  form.value = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };
};
</script>
