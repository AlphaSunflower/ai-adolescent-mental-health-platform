import request from './user'
import type { ApiResponse } from './user'

export interface Meme {
  id?: number
  meme: string
  explain: string
}


export interface MemePageResult {
  records: Meme[]
  total: number
  current: number
  size: number
  pages: number
}

export const getMemeList = (params: { 
  page: number
  size: number
  memeName?: string
}): Promise<ApiResponse<MemePageResult>> => {
  return request({
    url: '/meme/admin/list',
    method: 'get',
    params
  }) as any
}

export const getMemeDetail = (id: number): Promise<ApiResponse<Meme>> => {
  return request({
    url: `/meme/admin/${id}`,
    method: 'get'
  }) as any
}

export const saveMeme = (data:Meme): Promise<ApiResponse<string>> => {
  return request({
    url: '/meme/admin/save',
    method: 'post',
    data
  }) as any
}

export const updateMeme = (data: Meme): Promise<ApiResponse<string>> => {
  return request({
    url: '/meme/admin/update',
    method: 'put',
    data
  }) as any
}

export const deleteMeme = (id: number): Promise<ApiResponse<string>> => {
  return request.delete(`/meme/admin/${id}/delete`) as any
}

export const recognizeMemesBatch = (texts: string[]) => {
  return request.post('/meme/recognize', { texts }) as Promise<any>
}



