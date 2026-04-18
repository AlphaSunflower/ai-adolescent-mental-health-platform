// src/api/admin/platformIncome.ts
// 超级管理员 - 平台收入管理API
import request from '@/utils/request'

/**
 * 获取平台收入统计（分模块）
 */
export function getPlatformIncomeStats(params?: {
  startDate?: string
  endDate?: string
}): Promise<any> {
  return request({
    url: '/api/admin/platform-income/stats',
    method: 'get',
    params
  })
}

/**
 * 获取收入趋势数据（按日）
 */
export function getPlatformIncomeTrend(params: {
  startDate: string
  endDate: string
  module?: string
}): Promise<any> {
  return request({
    url: '/api/admin/platform-income/trend',
    method: 'get',
    params
  })
}

/**
 * 获取心理咨询收入明细列表
 */
export function getConsultationIncomeList(params: {
  page?: number
  size?: number
  psychologistId?: number
  minRating?: number
  maxRating?: number
  startDate?: string
  endDate?: string
}): Promise<any> {
  return request({
    url: '/api/admin/platform-income/consultation/list',
    method: 'get',
    params
  })
}
