import { Platform } from 'react-native';

/**
 * API base URL resolution (dev):
 * 1. EXPO_PUBLIC_API_URL — set in mobile-app/.env for physical devices
 *    Example: http://192.168.1.42:8000  (your PC's LAN IP)
 * 2. Android emulator → 10.0.2.2:8000 (host machine)
 * 3. iOS simulator / web → localhost:8000
 */
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;

  if (__DEV__) {
    return Platform.OS === 'android'
    ? 'http://172.20.10.5:8000'
    : 'http://172.20.10.5:8000'
  }
  return 'https://api.verityapp.com';
};

export const API_BASE_URL = getBaseUrl();

/** FastAPI returns errors in `detail`, not `message`. */
export function parseApiErrorBody(errorData: unknown, fallback: string): string {
  if (!errorData || typeof errorData !== 'object') return fallback;
  const data = errorData as { detail?: unknown; message?: string };
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => (typeof item === 'object' && item && 'msg' in item ? String((item as { msg: string }).msg) : String(item)))
      .join(', ');
  }
  return data.message || fallback;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const fetchClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal as any,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        response.status,
        parseApiErrorBody(errorData, `API request failed with status ${response.status}`),
        errorData
      );
    }

    return response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out');
    }
    throw new ApiError(0, error.message || 'Network error');
  }
};
