import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchClient } from "./api";
import type { AuthCredentials, AuthResponse, RegisterCredentials, User } from "../src/types";

const TOKEN_KEY = "verity_access_token";

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function storeToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function loginUser(credentials: AuthCredentials) {
  return fetchClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(credentials: RegisterCredentials) {
  return fetchClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function fetchCurrentUser(token: string) {
  return fetchClient<User>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
