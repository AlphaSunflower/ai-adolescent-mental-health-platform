// src/api/psychologistAppointment.ts
// 心理咨询预约相关API
import request from '@/utils/request'

/**
 * 获取我的心理咨询预约列表
 */
export function getMyAppointments(params: {
  page?: number
  size?: number
  status?: number
}): Promise<any> {
  return request({
    url: '/api/psychologist/appointment/list',
    method: 'get',
    params
  })
}

/**
 * 获取预约详情
 */
export function getAppointmentDetail(appointmentId: number): Promise<any> {
  return request({
    url: '/api/psychologist/appointment/' + appointmentId + '/detail',
    method: 'get'
  })
}

/**
 * 获取聊天消息列表
 */
export function getMessages(appointmentId: number, page: number = 1, size: number = 50): Promise<any> {
  return request({
    url: '/psychologist/messages/' + appointmentId,
    method: 'get',
    params: { page, size }
  })
}

/**
 * 发送聊天消息
 */
export function sendMessage(data: {
  appointmentId: number
  content: string
  type?: string
}): Promise<any> {
  return request({
    url: '/psychologist/messages/send',
    method: 'post',
    data
  })
}
