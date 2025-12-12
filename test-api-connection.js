// Test API connection
import api from "./src/services/api.js";

// Test connection to backend
async function testConnection() {
  try {
    console.log("Testing API connection...");

    // Test if backend is reachable
    const response = await api.get("/auth/protected");
    console.log("✅ API Connection successful:", response.status);
  } catch (error) {
    console.error("❌ API Connection failed:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Full error:", error);
  }
}

testConnection();
