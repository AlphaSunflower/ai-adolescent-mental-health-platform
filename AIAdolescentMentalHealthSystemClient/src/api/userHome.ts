import request from './user'
import type { ApiResponse } from './user'
import type { UserInfoVO } from './follow'
import type { UserArticleVO } from './userArticle'
import type { UserStatsVO, UserPrivacyVO } from './userStats'

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface UserHomeVO {
  userId: number
  nickname: string
  headPath?: string
  signature?: string
  stats: UserStatsVO
  privacy: UserPrivacyVO
  isFollowing: boolean
  isFollowed: boolean
}

export interface ArticleInteractionVO {
  articleId: number
  articleTitle?: string
  authorNickname?: string
  authorId?: number
  coverUrl?: string
  createTime: string
  source?: string
  authorRole?: number
}

export const getUserHome = (userId: number): Promise<ApiResponse<UserHomeVO>> => {
  return request({
    url: `/user/home/${userId}`,
    method: 'get'
  }) as any
}

export const getUserArticles = (userId: number, params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserArticleVO>>> => {
  return request({
    url: `/user/home/${userId}/articles`,
    method: 'get',
    params
  }) as any
}

export const getUserLikes = (userId: number, params: { page: number; size: number }): Promise<ApiResponse<PageResult<ArticleInteractionVO>>> => {
  return request({
    url: `/user/home/${userId}/likes`,
    method: 'get',
    params
  }) as any
}

export const getUserFollowings = (userId: number, params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserInfoVO>>> => {
  return request({
    url: `/user/home/${userId}/followings`,
    method: 'get',
    params
  }) as any
}

export const getUserFollowers = (userId: number, params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserInfoVO>>> => {
  return request({
    url: `/user/home/${userId}/followers`,
    method: 'get',
    params
  }) as any
}

// 用户内容相关
export const getMyPublishedArticles = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserArticleVO>>> => {
  return request({
    url: '/user/content/articles',
    method: 'get',
    params
  }) as any
}

export const getMyLikes = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<ArticleInteractionVO>>> => {
  return request({
    url: '/user/content/likes',
    method: 'get',
    params
  }) as any
}

export const getMyCollections = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<ArticleInteractionVO>>> => {
  return request({
    url: '/user/content/collections',
    method: 'get',
    params
  }) as any
}

export const getFollowArticles = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserArticleVO>>> => {
  return request({
    url: '/user/content/follow-articles',
    method: 'get',
    params
  }) as any
}

export type { UserInfoVO }
