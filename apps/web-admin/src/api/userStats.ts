import request from './user'
import type { ApiResponse } from './user'

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface UserStatsVO {
  followCount: number
  fanCount: number
  articleCount: number
  likeCount: number
}

export interface UserPrivacyVO {
  allowViewLikes: boolean
  allowViewArticles: boolean
  allowViewCollections: boolean
  allowViewFollowings: boolean
  allowViewFans: boolean
}

export interface UserPrivacySetting {
  userId?: number
  allowViewLikes: number
  allowViewArticles: number
  allowViewCollections: number
  allowViewFollowings: number
  allowViewFans: number
}

export const getMyStats = (): Promise<ApiResponse<UserStatsVO>> => {
  return request({
    url: '/user/stats',
    method: 'get'
  }) as any
}

export const getUserStats = (userId: number): Promise<ApiResponse<UserStatsVO>> => {
  return request({
    url: `/user/stats/${userId}`,
    method: 'get'
  }) as any
}

export const getPrivacySetting = (): Promise<ApiResponse<UserPrivacyVO>> => {
  return request({
    url: '/user/privacy',
    method: 'get'
  }) as any
}

export const updatePrivacySetting = (data: Partial<UserPrivacySetting>): Promise<ApiResponse<string>> => {
  return request({
    url: '/user/privacy',
    method: 'put',
    data
  }) as any
}
