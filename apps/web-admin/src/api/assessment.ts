import request from './user'
import type { ApiResponse } from './user'

export const getTemplate = (id: number): Promise<ApiResponse<any>> => {
  return request({
    url: `/assessment/template/${id}`,
    method: 'get'
  }) as any
}

export const submitAssessment = (templateId: number, patientContactId: number, answers: any): Promise<ApiResponse<any>> => {
  return request({
    url: `/assessment/submit/${templateId}`,
    method: 'post',
    data: { patientContactId, answers }
  }) as any
}

export const getPublicTemplates = (): Promise<ApiResponse<any>> => {
  return request({
    url: '/assessment/templates',
    method: 'get'
  }) as any
}

export const getUserRecords = (params?: any): Promise<ApiResponse<any>> => {
  return request({
    url: '/assessment/records',
    method: 'get',
    params
  }) as any
}

export const getRecordDetail = (id: number): Promise<ApiResponse<any>> => {
  return request({
    url: `/assessment/record/${id}`,
    method: 'get'
  }) as any
}
