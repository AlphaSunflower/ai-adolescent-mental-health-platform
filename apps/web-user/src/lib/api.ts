"use client";

import { getToken, saveSession } from "@/lib/session";
import type {
  AiMessage,
  AiSession,
  ApiResult,
  Appointment,
  AssessmentRecord,
  AssessmentTemplate,
  LibraryItem,
  PageResult,
  PatientContact,
  Psychologist,
  UserProfile,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>;
};

function withQuery(path: string, query?: RequestOptions["query"]) {
  if (!query) return path;
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("token", token);

  const response = await fetch(`${API_BASE_URL}${withQuery(path, options.query)}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = (await response.json()) as ApiResult<T>;
  if (payload.code !== 200) {
    throw new Error(payload.message || "请求失败");
  }
  return payload.data;
}

export const api = {
  async loginByEmailPassword(email: string, password: string) {
    const data = await apiRequest<Record<string, unknown>>("/user/login/email/password", {
      method: "POST",
      body: JSON.stringify({ email, password, remember: "true" }),
    });
    const token = String(data.token ?? "");
    const user = (data.userInfo ?? data.user ?? { id: 0, nickname: email }) as UserProfile;
    if (token) saveSession(token, user);
    return { token, user };
  },
  sendEmailCode(email: string, scene = "login") {
    return apiRequest<string>("/user/email/send", {
      method: "POST",
      body: JSON.stringify({ email, scene }),
    });
  },
  registerWithEmail(payload: Record<string, string>) {
    return apiRequest<string>("/user/register/email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getUserInfo: () => apiRequest<UserProfile>("/user/info"),
  updateUserInfo: (payload: Partial<UserProfile>) =>
    apiRequest<UserProfile>("/user/update", { method: "POST", body: JSON.stringify(payload) }),
  getPatients: () => apiRequest<PatientContact[]>("/patient/list"),
  addPatient: (payload: Omit<PatientContact, "id">) =>
    apiRequest<string>("/patient/add", { method: "POST", body: JSON.stringify(payload) }),
  getPsychologists: (query?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<PageResult<Psychologist>>("/psychologist/list", { query }),
  getPsychologistSchedule: (id: number, startDate: string, endDate: string) =>
    apiRequest<Record<string, unknown>[]>(`/psychologist/${id}/schedule`, { query: { startDate, endDate } }),
  createPsychologistAppointment: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/psychologist/appointment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  payPsychologistAppointment: (id: number) =>
    apiRequest<string>(`/psychologist/appointment/${id}/pay`, { method: "POST" }),
  cancelPsychologistAppointment: (id: number, cancelReason: string) =>
    apiRequest<string>(`/psychologist/appointment/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancelReason }),
    }),
  ratePsychologistAppointment: (id: number, rating: number, content: string) =>
    apiRequest<string>(`/psychologist/appointment/${id}/rate`, {
      method: "POST",
      query: { rating, content, isAnonymous: 0 },
    }),
  getMyPsychologistAppointments: (status?: number) =>
    apiRequest<PageResult<Appointment>>("/psychologist/appointment/my", { query: { page: 1, size: 20, status } }),
  getAssessmentTemplates: () => apiRequest<AssessmentTemplate[]>("/assessment/templates"),
  submitAssessment: (templateId: number, answers: Record<string, number>, patientContactId?: number) =>
    apiRequest<AssessmentRecord>(`/assessment/submit/${templateId}`, {
      method: "POST",
      body: JSON.stringify({ answers, patientContactId }),
    }),
  getAssessmentRecords: () =>
    apiRequest<PageResult<AssessmentRecord>>("/assessment/records", { query: { page: 1, size: 20 } }),
  getAiSessions: () => apiRequest<AiSession[]>("/ai/sessions"),
  createAiSession: () => apiRequest<AiSession>("/ai/session", { method: "POST" }),
  getAiMessages: (sessionId: number) => apiRequest<AiMessage[]>(`/ai/session/${sessionId}/messages`),
  getArticles: () => apiRequest<PageResult<LibraryItem>>("/content/articles", { query: { page: 1, size: 12 } }),
  getCourses: () => apiRequest<PageResult<LibraryItem>>("/content/courses", { query: { page: 1, size: 12 } }),
  getBooks: () => apiRequest<PageResult<LibraryItem>>("/book/list", { query: { page: 1, size: 12 } }),
  getCommunityArticles: () =>
    apiRequest<PageResult<LibraryItem>>("/article/user/list/published", { query: { page: 1, size: 12 } }),
};

export async function streamAiChat(
  sessionId: number,
  content: string,
  onChunk: (chunk: string) => void,
) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { token } : {}),
    },
    body: JSON.stringify({ sessionId, content }),
  });

  if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    text
      .split("\n")
      .map((line) => line.replace(/^data:\s*/, "").trim())
      .filter(Boolean)
      .forEach(onChunk);
  }
}
