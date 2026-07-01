// Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MASTER_ADMIN: 'master_admin',
} as const;

export const STORAGE_KEYS = {
  CURRENT_USER: 'btg_current_user_v1',
  CURRENT_USER_ROLE: 'btg_current_user_role_v1',
  STATS: 'btg_stats_v1',
  ACCOUNTS: 'btg_accounts_v1',
} as const;

export const GAME_CONFIGS = {
  SPIN_INTERVALS: {
    USER: 120000,      // 120 seconds
    ADMIN: 120000,     // 120 seconds (limited)
    MASTER_ADMIN: 10000, // 10 seconds (full power)
  },
  ALERT_DISMISS_TIME: 2000, // 2 seconds
  NUMBERS: Array.from({ length: 9 }, (_, i) => i + 1),
} as const;
