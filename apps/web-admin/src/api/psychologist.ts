// src/api/psychologist.ts
// 心理咨询师相关API
import request from '@/utils/request'

// ===== 心理咨询师类型定义 =====

/** 心理咨询师 */
export interface Psychologist {
  id: number
  userId: number
  realName: string
  sex: number | null
  headPath: string | null
  introduction: string | null
  educationBackground: string | null
  trainingExperience: string | null
  certifications: string | null
  yearsExperience: number
  ratingScore: number
  ratingCount: number
  consultationCount: number
  offlineRegion: string | null
  offlineAddress: string | null
  languages: string | null
  status: number
  onlineStatus: number
  auditStatus: number
  createTime: string
  updateTime: string
}

/** 咨询领域 */
export interface ConsultationField {
  id: number
  name: string
  description: string | null
  icon: string | null
  status: number
  sortOrder: number
}

/** 资质类型 */
export interface PsychologistQualification {
  id: number
  name: string
  description: string | null
  icon: string | null
  status: number
  sortOrder: number
}

/** 服务类型 */
export interface PsychologistService {
  id: number
  psychologistId: number
  serviceType: string
  price: number
  description: string | null
  status: number
}

/** 排班信息 */
export interface PsychologistSchedule {
  id: number
  psychologistId: number
  scheduleDate: string
  timeSlot: string
  maxAppointments: number
  bookedCount: number
  status: number
}

/** 预约信息 */
export interface PsychologistAppointment {
  id: number
  psychologistId: number
  psychologistName: string
  userId: number
  userName: string
  scheduleId: number
  serviceType: string
  price: number
  appointmentTime: string
  timeSlot: string
  status: number
  videoLink: string | null
  offlineAddress: string | null
  userBasicInfo: string | null
  userProblems: string | null
  rating: number | null
  ratingComment: string | null
  createTime: string
  updateTime: string
}

/** 收藏关系 */
export interface UserFavoritePsychologist {
  id: number
  userId: number
  psychologistId: number
  createTime: string
}

/** 咨询历史 */
export interface UserPsychologistHistory {
  id: number
  userId: number
  psychologistId: number
  appointmentId: number
  createTime: string
}

/** 收入记录 */
export interface PsychologistIncome {
  id: number
  psychologistId: number
  appointmentId: number
  amount: number
  platformFee: number
  psychologistIncome: number
  commissionRate: number
  createTime: string
}

/** 提现记录 */
export interface PsychologistWithdraw {
  id: number
  psychologistId: number
  amount: number
  status: number
  remark: string | null
  createTime: string
  updateTime: string
}

/** 余额信息 */
export interface PsychologistBalance {
  id: number
  psychologistId: number
  totalIncome: number
  frozenAmount: number
  availableAmount: number
  updateTime: string
}

// ===== API请求参数类型 =====

/** 心理咨询师列表参数 */
export interface PsychologistListParams {
  page?: number
  size?: number
  keyword?: string
  fieldIds?: number[]
  serviceTypes?: string[]
  sex?: number | null
  minPrice?: number | null
  maxPrice?: number | null
  qualificationIds?: number[]
  minRating?: number | null
  languages?: string | null
  sortBy?: string | null
  sortOrder?: string | null
}

/** 心理咨询师详情 */
export interface PsychologistDetail extends Psychologist {
  fields: ConsultationField[]
  qualifications: PsychologistQualification[]
  services: PsychologistService[]
  schedules: PsychologistSchedule[]
  isFavorite: boolean
  isBooked: boolean
}

/** 创建预约参数 */
export interface CreateAppointmentParams {
  psychologistId: number
  scheduleId: number
  serviceType: string
  personalSituation?: string
  problems?: string
  medicalHistory?: string
  healthStatus?: string
}

/** 评分参数 */
export interface RatingParams {
  appointmentId: number
  rating: number
  comment?: string
  isAnonymous?: number
}

// ===== API响应类型 =====

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  total: number
  records: T[]
  current: number
  size: number
  pages: number
}

// ===== 心理咨询师API =====

/**
 * 获取心理咨询师列表
 */
export function getPsychologistList(params: PsychologistListParams): Promise<ApiResponse<PageResult<Psychologist>>> {
  return request({
    url: '/api/psychologist/list',
    method: 'get',
    params
  })
}

/**
 * 获取心理咨询师详情
 */
export function getPsychologistDetail(id: number): Promise<ApiResponse<PsychologistDetail>> {
  return request({
    url: `/api/psychologist/${id}`,
    method: 'get'
  })
}

/**
 * 获取收藏的心理咨询师列表
 */
export function getFavoritePsychologists(): Promise<ApiResponse<Psychologist[]>> {
  return request({
    url: '/api/psychologist/favorites',
    method: 'get'
  })
}

/**
 * 收藏/取消收藏心理咨询师
 */
export function toggleFavorite(psychologistId: number): Promise<ApiResponse<boolean>> {
  return request({
    url: `/api/psychologist/favorite/${psychologistId}`,
    method: 'post'
  })
}

/**
 * 获取心理咨询师排班
 */
export function getPsychologistSchedule(psychologistId: number, startDate: string, endDate: string): Promise<ApiResponse<PsychologistSchedule[]>> {
  return request({
    url: `/api/psychologist/${psychologistId}/schedule`,
    method: 'get',
    params: { startDate, endDate }
  })
}

/**
 * 获取心理咨询师服务价格
 */
export function getPsychologistServices(psychologistId: number): Promise<ApiResponse<PsychologistService[]>> {
  return request({
    url: `/api/psychologist/${psychologistId}/services`,
    method: 'get'
  })
}

/**
 * 获取咨询历史
 */
export function getConsultationHistory(): Promise<ApiResponse<PsychologistAppointment[]>> {
  return request({
    url: '/api/psychologist/history',
    method: 'get'
  })
}

/**
 * 获取我的所有预约（分页）
 */
export function getAllMyAppointments(params: {
  page?: number
  size?: number
  status?: number
}): Promise<ApiResponse<PageResult<PsychologistAppointment>>> {
  return request({
    url: '/api/psychologist/appointment/list',
    method: 'get',
    params
  })
}

/**
 * 获取当前预约状态
 */
export function getCurrentAppointments(): Promise<ApiResponse<PsychologistAppointment[]>> {
  return request({
    url: '/api/psychologist/appointments/current',
    method: 'get'
  })
}

/**
 * 创建预约
 */
export function createAppointment(params: CreateAppointmentParams): Promise<ApiResponse<{ appointmentId: number }>> {
  return request({
    url: '/api/psychologist/appointment',
    method: 'post',
    data: params
  })
}

/**
 * 取消预约
 */
export function cancelAppointment(params: { appointmentId: number; cancelReason?: string }): Promise<ApiResponse<void>> {
  return request({
    url: `/api/psychologist/appointment/${params.appointmentId}/cancel`,
    method: 'post',
    params: { appointmentId: params.appointmentId },
    data: { cancelReason: params.cancelReason }
  })
}

/**
 * 评价预约
 */
export function rateAppointment(params: RatingParams): Promise<ApiResponse<void>> {
  return request({
    url: `/api/psychologist/appointment/${params.appointmentId}/rate`,
    method: 'post',
    params: { rating: params.rating, content: params.comment, isAnonymous: params.isAnonymous }
  })
}

/**
 * 获取可用的咨询领域列表
 */
export function getConsultationFields(): Promise<ApiResponse<ConsultationField[]>> {
  return request({
    url: '/api/dict/consultation-fields',
    method: 'get'
  })
}

/**
 * 获取可用的资质类型列表
 */
export function getQualifications(): Promise<ApiResponse<PsychologistQualification[]>> {
  return request({
    url: '/dict/qualifications',
    method: 'get'
  })
}

// ===== 心理咨询消息API =====

/**
 * 发送文本消息
 */
export function sendMessage(params: {
  appointmentId: number
  receiverId: number
  content: string
  contentType?: number
}): Promise<ApiResponse<any>> {
  return request({
    url: '/api/psychologist/message/send',
    method: 'post',
    data: {
      appointmentId: params.appointmentId,
      receiverId: params.receiverId,
      content: params.content,
      contentType: params.contentType || 0
    }
  })
}

/**
 * 发送图片消息
 */
export function sendImageMessage(params: {
  appointmentId: number
  receiverId: number
  imageUrl: string
}): Promise<ApiResponse<any>> {
  return request({
    url: '/psychologist/message/send/image',
    method: 'post',
    data: params
  })
}

/**
 * 获取消息历史
 */
export function getMessageHistory(appointmentId: number): Promise<ApiResponse<any[]>> {
  return request({
    url: `/api/psychologist/message/history/${appointmentId}`,
    method: 'get'
  })
}

/**
 * 获取新消息（轮询）
 */
export function getNewMessages(appointmentId: number, lastTime: string): Promise<ApiResponse<any[]>> {
  return request({
    url: `/psychologist/message/new/${appointmentId}`,
    method: 'get',
    params: { lastTime }
  })
}

/**
 * 获取对话列表（咨询师端）
 */
export function getConversations(): Promise<ApiResponse<any[]>> {
  return request({
    url: '/api/psychologist/message/conversations',
    method: 'get'
  })
}

/**
 * 支付预约
 */
export function payAppointment(appointmentId: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/psychologist/appointment/${appointmentId}/pay`,
    method: 'post'
  })
}

/**
 * 更新在线状态（手动切换）
 * @param status 在线状态（0-离线，1-在线，2-忙碌）
 */
export function updateOnlineStatus(status: number): Promise<ApiResponse<string>> {
  return request({
    url: '/api/psychologist/status',
    method: 'post',
    params: { status }
  })
}

// ===== 在线状态常量 =====
export const OnlineStatus = {
  OFFLINE: 0,
  ONLINE: 1,
  BUSY: 2
} as const

export type OnlineStatusType = typeof OnlineStatus[keyof typeof OnlineStatus]

export const OnlineStatusText = {
  [OnlineStatus.OFFLINE]: '离线',
  [OnlineStatus.ONLINE]: '在线',
  [OnlineStatus.BUSY]: '忙碌'
} as const
