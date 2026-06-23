import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlr6h2IytV6bf5isRwGxklSY40DvckOOM",
  authDomain: "verity46-f6777.firebaseapp.com",
  projectId: "verity46-f6777",
  storageBucket: "verity46-f6777.firebasestorage.app",
  messagingSenderId: "978470608685",
  appId: "1:978470608685:web:f24dfda1299c2938427da4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the SDK's default Auth instance. The installed Firebase wrapper does not
// expose getReactNativePersistence from "firebase/auth", so initializeAuth()
// would crash during module load in Expo Go.
const auth = getAuth(app);

export { app, auth };
