import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

import { errorHandler } from "./error-handler";
import ValidationError from "./validation-errors";

export const API_URL = import.meta.env.VITE_API_BASE_URL || "";

const ACCESS_COOKIE = "auth_token";
const REFRESH_COOKIE = "refresh_token";

export interface AuthTokens {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
}

/** Persist the access + refresh tokens (cookie expiry matches each token's). */
export function setAuthTokens(tokens: AuthTokens) {
  Cookies.set(ACCESS_COOKIE, tokens.token, { expires: new Date(tokens.expiresAt) });
  Cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    expires: new Date(tokens.refreshExpiresAt),
  });
}

export function clearAuthTokens() {
  Cookies.remove(ACCESS_COOKIE);
  Cookies.remove(REFRESH_COOKIE);
}

export const httpService = axios.create({
  baseURL: API_URL,
});

httpService.interceptors.request.use(
  (config) => {
    const token = Cookies.get(ACCESS_COOKIE);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single-flight refresh: concurrent 401s share one /refresh call.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = Cookies.get(REFRESH_COOKIE);
  if (!refreshToken) return null;

  if (!refreshPromise) {
    // Bare axios (not httpService) so this call skips the interceptors.
    refreshPromise = axios
      .post<AuthTokens>(`${API_URL}/refresh`, { refreshToken })
      .then((res) => {
        setAuthTokens(res.data);
        return res.data.token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

httpService.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (status === 422) {
      throw new ValidationError(error.response.data);
    }

    // On an expired access token, try to refresh once, then replay the request.
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/refresh")
    ) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return httpService(original);
      }
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.assign("/login");
    }

    if (error?.response) {
      errorHandler(error); // throws ApiError
    }
    return Promise.reject(error);
  }
);

export const readData = httpService.get;
export const createData = httpService.post;
export const updateData = httpService.put;
export const updateDataPartially = httpService.patch;
export const deleteData = httpService.delete;

/** Revoke the refresh token server-side, then clear local auth. */
export async function logout() {
  const refreshToken = Cookies.get(REFRESH_COOKIE);
  try {
    if (refreshToken) await axios.post(`${API_URL}/logout`, { refreshToken });
  } catch {
    /* best-effort; clear locally regardless */
  }
  clearAuthTokens();
}
