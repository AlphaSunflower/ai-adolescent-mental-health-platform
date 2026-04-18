// 书籍管理 API - 超级管理员端
import request from '@/api/user'

// 定义接口类型
export interface BookAdmin {
  id: number
  title: string
  coverUrl: string
  description: string
  address: string
  viewCount: number
  commentCount: number
  sortOrder: number
  status: number
  createTime: string
  updateTime: string
}

export interface BookComment {
  id: number
  bookId: number
  userId: number
  userNickname: string
  userAvatar: string
  content: string
  createTime: string
}

export interface BookFormData {
  id?: number
  title?: string
  coverUrl?: string
  description?: string
  address?: string
  sortOrder?: number
  status?: number
}

export interface BookListParams {
  page?: number
  size?: number
  keyword?: string
  status?: number
}

export interface CommentListParams {
  page?: number
  size?: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResponse<T> {
  total: number
  records: T[]
  current: number
  size: number
  pages: number
}

// 获取书籍管理列表
export function getBookAdminList(params?: BookListParams): Promise<ApiResponse<PageResponse<BookAdmin>>> {
  return request({
    url: '/admin/book/list',
    method: 'get',
    params
  }) as Promise<ApiResponse<PageResponse<BookAdmin>>>
}

// 获取书籍详情（编辑回显）
export function getBookAdminDetail(id: number): Promise<ApiResponse<BookAdmin>> {
  return request({
    url: `/admin/book/${id}`,
    method: 'get'
  }) as Promise<ApiResponse<BookAdmin>>
}

// 新增书籍
export function addBook(data: BookFormData): Promise<ApiResponse> {
  return request({
    url: '/admin/book',
    method: 'post',
    data
  }) as Promise<ApiResponse>
}

// 修改书籍
export function updateBook(id: number, data: BookFormData): Promise<ApiResponse> {
  return request({
    url: `/admin/book/${id}`,
    method: 'put',
    data
  }) as Promise<ApiResponse>
}

// 删除书籍
export function deleteBook(id: number): Promise<ApiResponse> {
  return request({
    url: `/admin/book/${id}`,
    method: 'delete'
  }) as Promise<ApiResponse>
}

// 获取书籍评论列表
export function getBookCommentList(bookId: number, params?: CommentListParams): Promise<ApiResponse<PageResponse<BookComment>>> {
  return request({
    url: `/book/${bookId}/comment/list`,
    method: 'get',
    params
  }) as Promise<ApiResponse<PageResponse<BookComment>>>
}

// 删除书籍评论
export function deleteBookComment(id: number): Promise<ApiResponse> {
  return request({
    url: `/admin/book/comment/${id}`,
    method: 'delete'
  }) as Promise<ApiResponse>
}

// 获取所有书籍的评论（用于评论管理）
export function getAllBookComments(params?: CommentListParams): Promise<ApiResponse<PageResponse<BookComment>>> {
  return request({
    url: '/admin/book/comments',
    method: 'get',
    params
  }) as Promise<ApiResponse<PageResponse<BookComment>>>
}
