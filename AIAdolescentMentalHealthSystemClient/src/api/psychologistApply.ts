import request from './user'
import type { ApiResponse } from './user'

export interface ApplyStatusVO {
  hasApply: boolean
  isPsychologist: boolean
  applyId?: number
  status?: string
  statusName?: string
  step?: string
  stepName?: string
  rejectReason?: string
  paperResult?: number
  reportResult?: number
  interviewResult?: number
  examDeadline?: string
  interviewTime?: string
  interviewLocation?: string
  applyCount?: number
  remainingAttempts?: number
}

export interface ApplyEligibilityVO {
  eligible: boolean
  reason?: string
  remainingAttempts?: number
  remainingDays?: number
}

export interface BasicInfoRequest {
  realName: string
  phone: string
  country?: string
  contactWechat: string
  caseHours: string
  supervisionHours: string
  consultationPrice?: number
  resumeUrl?: string
  education: string
}

export interface ReportRequest {
  qualificationUrls: string[]
  supervisionProofUrls: string[]
  experienceProofUrls: string[]
  otherProofUrls: string[]
  selfNarration: string
}

export interface ApplyDetailVO {
  id: number
  userId: number
  applyCount: number
  status: string
  statusName: string
  step: string
  stepName: string
  realName?: string
  phone?: string
  country?: string
  contactWechat?: string
  caseHours?: string
  caseHoursName?: string
  supervisionHours?: string
  supervisionHoursName?: string
  consultationPrice?: number
  resumeUrl?: string
  education?: string
  qualificationUrls?: string
  supervisionProofUrls?: string
  experienceProofUrls?: string
  otherProofUrls?: string
  selfNarration?: string
  rejectReason?: string
  examDeadline?: string
  paperResult?: number
  paperResultName?: string
  reportResult?: number
  reportResultName?: string
  interviewResult?: number
  interviewResultName?: string
  interviewTime?: string
  interviewLocation?: string
  reviewerId?: number
  reviewTime?: string
  userNickname?: string
  userAvatar?: string
  userRole?: number
  createTime?: string
  updateTime?: string
}

// 检查申请资格
export const checkApplyEligibility = (): Promise<ApiResponse<ApplyEligibilityVO>> => {
  return request({
    url: '/psychologist-apply/check',
    method: 'get'
  }) as any
}

// 获取入驻状态
export const getApplyStatus = (): Promise<ApiResponse<ApplyStatusVO>> => {
  return request({
    url: '/psychologist-apply/status',
    method: 'get'
  }) as any
}

// 提交基本资料
export const submitBasicInfo = (data: BasicInfoRequest): Promise<ApiResponse<string>> => {
  return request({
    url: '/psychologist-apply/basic',
    method: 'post',
    data
  }) as any
}

// 提交案例报告
export const submitReport = (data: ReportRequest): Promise<ApiResponse<string>> => {
  return request({
    url: '/psychologist-apply/report',
    method: 'post',
    data
  }) as any
}

// 获取申请详情
export const getApplyDetail = (): Promise<ApiResponse<ApplyDetailVO>> => {
  return request({
    url: '/psychologist-apply/detail',
    method: 'get'
  }) as any
}

// 上传附件
export const uploadApplyFile = (file: File, type: string): Promise<ApiResponse<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  return request({
    url: '/psychologist-apply/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  }) as any
}

// ==================== 管理员端API ====================

// 获取所有入驻申请列表
export const getAdminApplyList = (status?: string): Promise<ApiResponse<ApplyDetailVO[]>> => {
  return request({
    url: '/admin/psychologist/list',
    method: 'get',
    params: { status }
  }) as any
}

// 获取已入驻心理咨询师列表
export const getApprovedPsychologists = (): Promise<ApiResponse<ApplyDetailVO[]>> => {
  return request({
    url: '/admin/psychologist/psychologists',
    method: 'get'
  }) as any
}

// 获取申请详情（管理员）
export const getAdminApplyDetail = (id: number): Promise<ApiResponse<ApplyDetailVO>> => {
  return request({
    url: `/admin/psychologist/apply/${id}`,
    method: 'get'
  }) as any
}

// 审核基本资料
export const reviewApply = (id: number, approved: boolean, reason?: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/admin/psychologist/apply/${id}/review`,
    method: 'post',
    data: { approved, reason }
  }) as any
}

// 标记笔试结果
export const markPaperResult = (id: number, passed: boolean, reason?: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/admin/psychologist/apply/${id}/paper`,
    method: 'post',
    data: { passed, reason }
  }) as any
}

// 标记案例报告结果
export const markReportResult = (id: number, passed: boolean, reason?: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/admin/psychologist/apply/${id}/report`,
    method: 'post',
    data: { passed, reason }
  }) as any
}

// 标记面谈结果
export const markInterviewResult = (
  id: number,
  approved: boolean,
  interviewTime?: string,
  interviewLocation?: string,
  reason?: string
): Promise<ApiResponse<string>> => {
  return request({
    url: `/admin/psychologist/apply/${id}/interview`,
    method: 'post',
    data: { approved, interviewTime, interviewLocation, reason }
  }) as any
}
