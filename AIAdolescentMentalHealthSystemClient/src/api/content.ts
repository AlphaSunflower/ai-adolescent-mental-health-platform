import request from './user'
import type { ApiResponse } from './user'

export interface Article {
  id: number
  title: string
  content: string
  coverUrl: string
  type: string
  tagName: string
  createTime: string
  like_count?: number
  dislike_count?: number
  collection_count?: number
  comment_count?: number
  view_count?: number
}

export interface ArticleDetailVO {
  article: Article
  liked: boolean
  disliked: boolean
  collected: boolean
  recommendedArticles: Article[]
  recommendedCourses: Course[]
  recommendedAssessments: any[]
  authorName?: string
  authorAvatar?: string
  authorRole?: number
  hospitalName?: string
}

export interface ArticleCommentVO {
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
  liked: boolean
  createTime: string
  replies?: ArticleCommentVO[]
}

export interface Course {
  id: number
  title: string
  description: string
  mediaUrl: string
  coverUrl: string
  type: string
  sourceName?: string
  createTime: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

// 获取文章列表
export const getArticles = (params: { page: number; size: number; type?: string }): Promise<ApiResponse<PageResult<Article>>> => {
  return request({
    url: '/content/articles',
    method: 'get',
    params
  }) as any
}

// 获取文章详情
export const getArticleDetail = (id: number): Promise<ApiResponse<ArticleDetailVO>> => {
  return request({
    url: `/content/article/detail/${id}`,
    method: 'get'
  }) as any
}

// 文章互动
export const interactArticle = (articleId: number, type: number): Promise<ApiResponse<string>> => {
  return request({
    url: '/content/article/interact',
    method: 'post',
    params: { articleId, type }
  }) as any
}

// 发表评论
export const addArticleComment = (data: { articleId: number; content: string; parentId?: number; replyToUserId?: number }): Promise<ApiResponse<string>> => {
  return request({
    url: '/content/article/comment',
    method: 'post',
    data
  }) as any
}

// 获取评论列表
export const getArticleComments = (articleId: number): Promise<ApiResponse<ArticleCommentVO[]>> => {
  return request({
    url: `/content/article/comments/${articleId}`,
    method: 'get'
  }) as any
}

// 评论点赞
export const likeArticleComment = (commentId: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/content/article/comment/like/${commentId}`,
    method: 'post'
  }) as any
}

// 获取课程列表
export const getCourses = (params: { page: number; size: number; type?: string }): Promise<ApiResponse<PageResult<Course>>> => {
  return request({
    url: '/content/courses',
    method: 'get',
    params
  }) as any
}

// 获取课程详情
export const getCourseDetail = (id: number): Promise<ApiResponse<Course>> => {
  return request({
    url: `/content/course/${id}`,
    method: 'get'
  }) as any
}
