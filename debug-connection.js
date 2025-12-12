// Debug script to test frontend-backend connection
console.log("Testing frontend-backend connection...");

// Test 1: Check if Vite proxy is working
fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@example.com",
    password: "admin123",
  }),
})
  .then((response) => {
    console.log("✅ Response received:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("✅ Login successful:", data);
  })
  .catch((error) => {
    console.error("❌ Login failed:", error);
  });
