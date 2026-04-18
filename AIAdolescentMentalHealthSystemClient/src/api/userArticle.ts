import request from './user'
import type { ApiResponse } from './user'

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface UserArticle {
  id?: number
  userId?: number
  title: string
  content: string
  coverUrl?: string
  tagId?: number
  status?: number
  rejectReason?: string
  likeCount?: number
  dislikeCount?: number
  collectionCount?: number
  commentCount?: number
  viewCount?: number
  createTime?: string
}

export interface UserArticleVO {
  id: number
  userId: number
  userNickname?: string
  userAvatar?: string
  title: string
  content?: string
  coverUrl?: string
  tagId?: number
  tagName?: string
  status: number
  rejectReason?: string
  likeCount: number
  dislikeCount?: number
  collectionCount: number
  commentCount: number
  viewCount: number
  createTime: string
  liked?: boolean
  disliked?: boolean
  collected?: boolean
  recommendedArticles?: UserArticleVO[]
  recommendedCourses?: any[]
  recommendedAssessments?: any[]
}

// 用户文章评论相关类型
export interface UserArticleComment {
  id?: number
  articleId: number
  userId?: number
  parentId?: number
  replyToUserId?: number
  content: string
  likeCount?: number
  createTime?: string
}

export interface UserArticleCommentVO {
  id: number
  articleId: number
  userId: number
  nickname: string
  headPath: string
  parentId: number
  replyToUserId?: number
  replyToNickname?: string
  content: string
  likeCount: number
  isLiked: boolean
  createTime: string
  replies?: UserArticleCommentVO[]
}

export const publishArticle = (data: UserArticle): Promise<ApiResponse<string>> => {
  return request({
    url: '/article/user',
    method: 'post',
    data
  }) as any
}

export const getMyArticles = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserArticleVO>>> => {
  return request({
    url: '/article/user/list',
    method: 'get',
    params
  }) as any
}

export const updateMyArticle = (data: UserArticle): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/${data.id}`,
    method: 'put',
    data
  }) as any
}

export const deleteMyArticle = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/${id}`,
    method: 'delete'
  }) as any
}

export const withdrawArticle = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/${id}/withdraw`,
    method: 'post'
  }) as any
}

export const getUserArticleDetail = (id: number): Promise<ApiResponse<UserArticleVO>> => {
  return request({
    url: `/article/user/detail/${id}`,
    method: 'get'
  }) as any
}

export const getUserArticleDetailByUser = (userId: number, articleId: number): Promise<ApiResponse<UserArticleVO>> => {
  return request({
    url: `/article/user/${userId}/${articleId}`,
    method: 'get'
  }) as any
}

export const getAllPublishedArticles = (params: { page: number; size: number; tagId?: number }): Promise<ApiResponse<PageResult<UserArticleVO>>> => {
  return request({
    url: '/article/user/list/published',
    method: 'get',
    params
  }) as any
}

export const uploadArticleCover = (file: File): Promise<ApiResponse<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/article/user/cover/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  }) as any
}

// 用户文章互动
export const interactUserArticle = (articleId: number, type: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/${articleId}/interact`,
    method: 'post',
    params: { type }
  }) as any
}

// 用户文章评论
export const addUserArticleComment = (data: { articleId: number; content: string; parentId?: number; replyToUserId?: number }): Promise<ApiResponse<string>> => {
  return request({
    url: '/article/user/comment',
    method: 'post',
    data
  }) as any
}

export const getUserArticleComments = (articleId: number): Promise<ApiResponse<UserArticleCommentVO[]>> => {
  return request({
    url: `/article/user/comments/${articleId}`,
    method: 'get'
  }) as any
}

export const likeUserArticleComment = (commentId: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/comment/like/${commentId}`,
    method: 'post'
  }) as any
}

// 审核相关
export const getPendingArticles = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserArticleVO>>> => {
  return request({
    url: '/article/audit/list',
    method: 'get',
    params
  }) as any
}

export const auditArticle = (id: number, data: { action: number; reason?: string }): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/audit/${id}`,
    method: 'post',
    data
  }) as any
}

export const offlineArticle = (id: number, reason: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/${id}/offline`,
    method: 'post',
    params: { reason }
  }) as any
}

// 管理员对用户文章上架/下架
export const offlineUserArticle = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/${id}/offline`,
    method: 'post',
    params: { reason: '管理员下架' }
  }) as any
}

export const onlineUserArticle = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/article/user/${id}/online`,
    method: 'post'
  }) as any
}
