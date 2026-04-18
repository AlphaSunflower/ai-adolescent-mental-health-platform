import request from './user'
import type { ApiResponse } from './user'

export interface Quote {
  id: number
  content: string
  author: string
}

export const getDailyQuote = (): Promise<ApiResponse<any>> => {
  return request({
    url: '/quote/daily',
    method: 'get'
  }) as any
}

export const getQuotes = (): Promise<ApiResponse<any>> => {
  return request({
    url: '/quote/list',
    method: 'get',
  }) as any
}

export const saveQuote = (data: Quote): Promise<ApiResponse<string>> => {
  return request({
    url: '/quote',
    method: 'post',
    data
  }) as any
}

export const deleteQuote = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/quote/${id}`,
    method: 'delete'
  }) as any
}
