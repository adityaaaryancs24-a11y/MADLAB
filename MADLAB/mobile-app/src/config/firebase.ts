import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth };
