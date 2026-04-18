// src/api/psychologistIncome.ts
// 心理咨询师收入相关API
import request from '@/utils/request'

/**
 * 获取我的收入统计
 */
export function getMyIncomeStats(): Promise<any> {
  return request({
    url: '/psychologist/income/stats',
    method: 'get'
  })
}

/**
 * 获取我的收入记录列表
 */
export function getMyIncomeList(params: {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
}): Promise<any> {
  return request({
    url: '/psychologist/income/details',
    method: 'get',
    params
  })
}

/**
 * 获取我的余额信息
 */
export function getMyBalance(): Promise<any> {
  return request({
    url: '/psychologist/income/balance',
    method: 'get'
  })
}

/**
 * 获取我的提现记录列表
 */
export function getMyWithdrawList(params: {
  page?: number
  size?: number
}): Promise<any> {
  return request({
    url: '/psychologist/income/withdraw/list',
    method: 'get',
    params
  })
}

/**
 * 申请提现
 */
export function applyWithdraw(amount: number): Promise<any> {
  return request({
    url: '/psychologist/income/withdraw',
    method: 'post',
    data: { amount }
  })
}
