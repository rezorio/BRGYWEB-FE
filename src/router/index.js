import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/About.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("@/views/Contact.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/services",
      name: "services",
      component: () => import("@/views/Services.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/request-document",
      name: "request-document",
      component: () => import("@/views/RequestDocument.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/auth/Login.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/auth/Register.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("@/views/auth/ForgotPassword.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/verify-otp",
      name: "verify-otp",
      component: () => import("@/views/auth/VerifyOTP.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("@/views/auth/ResetPassword.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/Profile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/admin/AdminPanel.vue"),
      meta: { requiresAuth: true, requiresRole: ["Admin", "Super Admin"] },
    },
    {
      path: "/admin/announcements",
      name: "admin-announcements",
      component: () => import("@/views/admin/AnnouncementsManagement.vue"),
      meta: { requiresAuth: true, requiresRole: ["Admin", "Super Admin"] },
    },
    {
      path: "/admin/template-test",
      name: "admin-template-test",
      component: () => import("@/views/admin/TemplateTest.vue"),
      meta: { requiresAuth: true, requiresRole: ["Admin", "Super Admin"] },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Update activity on navigation
  if (authStore.isAuthenticated) {
    authStore.updateLastActivity();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
    return;
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect based on user role
    if (authStore.userRole === "Citizen") {
      next("/");
    } else {
      next("/dashboard");
    }
    return;
  }

  // Check if route requires specific role
  if (to.meta.requiresRole && authStore.isAuthenticated) {
    const userRole = authStore.userRole;
    
    // If userRole is not loaded yet (page refresh), allow navigation and let it load
    if (!userRole) {
      next();
      return;
    }
    
    // Check if user has the required role
    if (!to.meta.requiresRole.includes(userRole)) {
      // Prevent infinite redirect loop
      const redirectPath = userRole === "Citizen" ? "/" : "/dashboard";
      
      // Don't redirect if already going to the redirect target
      if (to.path !== redirectPath) {
        // Show access denied message
        import("@/stores/toast.js").then(({ useToastStore }) => {
          useToastStore().showError("Access denied. You do not have permission to access this page.");
        });
        
        next(redirectPath);
        return;
      }
    }
  }

  // For authenticated routes, check session validity
  if (to.meta.requiresAuth && authStore.isAuthenticated) {
    // Check if session is expired
    if (authStore.sessionTimeRemaining <= 0) {
      import("@/stores/toast.js").then(({ useToastStore }) => {
        useToastStore().showError("Session expired. Please login again.");
      });
      authStore.clearAuth();
      next("/login");
      return;
    }

    // Check if token needs refresh
    if (authStore.isTokenExpiringSoon && authStore.isTokenExpiringSoon()) {
      try {
        await authStore.refreshTokens();
      } catch {
        import("@/stores/toast.js").then(({ useToastStore }) => {
          useToastStore().showError("Session expired. Please login again.");
        });
        authStore.clearAuth();
        next("/login");
        return;
      }
    }
  }

  next();
});

export default router;
