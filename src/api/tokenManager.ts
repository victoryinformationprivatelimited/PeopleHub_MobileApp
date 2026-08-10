import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import config from "../config";

/**
 * Ported from PeopleHub-ESS/src/api/tokenManager.ts (web), swapping js-cookie
 * for expo-secure-store (iOS Keychain / Android Keystore) per
 * ESS-Mobile-App-Plan.md §2 — NOT AsyncStorage/localStorage, which aren't
 * secure storage. SecureStore has no web implementation, so this falls back
 * to localStorage on web ONLY for local dev verification in a browser (no
 * simulator/device available in this environment) — that fallback is not
 * secure and must not ship to a real web target.
 */
const ACCESS_KEY = "ess_access_token";
const REFRESH_KEY = "ess_refresh_token";
const REFRESH_SKEW_MS = 15 * 60 * 1000;

const isWeb = Platform.OS === "web";

async function storageSet(key: string, value: string) {
  if (isWeb) {
    window.localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function storageGet(key: string): Promise<string | null> {
  if (isWeb) {
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function storageRemove(key: string) {
  if (isWeb) {
    window.localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

interface TokenResult {
  token: string | null;
  status: number;
  message?: string;
}

async function setSession(accessToken: string, refreshToken: string) {
  await storageSet(ACCESS_KEY, accessToken);
  await storageSet(REFRESH_KEY, refreshToken);
}

async function clearSession() {
  await storageRemove(ACCESS_KEY);
  await storageRemove(REFRESH_KEY);
}

function isExpiringSoon(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const expiresAt = decoded.exp * 1000;
    return expiresAt - Date.now() < REFRESH_SKEW_MS;
  } catch {
    return true;
  }
}

let refreshInFlight: Promise<TokenResult> | null = null;

async function refreshAccessToken(): Promise<TokenResult> {
  const refreshToken = await storageGet(REFRESH_KEY);
  if (!refreshToken) return { token: null, status: 401, message: "No refresh token" };

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/User/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-ID": config.tenantId },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await clearSession();
      return { token: null, status: response.status, message: "Session expired" };
    }

    const data = await response.json();
    // /User/refresh-token returns {accessToken, refreshToken} — a different casing than
    // /User/login's {acctoken, refToken} for the same concept, confirmed against the real
    // backend response. Not a client-side guess: without this, every refresh silently stored
    // "undefined" as the token and broke the session on the next request.
    await setSession(data.accessToken, data.refreshToken);
    return { token: data.accessToken, status: 200 };
  } catch {
    return { token: null, status: 0, message: "Network error during refresh" };
  }
}

async function getValidAccessToken(): Promise<TokenResult> {
  const token = await storageGet(ACCESS_KEY);
  if (!token) return { token: null, status: 401, message: "Not authenticated" };

  if (!isExpiringSoon(token)) return { token, status: 200 };

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function hasSession(): Promise<boolean> {
  const token = await storageGet(ACCESS_KEY);
  return !!token;
}

export const tokenManager = {
  setSession,
  clearSession,
  getValidAccessToken,
  hasSession,
};
