// src/api/book.ts
import request from '@/utils/request'

// 定义接口类型
export interface Book {
  id: number
  title: string
  coverUrl: string
  description: string
  address: string
  viewCount: number
  commentCount: number
  createTime?: string
  updateTime?: string
  sortOrder?: number
  status?: number
}

export interface Comment {
  id: number
  bookId: number
  userId: number
  userNickname: string
  userAvatar: string
  content: string
  createTime: string
}

export interface BookListParams {
  page?: number
  size?: number
  keyword?: string
}

export interface CommentForm {
  bookId: number
  content: string
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

// 获取书籍列表
export function getBookList(params?: BookListParams): Promise<ApiResponse<PageResponse<Book>>> {
  return request({
    url: '/api/book/list',
    method: 'get',
    params
  }) as Promise<ApiResponse<PageResponse<Book>>>
}

// 获取书籍详情
export function getBookDetail(id: number): Promise<ApiResponse<Book>> {
  return request({
    url: `/api/book/${id}`,
    method: 'get'
  }) as Promise<ApiResponse<Book>>
}

// 增加书籍浏览数 (兼容新名称)
export function addBookView(id: number): Promise<ApiResponse> {
  return request({
    url: `/api/book/${id}/view`,
    method: 'post'
  }) as Promise<ApiResponse>
}

// 增加书籍浏览数 (兼容旧名称)
export function increaseViewCount(id: number): Promise<ApiResponse> {
  return addBookView(id)
}

// 提交书籍评论 (兼容新名称)
export function submitBookComment(data: CommentForm): Promise<ApiResponse> {
  return request({
    url: '/api/book/comment',
    method: 'post',
    data
  }) as Promise<ApiResponse>
}

// 提交书籍评论 (兼容旧名称)
export function addBookComment(data: CommentForm): Promise<ApiResponse> {
  return submitBookComment(data)
}

// 获取书籍评论列表
export function getBookComments(
  bookId: number, 
  params?: { page?: number; size?: number }
): Promise<ApiResponse<PageResponse<Comment>>> {
  return request({
    url: `/api/book/${bookId}/comment/list`,
    method: 'get',
    params
  }) as Promise<ApiResponse<PageResponse<Comment>>>
}