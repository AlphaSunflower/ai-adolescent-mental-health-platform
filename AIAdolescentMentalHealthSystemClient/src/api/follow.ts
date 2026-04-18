import request from './user'
import type { ApiResponse } from './user'

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface UserInfoVO {
  userId: number
  nickname: string
  headPath?: string
  signature?: string
  articleCount?: number
  isFollowing?: boolean
  isFollowed?: boolean
}

export const followUser = (userId: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/user/follow/${userId}`,
    method: 'post'
  }) as any
}

export const unfollowUser = (userId: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/user/follow/${userId}`,
    method: 'delete'
  }) as any
}

export const getMyFollowings = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserInfoVO>>> => {
  return request({
    url: '/user/followings',
    method: 'get',
    params
  }) as any
}

export const getMyFollowers = (params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserInfoVO>>> => {
  return request({
    url: '/user/followers',
    method: 'get',
    params
  }) as any
}

export const getFollowStatus = (userId: number): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/user/follow/${userId}/status`,
    method: 'get'
  }) as any
}

export const getUserFollowings = (userId: number, params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserInfoVO>>> => {
  return request({
    url: `/user/${userId}/followings`,
    method: 'get',
    params
  }) as any
}

export const getUserFollowers = (userId: number, params: { page: number; size: number }): Promise<ApiResponse<PageResult<UserInfoVO>>> => {
  return request({
    url: `/user/${userId}/followers`,
    method: 'get',
    params
  }) as any
}
