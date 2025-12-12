import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(router).use(pinia);

// Initialize session before mounting app
const initializeApp = async () => {
  const { useAuthStore } = await import("./stores/auth.js");
  const authStore = useAuthStore();

  // Try to initialize session from stored tokens
  await authStore.initializeSession();

  // Mount the app
  app.mount("#app");
};

initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error);
  app.mount("#app");
});
