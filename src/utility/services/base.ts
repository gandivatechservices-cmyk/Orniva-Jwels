import { API_ENDPOINTS } from "constants/apiEndpoints";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6100/api";

export type ApiResponse<T> = { data: T; message: string };

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status = 500, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Get the current access token, trying localStorage first */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("accessToken");
}

/** Attempt a silent token refresh using the stored refresh token */
async function tryRefreshToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refreshToken = window.localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    const newAccessToken: string = payload?.data?.accessToken ?? payload?.accessToken;
    if (!newAccessToken) return null;
    window.localStorage.setItem("accessToken", newAccessToken);
    const newRefresh: string | undefined = payload?.data?.refreshToken ?? payload?.refreshToken;
    if (newRefresh) window.localStorage.setItem("refreshToken", newRefresh);
    return newAccessToken;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  // On 401, attempt token refresh once then retry the original request
  if (response.status === 401 && retry) {
    const freshToken = await tryRefreshToken();
    if (freshToken) {
      return request<T>(path, options, false);
    }
    // Refresh failed — clear tokens and propagate 401
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("user");
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("user");
      if (!path.startsWith("/auth/")) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : "Something went wrong. Please try again.";
    throw new ApiError(message, response.status, payload);
  }
  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, options),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};