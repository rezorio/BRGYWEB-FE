/**
 * Session Management Utilities
 * Handles persistent user sessions with automatic recovery
 */

export const SESSION_CONFIG = {
  TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_THRESHOLD: 25 * 60 * 1000, // 25 minutes
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  HEARTBEAT_INTERVAL: 60 * 1000, // Check every minute
  ACTIVITY_EVENTS: [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
    "keydown",
    "keyup",
    "focus",
  ],
};

export class SessionManager {
  constructor() {
    this.heartbeatTimer = null;
    this.activityListeners = [];
    this.isMonitoring = false;
  }

  /**
   * Start monitoring user activity and session health
   */
  startMonitoring(authStore) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.authStore = authStore;

    // Start heartbeat
    this.startHeartbeat();

    // Setup activity monitoring
    this.setupActivityMonitoring();

    // Setup visibility monitoring
    this.setupVisibilityMonitoring();

    // Setup storage monitoring (for multi-tab sync)
    this.setupStorageMonitoring();
  }

  /**
   * Stop all monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.cleanupActivityMonitoring();
  }

  /**
   * Start heartbeat to check session health
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.authStore.isAuthenticated) {
        this.checkSessionHealth();
      }
    }, SESSION_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Check session health and take appropriate actions
   */
  async checkSessionHealth() {
    try {
      const timeRemaining = this.authStore.sessionTimeRemaining;

      // Check if session is expired
      if (timeRemaining <= 0) {
        this.handleSessionExpired();
        return;
      }

      // Check if session is about to expire
      if (timeRemaining <= SESSION_CONFIG.WARNING_THRESHOLD) {
        this.handleSessionWarning();
      }

      // Check if token needs refresh
      if (
        this.authStore.isTokenExpiringSoon &&
        this.authStore.isTokenExpiringSoon()
      ) {
        await this.refreshTokenIfNeeded();
      }
    } catch {
      console.error("Session health check failed");
    }
  }

  /**
   * Handle expired session
   */
  handleSessionExpired() {
    import("@/stores/toast.js").then(({ useToastStore }) => {
      useToastStore().showError("Session expired. Please login again.");
    });
    this.authStore.clearAuth();
    window.location.href = "/login";
  }

  /**
   * Handle session warning
   */
  handleSessionWarning() {
    // Warning is handled by SessionWarning component
    // This is just a backup
    if (!this.warningShown) {
      this.warningShown = true;
      import("@/stores/toast.js").then(({ useToastStore }) => {
        useToastStore().showWarning(
          "Session expiring soon. Please extend your session.",
        );
      });
    }
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded() {
    try {
      await this.authStore.refreshTokens();
    } catch {
      this.handleSessionExpired();
    }
  }

  /**
   * Setup activity monitoring
   */
  setupActivityMonitoring() {
    this.cleanupActivityMonitoring();

    const handleActivity = () => {
      if (this.authStore.isAuthenticated) {
        this.authStore.updateLastActivity();
        this.warningShown = false; // Reset warning on activity
      }
    };

    SESSION_CONFIG.ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
      this.activityListeners.push({ event, handler: handleActivity });
    });
  }

  /**
   * Cleanup activity monitoring
   */
  cleanupActivityMonitoring() {
    this.activityListeners.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler);
    });
    this.activityListeners = [];
  }

  /**
   * Setup visibility monitoring
   */
  setupVisibilityMonitoring() {
    this.handleVisibilityChange = () => {
      if (!document.hidden && this.authStore.isAuthenticated) {
        // User returned to tab - check session
        if (this.authStore.sessionTimeRemaining <= 0) {
          this.handleSessionExpired();
        }
      }
    };

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  /**
   * Setup storage monitoring for multi-tab sync
   */
  setupStorageMonitoring() {
    this.handleStorageChange = (e) => {
      if (e.key === "lastActivity" && this.authStore) {
        this.authStore.lastActivity = parseInt(e.newValue) || Date.now();
      }
    };

    window.addEventListener("storage", this.handleStorageChange);
  }

  /**
   * Cleanup all event listeners
   */
  cleanup() {
    this.stopMonitoring();

    if (this.handleVisibilityChange) {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }

    if (this.handleStorageChange) {
      window.removeEventListener("storage", this.handleStorageChange);
    }
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

/**
 * Utility functions for session management
 */
export const sessionUtils = {
  /**
   * Format time remaining in human-readable format
   */
  formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return "Expired";

    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  },

  /**
   * Get session status color
   */
  getSessionStatusColor(timeRemaining) {
    if (timeRemaining <= 5 * 60 * 1000) return "red";
    if (timeRemaining <= 10 * 60 * 1000) return "yellow";
    return "green";
  },

  /**
   * Check if session is healthy
   */
  isSessionHealthy(timeRemaining) {
    return timeRemaining > SESSION_CONFIG.TOKEN_REFRESH_THRESHOLD;
  },

  /**
   * Get session progress percentage
   */
  getSessionProgress(timeRemaining) {
    const totalSessionTime = SESSION_CONFIG.TIMEOUT;
    return Math.max(0, Math.min(100, (timeRemaining / totalSessionTime) * 100));
  },
};
