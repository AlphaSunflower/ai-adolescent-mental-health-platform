import request from './user'
import type { ApiResponse } from './user'

export const getMyPatients = (params: { page: number; size: number }): Promise<ApiResponse<any>> => {
  return request({
    url: '/doctor/patients',
    method: 'get',
    params
  }) as any
}

export const completeAppointment = (appointmentId: number): Promise<ApiResponse<any>> => {
  return request({
    url: `/consultation/appointment/${appointmentId}/complete`,
    method: 'post'
  }) as any
}

export const markAppointmentMissed = (appointmentId: number): Promise<ApiResponse<any>> => {
  return request({
    url: `/consultation/appointment/${appointmentId}/missed`,
    method: 'post'
  }) as any
}
