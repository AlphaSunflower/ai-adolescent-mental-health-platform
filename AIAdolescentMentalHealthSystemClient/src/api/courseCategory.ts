import request from './user'
import type { ApiResponse } from './user'

export interface CourseCategory {
  id?: number
  name: string
  code: string
  icon?: string
  sortOrder?: number
  status?: number
  isSystem?: number
  createTime?: string
  updateTime?: string
}

export const getCourseCategories = (): Promise<ApiResponse<CourseCategory[]>> => {
  return request({
    url: '/content/admin/course-category/list',
    method: 'get'
  }) as any
}

export const getEnabledCategories = (): Promise<ApiResponse<CourseCategory[]>> => {
  return request({
    url: '/content/admin/course-category/enabled',
    method: 'get'
  }) as any
}

export const addCourseCategory = (data: CourseCategory): Promise<ApiResponse<CourseCategory>> => {
  return request({
    url: '/content/admin/course-category',
    method: 'post',
    data
  }) as any
}

export const updateCourseCategory = (id: number, data: CourseCategory): Promise<ApiResponse<CourseCategory>> => {
  return request({
    url: `/content/admin/course-category/${id}`,
    method: 'put',
    data
  }) as any
}

export const deleteCourseCategory = (id: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/content/admin/course-category/${id}`,
    method: 'delete'
  }) as any
}
