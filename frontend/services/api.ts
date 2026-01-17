/**
 * API Service
 *
 * Centralized API client for all backend requests.
 * Handles authentication, token refresh, and error handling.
 *
 * @example
 * import api from '@/services/api';
 *
 * // Make authenticated request
 * const response = await api.get('/users/me');
 *
 * // Post data
 * await api.post('/blueprint/response', { statementId, response });
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// ===========================================
// Configuration
// ===========================================

// API base URL - adjust for your environment
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ===========================================
// Axios Instance
// ===========================================

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===========================================
// Token Management
// ===========================================

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// ===========================================
// Request Interceptor
// ===========================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===========================================
// Response Interceptor (Token Refresh)
// ===========================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: Error) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        await clearTokens();
        // Could dispatch a logout action here
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===========================================
// Auth API Methods
// ===========================================

export interface User {
  id: string;
  email: string;
  createdAt: string;
  profile?: {
    ageRange?: string;
    location?: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
    });
    await setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    await setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      await clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/users/me');
    return response.data.user;
  },
};

// ===========================================
// Blueprint API Methods
// ===========================================

export interface PolicyStatement {
  id: string;
  statementText: string;
  issueArea: string;
  specificityLevel: string;
}

export const blueprintApi = {
  async getStatements(): Promise<PolicyStatement[]> {
    const response = await api.get<{ statements: PolicyStatement[] }>('/blueprint/statements');
    return response.data.statements;
  },

  async submitResponse(statementId: string, response: 'approve' | 'disapprove'): Promise<void> {
    await api.post('/blueprint/response', { statementId, response });
  },

  async getProgress(): Promise<{ totalAnswered: number; byCategory: Record<string, number> }> {
    const response = await api.get('/blueprint/progress');
    return response.data;
  },
};

// ===========================================
// Civic Axes API Methods
// ===========================================

import type {
  Spec,
  Domain,
  Axis,
  Item,
  SwipeResponse,
} from '../types/civicAssessment';

export interface AxisScore {
  axis_id: string;
  raw_sum: number;
  n_answered: number;
  n_unsure: number;
  normalized: number;
  shrunk: number;
  confidence: number;
  top_drivers: string[];
}

export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
}

export interface ScoreResponse {
  scores: AxisScore[];
  scoringConfig: {
    axis_range: [number, number];
    normalize_by_max: boolean;
    shrinkage_k: number;
    unsure_treatment: string;
    confidence_heuristic: string;
  };
}

export interface SessionResponse {
  items: Item[];
  count: number;
  responseScale: Record<SwipeResponse, number>;
}

export const civicAxesApi = {
  /**
   * Get the full civic axes specification
   */
  async getSpec(): Promise<Spec> {
    const response = await api.get<Spec>('/civic-axes/spec');
    return response.data;
  },

  /**
   * Get summary of the spec (counts, domain names)
   */
  async getSummary(): Promise<{
    version: string;
    domainCount: number;
    axisCount: number;
    itemCount: number;
    domains: Array<{ id: string; name: string; axisCount: number }>;
  }> {
    const response = await api.get('/civic-axes/summary');
    return response.data;
  },

  /**
   * Get all policy domains
   */
  async getDomains(): Promise<{ domains: Domain[]; count: number }> {
    const response = await api.get('/civic-axes/domains');
    return response.data;
  },

  /**
   * Get a domain with its axes
   */
  async getDomain(domainId: string): Promise<{ domain: Domain; axes: Axis[] }> {
    const response = await api.get(`/civic-axes/domains/${domainId}`);
    return response.data;
  },

  /**
   * Get all axes
   */
  async getAxes(): Promise<{ axes: Axis[]; count: number }> {
    const response = await api.get('/civic-axes/axes');
    return response.data;
  },

  /**
   * Get a single axis
   */
  async getAxis(axisId: string): Promise<Axis> {
    const response = await api.get(`/civic-axes/axes/${axisId}`);
    return response.data;
  },

  /**
   * Get items for an assessment session
   */
  async getSessionItems(options?: {
    count?: number;
    level?: string;
    excludeIds?: string[];
  }): Promise<SessionResponse> {
    const params = new URLSearchParams();
    if (options?.count) params.append('count', options.count.toString());
    if (options?.level) params.append('level', options.level);
    if (options?.excludeIds?.length) params.append('excludeIds', options.excludeIds.join(','));

    const response = await api.get<SessionResponse>(`/civic-axes/session?${params}`);
    return response.data;
  },

  /**
   * Get all items (with optional filters)
   */
  async getItems(options?: {
    level?: string;
    tag?: string;
    axisId?: string;
  }): Promise<{ items: Item[]; count: number }> {
    const params = new URLSearchParams();
    if (options?.level) params.append('level', options.level);
    if (options?.tag) params.append('tag', options.tag);
    if (options?.axisId) params.append('axisId', options.axisId);

    const response = await api.get(`/civic-axes/items?${params}`);
    return response.data;
  },

  /**
   * Score responses using the backend scoring algorithm
   */
  async scoreResponses(responses: SwipeEvent[]): Promise<ScoreResponse> {
    const response = await api.post<ScoreResponse>('/civic-axes/score', { responses });
    return response.data;
  },

  /**
   * Get the response scale mapping
   */
  async getResponseScale(): Promise<Record<SwipeResponse, number>> {
    const response = await api.get('/civic-axes/response-scale');
    return response.data;
  },

  /**
   * Get all unique tags
   */
  async getTags(): Promise<{ tags: string[]; count: number }> {
    const response = await api.get('/civic-axes/tags');
    return response.data;
  },
};

// ===========================================
// Export
// ===========================================

export default api;
