import {
  createHttpClient,
  createApiClient,
} from "@ai-adolescent-mental-health/api-client";
import { getToken, clearSession } from "./session";

const httpClient = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  getToken,
  onUnauthorized: () => {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});

export const api = createApiClient(httpClient);

export { httpClient };
