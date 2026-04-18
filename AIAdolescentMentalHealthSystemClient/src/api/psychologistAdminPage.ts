// src/api/psychologistAdminPage.ts
// 心理咨询师管理端页面API
import request from '@/utils/request'

/**
 * 获取我的心理咨询师信息
 */
export function getMyPsychologistProfile(): Promise<any> {
  return request({
    url: '/api/psychologist/admin/me',
    method: 'get'
  })
}

/**
 * 获取工作台统计数据
 */
export function getDashboardStats(): Promise<any> {
  return request({
    url: '/api/psychologist/admin/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取我的预约列表（心理咨询师端）
 */
export function getMyAppointments(params: {
  page?: number
  size?: number
  status?: number
}): Promise<any> {
  return request({
    url: '/api/psychologist/admin/appointments',
    method: 'get',
    params
  })
}

/**
 * 接受/拒绝预约
 */
export function handleAppointment(appointmentId: number, accepted: boolean, videoLink?: string, rejectReason?: string): Promise<any> {
  return request({
    url: `/api/psychologist/admin/appointments/${appointmentId}/handle`,
    method: 'post',
    params: { accepted },
    data: { videoLink, rejectReason }
  })
}

/**
 * 发送视频会议链接或线下地址
 */
export function sendVideoLink(data: {
  appointmentId: number
  videoLink?: string
  offlineAddress?: string
  startTime?: string
  endTime?: string
}): Promise<any> {
  return request({
    url: `/api/psychologist/admin/appointments/${data.appointmentId}/video-link`,
    method: 'post',
    params: {
      videoLink: data.videoLink,
      offlineAddress: data.offlineAddress,
      startTime: data.startTime,
      endTime: data.endTime
    }
  })
}

/**
 * 开始咨询
 */
export function startConsultation(data: { appointmentId: number; startTime?: string }): Promise<any> {
  return request({
    url: `/api/psychologist/admin/appointments/${data.appointmentId}/start`,
    method: 'post',
    params: { startTime: data.startTime }
  })
}

/**
 * 完成咨询
 */
export function completeConsultationApi(appointmentId: number): Promise<any> {
  return request({
    url: `/api/psychologist/admin/appointments/${appointmentId}/complete`,
    method: 'post'
  })
}

/**
 * 获取我的排班
 */
export function getMySchedules(startDate: string, endDate: string): Promise<any> {
  return request({
    url: '/api/psychologist/admin/schedules',
    method: 'get',
    params: { startDate, endDate }
  })
}

/**
 * 保存排班
 */
export function saveSchedule(data: {
  scheduleDate: string
  timeSlot: string
  maxAppointments: number
  status: number
}): Promise<any> {
  return request({
    url: '/api/psychologist/admin/schedule',
    method: 'post',
    data
  })
}

/**
 * 批量保存排班
 */
export function saveSchedules(schedules: Array<{
  scheduleDate: string
  timeSlot: string
  maxAppointments: number
  status: number
}>): Promise<any> {
  return request({
    url: '/api/psychologist/admin/schedules/batch',
    method: 'post',
    data: schedules
  })
}

/**
 * 获取排班时段详情（包含已预约人数、最大预约人数、预约列表）
 */
export function getScheduleSlotDetail(scheduleDate: string, timeSlot: string): Promise<any> {
  return request({
    url: '/api/psychologist/admin/schedule/slot-detail',
    method: 'get',
    params: { scheduleDate, timeSlot }
  })
}

/**
 * 更新排班状态（仅允许 休息<->可预约 的切换）
 */
export function updateScheduleStatus(scheduleId: number, status: number): Promise<any> {
  return request({
    url: '/api/psychologist/admin/schedule/status',
    method: 'post',
    params: { scheduleId, status }
  })
}

/**
 * 更新排班信息（最大预约人数等）
 */
export function updateSchedule(scheduleId: number, maxAppointments?: number): Promise<any> {
  return request({
    url: '/api/psychologist/admin/schedule',
    method: 'put',
    params: { scheduleId, maxAppointments }
  })
}

/**
 * 删除排班
 */
export function deleteSchedule(scheduleId: number): Promise<any> {
  return request({
    url: `/api/psychologist/admin/schedule/${scheduleId}`,
    method: 'delete'
  })
}

/**
 * 删除指定日期之前的历史排班（仅删除无预约的记录）
 */
export function deleteOldSchedules(beforeDate: string): Promise<any> {
  return request({
    url: '/api/psychologist/admin/schedules/old',
    method: 'delete',
    params: { beforeDate }
  })
}

/**
 * 更新个人资料
 */
export function updateMyProfile(data: any): Promise<any> {
  return request({
    url: '/api/psychologist/admin/profile',
    method: 'put',
    data
  })
}

/**
 * 获取我的收入统计
 */
export function getMyIncomeStats(): Promise<any> {
  return request({
    url: '/api/psychologist/income/stats',
    method: 'get'
  })
}

/**
 * 获取我的收入列表
 */
export function getMyIncomeList(params: {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
}): Promise<any> {
  return request({
    url: '/api/psychologist/income/details',
    method: 'get',
    params
  })
}

/**
 * 获取我的余额
 */
export function getMyBalance(): Promise<any> {
  return request({
    url: '/api/psychologist/income/balance',
    method: 'get'
  })
}

/**
 * 获取我的提现记录
 */
export function getMyWithdrawList(params: {
  page?: number
  size?: number
}): Promise<any> {
  return request({
    url: '/api/psychologist/income/withdraw/list',
    method: 'get',
    params
  })
}

/**
 * 申请提现
 */
export function applyWithdraw(amount: number): Promise<any> {
  return request({
    url: '/api/psychologist/income/withdraw',
    method: 'post',
    params: { amount }
  })
}

/**
 * 获取收入趋势
 */
export function getIncomeTrend(params: {
  days?: number
}): Promise<any> {
  return request({
    url: '/api/psychologist/income/trend',
    method: 'get',
    params
  })
}

/**
 * 获取聊天消息
 */
export function getMessages(appointmentId: number): Promise<any> {
  return request({
    url: `/api/psychologist/admin/messages/${appointmentId}`,
    method: 'get'
  })
}

/**
 * 发送消息
 */
export function sendMessage(data: {
  appointmentId: number
  content: string
  type: string
}): Promise<any> {
  return request({
    url: '/api/psychologist/admin/messages/send',
    method: 'post',
    data
  })
}

/**
 * 获取预约详情（包含评价信息和收入计算）
 */
export function getAppointmentDetail(appointmentId: number): Promise<any> {
  return request({
    url: `/api/psychologist/admin/appointments/${appointmentId}/detail`,
    method: 'get'
  })
}
