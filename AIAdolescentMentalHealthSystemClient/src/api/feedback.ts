import request from './user'
import type { ApiResponse } from './user'

// Platform Feedback
export const submitPlatformFeedback = (data: any): Promise<ApiResponse<string>> => {
  return request({
    url: '/feedback/platform',
    method: 'post',
    data
  }) as any
}

export const getMyPlatformFeedback = (params: any): Promise<ApiResponse<any>> => {
  return request({
    url: '/feedback/platform/my',
    method: 'get',
    params
  }) as any
}

export const getPlatformFeedbacks = (params: any): Promise<ApiResponse<any>> => {
  return request({
    url: '/feedback/platform/list',
    method: 'get',
    params
  }) as any
}

export const updatePlatformFeedbackStatus = (id: number, data: any): Promise<ApiResponse<string>> => {
  return request({
    url: `/feedback/platform/${id}/status`,
    method: 'put',
    data
  }) as any
}

// Consultation Feedback
export const submitConsultationFeedback = (data: any): Promise<ApiResponse<string>> => {
  return request({
    url: '/feedback/consultation',
    method: 'post',
    data
  }) as any
}

export const getMyConsultationFeedback = (params: any): Promise<ApiResponse<any>> => {
  return request({
    url: '/feedback/consultation/my',
    method: 'get',
    params
  }) as any
}

export const getConsultationFeedbacks = (params: any): Promise<ApiResponse<any>> => {
  return request({
    url: '/feedback/consultation/list',
    method: 'get',
    params
  }) as any
}

export const processConsultationFeedback = (id: number, data: any): Promise<ApiResponse<string>> => {
  return request({
    url: `/feedback/consultation/${id}/process`,
    method: 'put',
    data
  }) as any
}
