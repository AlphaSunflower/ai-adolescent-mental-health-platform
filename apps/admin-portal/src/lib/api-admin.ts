import {
  createHttpClient,
  createApiClient,
} from "@ai-adolescent-mental-health/api-client";
import { getToken, clearSession } from "./session";

const httpClient = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  getToken,
  onUnauthorized: () => {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});

export const api = createApiClient(httpClient);

// Admin-specific API methods (extends shared api with admin-only endpoints)
export const adminApi = {
  // Admin login
  async login(username: string, password: string, remember = false) {
    const data = await httpClient.post<Record<string, unknown>>(
      "/admin/login",
      { username, password, remember: String(remember) }
    );
    const token = data.token as string;
    const user = data.userInfo as Record<string, unknown>;
    return { token, user };
  },
};

export { httpClient };
