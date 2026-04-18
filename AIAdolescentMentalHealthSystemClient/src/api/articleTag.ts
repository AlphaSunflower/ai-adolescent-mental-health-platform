import request from './user'
import type { ApiResponse } from './user'

export interface ArticleTag {
  id: number
  name: string
  code: string
  sortOrder: number
  status: number
}

export const getArticleTags = (): Promise<ApiResponse<ArticleTag[]>> => {
  return request({
    url: '/article/tag/list',
    method: 'get'
  }) as any
}

export const addArticleTag = (data: { name: string; code: string; sortOrder?: number }): Promise<ApiResponse<string>> => {
  return request({
    url: '/article/tag',
    method: 'post',
    data
  }) as any
}

export const updateArticleTag = (data: { id: number; name: string; code: string; sortOrder?: number }): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/tag/${data.id}`,
    method: 'put',
    data
  }) as any
}

export const deleteArticleTag = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/tag/${id}`,
    method: 'delete'
  }) as any
}
