// Simple script to clear activity logs for testing
console.log("Clearing activity logs from localStorage...");
if (typeof localStorage !== "undefined") {
  localStorage.removeItem("activityLogs");
  console.log("Activity logs cleared successfully!");
} else {
  console.log("localStorage not available in this environment");
}
