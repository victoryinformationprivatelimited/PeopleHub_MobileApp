import config from "../config";
import { tokenManager } from "./tokenManager";

/** Uniform envelope every ESS API function returns — matches the web app's convention. */
export interface ApiResult<T> {
  success: boolean;
  data: T | null;
  message: string;
  status: number;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  skipAuth?: boolean;
  /** Set when body is FormData (multipart) — skips JSON.stringify and the JSON content-type header. */
  isFormData?: boolean;
}

/**
 * Thin fetch wrapper, ported from PeopleHub-ESS/src/api/client.ts (web, which
 * wraps axios). No axios dependency here to keep the mobile bundle lean —
 * fetch is sufficient for this app's needs. Always sends X-Tenant-ID — see
 * config.ts's doc comment for why that's not optional on mobile.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, skipAuth = false, isFormData = false } = options;

  const headers: Record<string, string> = { "X-Tenant-ID": config.tenantId };
  if (!isFormData) headers["Content-Type"] = "application/json";

  if (!skipAuth) {
    const { token } = await tokenManager.getValidAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    });

    if (response.status === 401 && !skipAuth) {
      await tokenManager.clearSession();
    }

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();

    if (response.status === 403) {
      return {
        success: false,
        data: null,
        message: payload?.message || "You don't have permission to view this.",
        status: 403,
      };
    }
    if (response.ok) {
      return {
        success: true,
        data: (payload?.data ?? payload) as T,
        message: payload?.message || "Success",
        status: response.status,
      };
    }
    return {
      success: false,
      data: null,
      message: payload?.message || (typeof payload === "string" ? payload : "Request failed."),
      status: response.status,
    };
  } catch (error: any) {
    return { success: false, data: null, message: error?.message || "Network error", status: 0 };
  }
}

export const apiClient = {
  get: <T>(path: string, skipAuth = false) => request<T>(path, { method: "GET", skipAuth }),
  post: <T>(path: string, body?: unknown, opts: Partial<RequestOptions> = {}) =>
    request<T>(path, { method: "POST", body, ...opts }),
};
