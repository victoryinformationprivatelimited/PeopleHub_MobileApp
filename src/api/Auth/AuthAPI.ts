import { apiClient } from "../client";
import { tokenManager } from "../tokenManager";

export interface LoginResult {
  status: "success" | "mfaRequired" | "locked" | "error";
  userId?: number;
  message?: string;
}

export async function login(usernameOrEmail: string, password: string): Promise<LoginResult> {
  const result = await apiClient.post<any>(
    "/api/User/login",
    { UsernameOrEmail: usernameOrEmail, Password: password, Rememberme: true },
    { skipAuth: true },
  );

  if (result.status === 401) {
    return { status: "locked", message: result.message || "This account is locked." };
  }
  if (result.success && result.data?.acctoken) {
    await tokenManager.setSession(result.data.acctoken, result.data.refToken);
    return { status: "success" };
  }
  if (result.success && result.data?.userId) {
    return { status: "mfaRequired", userId: result.data.userId };
  }
  return { status: "error", message: result.message || "Incorrect username or password." };
}

export async function validateMfa(userId: number, code: string): Promise<{ success: boolean; message?: string }> {
  const result = await apiClient.post<any>("/api/User/validate-mfa", { userId, code }, { skipAuth: true });
  if (result.success && result.data?.acctoken) {
    await tokenManager.setSession(result.data.acctoken, result.data.refToken);
    return { success: true };
  }
  return { success: false, message: result.message || "Invalid code." };
}

export async function logout() {
  await tokenManager.clearSession();
}
