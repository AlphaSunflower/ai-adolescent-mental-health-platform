// src/api/order.ts
// 订单相关API
import request from '@/utils/request'

// 订单类型
export type OrderType = 'psychologist' | 'book' | 'assessment' | 'course'

// 订单状态
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

// 订单接口
export interface Order {
  id: number
  orderNo: string
  type: OrderType
  title: string
  subtitle?: string
  imageUrl?: string
  price: number
  status: OrderStatus
  statusText: string
  createTime: string
  updateTime?: string
  // 心理咨询订单特有
  psychologistId?: number
  psychologistName?: string
  psychologistHead?: string
  serviceType?: string
  appointmentTime?: string
  timeSlot?: string
  // 书籍订单特有
  bookId?: number
  bookTitle?: string
  bookCover?: string
  // 测评订单特有
  assessmentId?: number
  assessmentTitle?: string
}

// 订单列表参数
export interface OrderListParams {
  page?: number
  size?: number
  type?: OrderType
  status?: OrderStatus
}

/**
 * 获取我的订单列表
 */
export function getMyOrders(params: OrderListParams): Promise<any> {
  return request({
    url: '/api/order/list',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 */
export function getOrderDetail(orderId: number): Promise<any> {
  return request({
    url: `/api/order/${orderId}`,
    method: 'get'
  })
}

/**
 * 获取心理咨询订单列表
 */
export function getPsychologistOrders(params?: { page?: number; size?: number; status?: OrderStatus }): Promise<any> {
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
    url: `/api/psychologist/appointment/${appointmentId}/detail`,
    method: 'get'
  })
}


/**
 * 获取书籍订单列表
 */
export function getBookOrders(params?: { page?: number; size?: number }): Promise<any> {
  return request({
    url: '/api/book/order/list',
    method: 'get',
    params
  })
}

/**
 * 获取测评订单列表
 */
export function getAssessmentOrders(params?: { page?: number; size?: number }): Promise<any> {
  return request({
    url: '/api/assessment/order/list',
    method: 'get',
    params
  })
}

/**
 * 取消订单
 */
export function cancelOrder(orderId: number, type: OrderType): Promise<any> {
  return request({
    url: `/api/order/${orderId}/cancel`,
    method: 'post',
    data: { type }
  })
}

/**
 * 获取订单统计数据
 */
export function getOrderStats(): Promise<any> {
  return request({
    url: '/api/order/stats',
    method: 'get'
  })
}
