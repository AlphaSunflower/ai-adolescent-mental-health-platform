import axios from 'axios'

// ==================== 类型定义 ====================

export interface SearchResultItem {
  id: number
  articleType?: 'official' | 'user'  // official=官方文章 /article/id, user=用户文章 /user-article/userId/articleId
  userId?: number
  type: 'article' | 'course'
  title: string
  description: string
  coverImage?: string
  author?: string
  createTime: string
  viewCount: number
  likeCount: number
  category?: string
  tags?: string[]
  duration?: number // 课程时长，单位：分钟
  price?: number // 课程价格
  isFree?: boolean // 是否免费课程
  status?: number // 状态
}

export interface SearchResponse {
  code: number
  message: string
  data: {
    total: number
    pageNum: number
    pageSize: number
    totalPages: number
    data: SearchResultItem[]
  }
}

export interface SearchParams {
  keyword: string
  type?: 'article' | 'course' | 'all'
  pageNum?: number
  pageSize?: number
  sortBy?: 'relevance' | 'time' | 'popular'
  category?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  isFree?: boolean
}

// ==================== axios 实例 ====================

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['token'] = token
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use(response => {
  const res = response.data
  if (res.code !== 200) {
    return Promise.resolve(res)
  }
  return res
}, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

// ==================== 搜索 API ====================

/**
 * 全局搜索（文章+课程）
 * @param params 搜索参数
 */
export function searchContent(params: SearchParams) {
  return request<SearchResponse>({
    url: '/search/global',
    method: 'get',
    params
  })
}

/**
 * 搜索文章
 * @param params 搜索参数
 */
export function searchArticles(params: Omit<SearchParams, 'type'>) {
  const searchParams = { ...params, type: 'article' as const }
  return request<SearchResponse>({
    url: '/search/articles',
    method: 'get',
    params: searchParams
  })
}

/**
 * 搜索课程
 * @param params 搜索参数
 */
export function searchCourses(params: Omit<SearchParams, 'type'>) {
  const searchParams = { ...params, type: 'course' as const }
  return request<SearchResponse>({
    url: '/search/courses',
    method: 'get',
    params: searchParams
  })
}

/**
 * 获取热门搜索关键词
 */
export function getHotKeywords() {
  return request<{
    code: number
    message: string
    data: string[]
  }>({
    url: '/search/hot-keywords',
    method: 'get'
  })
}

/**
 * 保存搜索历史
 * @param keyword 搜索关键词
 */
export function saveSearchHistory(keyword: string) {
  return request<{
    code: number
    message: string
    data: null
  }>({
    url: '/search/history',
    method: 'post',
    data: { keyword }
  })
}

/**
 * 获取搜索历史
 */
export function getSearchHistory() {
  return request<{
    code: number
    message: string
    data: string[]
  }>({
    url: '/search/history',
    method: 'get'
  })
}

/**
 * 清空搜索历史
 */
export function clearSearchHistory() {
  return request<{
    code: number
    message: string
    data: null
  }>({
    url: '/search/history',
    method: 'delete'
  })
}

/**
 * 获取搜索建议（自动补全）
 * @param keyword 关键词前缀
 */
export function getSearchSuggestions(keyword: string) {
  return request<{
    code: number
    message: string
    data: string[]
  }>({
    url: '/search/suggestions',
    method: 'get',
    params: { keyword }
  })
}

export default {
  searchContent,
  searchArticles,
  searchCourses,
  getHotKeywords,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getSearchSuggestions
}
