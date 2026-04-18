import request from './user'
import type { ApiResponse } from './user'

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface SysMessage {
  id: number
  userId: number
  title: string
  content: string
  type: number
  sourceType: number    // 来源类型(0-系统,1-关注,2-文章点赞,3-评论点赞,4-评论回复)
  sourceId: number      // 来源ID
  extraType?: number    // 扩展类型(0-官方文章,1-用户文章)
  articleAuthorId?: number  // 文章作者ID(用于用户文章跳转)
  fromUserId: number    // 触发通知的用户ID
  fromUserNickname?: string
  fromUserAvatar?: string
  isRead: number
  createTime: string
}

export const getMessages = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<SysMessage>>> => {
  return request({
    url: '/user/messages',
    method: 'get',
    params
  }) as any
}

export const markMessageRead = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/user/messages/${id}/read`,
    method: 'put'
  }) as any
}

export const markAllMessagesRead = (): Promise<ApiResponse<string>> => {
  return request({
    url: '/user/messages/read-all',
    method: 'put'
  }) as any
}

export const getUnreadCount = (): Promise<ApiResponse<number>> => {
  return request({
    url: '/user/messages/unread-count',
    method: 'get'
  }) as any
}
