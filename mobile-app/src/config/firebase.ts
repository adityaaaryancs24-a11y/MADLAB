// Firebase configuration for Verity
// Credentials are stored here directly (no .env needed for Expo Go development).
// For production builds, move these to app.config.js extra fields and read via
// expo-constants so they are not bundled in plain text.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBjldosddPFBa382pLrmUBttHQ5UqRsLVQ",
  authDomain: "verity-97ac6.firebaseapp.com",
  projectId: "verity-97ac6",
  storageBucket: "verity-97ac6.firebasestorage.app",
  messagingSenderId: "679442783273",
  appId: "1:679442783273:web:a69158528a544054c71038",
  measurementId: "G-RX9B244CJS",
};

// Guard against duplicate initialisation (React hot-reload creates multiple calls)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export default app;
