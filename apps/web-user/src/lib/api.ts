"use client";

import {
  createApiClient,
  createHttpClient,
  streamAiChat as streamAiChatRequest,
} from "@ai-adolescent-mental-health/api-client";

import { clearSession, getToken, saveSession } from "@/lib/session";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

const clientOptions = {
  baseURL: API_BASE_URL,
  getToken,
  onUnauthorized: clearSession,
};

const http = createHttpClient(clientOptions);
const apiClient = createApiClient(http);

export const api = {
  async loginByUsernamePassword(username: string, password: string, remember?: boolean) {
    const result = await apiClient.user.loginByUsernamePassword(username, password, remember);
    if (result.token) saveSession(result.token, result.user);
    return result;
  },
  async loginByEmailCode(email: string, code: string) {
    const result = await apiClient.user.loginByEmailCode(email, code);
    if (result.token) saveSession(result.token, result.user);
    return result;
  },
  async loginByEmailPassword(email: string, password: string, remember?: boolean) {
    const result = await apiClient.user.loginByEmailPassword(email, password, remember);
    if (result.token) saveSession(result.token, result.user);
    return result;
  },
  sendEmailCode: apiClient.user.sendEmailCode,
  registerWithEmail: apiClient.user.registerWithEmail,
  getUserInfo: apiClient.user.getUserInfo,
  updateUserInfo: apiClient.user.updateUserInfo,
  getPatients: apiClient.patient.list,
  addPatient: apiClient.patient.add,
  getPsychologists: apiClient.psychologist.list,
  getPsychologistSchedule: apiClient.psychologist.schedule,
  createPsychologistAppointment: apiClient.appointment.create,
  payPsychologistAppointment: apiClient.appointment.pay,
  cancelPsychologistAppointment: apiClient.appointment.cancel,
  ratePsychologistAppointment: apiClient.appointment.rate,
  getMyPsychologistAppointments: apiClient.appointment.my,
  getAssessmentTemplates: apiClient.assessment.templates,
  submitAssessment: apiClient.assessment.submit,
  getAssessmentRecords: apiClient.assessment.records,
  getAiSessions: apiClient.ai.sessions,
  createAiSession: apiClient.ai.createSession,
  getAiMessages: apiClient.ai.messages,
  getArticles: apiClient.content.articles,
  getCourses: apiClient.content.courses,
  getBooks: apiClient.content.books,
  getCommunityArticles: apiClient.content.communityArticles,
};

export function streamAiChat(
  sessionId: number,
  content: string,
  onChunk: (chunk: string) => void,
) {
  return streamAiChatRequest(clientOptions, sessionId, content, onChunk);
}
