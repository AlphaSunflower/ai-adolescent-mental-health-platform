import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type {
  AiMessage,
  AiSession,
  ApiEnvelope,
  Appointment,
  AssessmentRecord,
  AssessmentTemplate,
  LibraryItem,
  PageResult,
  PatientContact,
  Psychologist,
  UserProfile,
} from "@ai-adolescent-mental-health/domain";

export type ApiClientErrorKind = "http" | "business" | "network" | "unauthorized" | "forbidden" | "parse";

export class ApiClientError extends Error {
  kind: ApiClientErrorKind;
  status?: number;
  code?: number;
  cause?: unknown;

  constructor(message: string, options: { kind: ApiClientErrorKind; status?: number; code?: number; cause?: unknown }) {
    super(message);
    this.name = "ApiClientError";
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.cause = options.cause;
  }
}

export type HttpClientOptions = {
  baseURL: string;
  getToken?: () => string | undefined | null;
  onUnauthorized?: () => void;
  timeout?: number;
};

export type RequestConfig = Omit<AxiosRequestConfig, "url" | "baseURL" | "method" | "params" | "data"> & {
  query?: Record<string, string | number | boolean | null | undefined>;
};

function toError(error: unknown, onUnauthorized?: () => void): ApiClientError {
  if (error instanceof ApiClientError) return error;
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
    const status = axiosError.response?.status;
    if (status === 401) onUnauthorized?.();
    if (status === 401) return new ApiClientError("登录已过期，请重新登录", { kind: "unauthorized", status, cause: error });
    if (status === 403) return new ApiClientError("权限不足，无法访问", { kind: "forbidden", status, cause: error });
    if (status) return new ApiClientError(axiosError.response?.data?.message || `HTTP ${status}`, { kind: "http", status, cause: error });
    return new ApiClientError("网络连接异常，请稍后重试", { kind: "network", cause: error });
  }
  return new ApiClientError("请求处理失败", { kind: "parse", cause: error });
}

function unwrap<T>(payload: ApiEnvelope<T>, onUnauthorized?: () => void) {
  if (!payload || typeof payload.code !== "number") {
    throw new ApiClientError("响应格式不正确", { kind: "parse" });
  }
  if (payload.code === 401) onUnauthorized?.();
  if (payload.code !== 200) {
    throw new ApiClientError(payload.message || "请求失败", {
      kind: payload.code === 401 ? "unauthorized" : payload.code === 403 ? "forbidden" : "business",
      code: payload.code,
    });
  }
  return payload.data;
}

export function createHttpClient(options: HttpClientOptions) {
  const client: AxiosInstance = axios.create({
    baseURL: options.baseURL.replace(/\/$/, ""),
    timeout: options.timeout ?? 10000,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  });

  client.interceptors.request.use((config) => {
    const token = options.getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token;
    }
    return config;
  });

  async function request<T>(method: AxiosRequestConfig["method"], url: string, data?: unknown, config: RequestConfig = {}) {
    try {
      const response = await client.request<ApiEnvelope<T>>({
        ...config,
        method,
        url,
        data,
        params: config.query,
      });
      return unwrap(response.data, options.onUnauthorized);
    } catch (error) {
      throw toError(error, options.onUnauthorized);
    }
  }

  return {
    raw: client,
    get: <T>(url: string, config?: RequestConfig) => request<T>("GET", url, undefined, config),
    post: <T>(url: string, data?: unknown, config?: RequestConfig) => request<T>("POST", url, data, config),
    put: <T>(url: string, data?: unknown, config?: RequestConfig) => request<T>("PUT", url, data, config),
    delete: <T>(url: string, config?: RequestConfig) => request<T>("DELETE", url, undefined, config),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;

export function createApiClient(http: HttpClient) {
  return {
    user: {
      async loginByEmailPassword(email: string, password: string) {
        const data = await http.post<Record<string, unknown>>("/user/login/email/password", {
          email,
          password,
          remember: "true",
        });
        const token = String(data.token ?? "");
        const user = (data.userInfo ?? data.user ?? { id: 0, nickname: email }) as UserProfile;
        return { token, user };
      },
      sendEmailCode: (email: string, scene = "login") => http.post<string>("/user/email/send", { email, scene }),
      registerWithEmail: (payload: Record<string, string>) => http.post<string>("/user/register/email", payload),
      getUserInfo: () => http.get<UserProfile>("/user/info"),
      updateUserInfo: (payload: Partial<UserProfile>) => http.post<UserProfile>("/user/update", payload),
    },
    patient: {
      list: () => http.get<PatientContact[]>("/patient/list"),
      add: (payload: Omit<PatientContact, "id">) => http.post<string>("/patient/add", payload),
    },
    psychologist: {
      list: (query?: Record<string, string | number | boolean | undefined>) =>
        http.get<PageResult<Psychologist>>("/psychologist/list", { query }),
      schedule: (id: number, startDate: string, endDate: string) =>
        http.get<Record<string, unknown>[]>(`/psychologist/${id}/schedule`, { query: { startDate, endDate } }),
    },
    appointment: {
      create: (payload: Record<string, unknown>) => http.post<Record<string, unknown>>("/psychologist/appointment", payload),
      pay: (id: number) => http.post<string>(`/psychologist/appointment/${id}/pay`),
      cancel: (id: number, cancelReason: string) =>
        http.post<string>(`/psychologist/appointment/${id}/cancel`, { cancelReason }),
      rate: (id: number, rating: number, content: string) =>
        http.post<string>(`/psychologist/appointment/${id}/rate`, undefined, { query: { rating, content, isAnonymous: 0 } }),
      my: (status?: number) =>
        http.get<PageResult<Appointment>>("/psychologist/appointment/my", { query: { page: 1, size: 20, status } }),
    },
    assessment: {
      templates: () => http.get<AssessmentTemplate[]>("/assessment/templates"),
      submit: (templateId: number, answers: Record<string, number>, patientContactId?: number) =>
        http.post<AssessmentRecord>(`/assessment/submit/${templateId}`, { answers, patientContactId }),
      records: () => http.get<PageResult<AssessmentRecord>>("/assessment/records", { query: { page: 1, size: 20 } }),
    },
    ai: {
      sessions: () => http.get<AiSession[]>("/ai/sessions"),
      createSession: () => http.post<AiSession>("/ai/session"),
      messages: (sessionId: number) => http.get<AiMessage[]>(`/ai/session/${sessionId}/messages`),
    },
    content: {
      articles: () => http.get<PageResult<LibraryItem>>("/content/articles", { query: { page: 1, size: 12 } }),
      courses: () => http.get<PageResult<LibraryItem>>("/content/courses", { query: { page: 1, size: 12 } }),
      books: () => http.get<PageResult<LibraryItem>>("/book/list", { query: { page: 1, size: 12 } }),
      communityArticles: () =>
        http.get<PageResult<LibraryItem>>("/article/user/list/published", { query: { page: 1, size: 12 } }),
    },
  };
}

export async function streamAiChat(
  options: HttpClientOptions,
  sessionId: number,
  content: string,
  onChunk: (chunk: string) => void,
) {
  const token = options.getToken?.();
  const response = await fetch(`${options.baseURL.replace(/\/$/, "")}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}`, token } : {}),
    },
    body: JSON.stringify({ sessionId, content }),
  });

  if (response.status === 401) options.onUnauthorized?.();
  if (!response.ok || !response.body) {
    throw new ApiClientError(`HTTP ${response.status}`, {
      kind: response.status === 401 ? "unauthorized" : response.status === 403 ? "forbidden" : "http",
      status: response.status,
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    decoder
      .decode(value, { stream: true })
      .split("\n")
      .map((line) => line.replace(/^data:\s*/, "").trim())
      .filter(Boolean)
      .forEach(onChunk);
  }
}
