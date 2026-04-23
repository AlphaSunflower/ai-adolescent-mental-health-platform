import request from './user'
import type { ApiResponse } from './user'

export const getDoctorAppointments = (params: any): Promise<ApiResponse<any>> => {
  return request({
    url: '/consultation/doctor/appointments',
    method: 'get',
    params
  }) as any
}

export const updateAppointmentStatus = (id: number, status: number): Promise<ApiResponse<string>> => {
  return request({
    url: `/consultation/appointment/${id}/status`,
    method: 'put',
    data: { status }
  }) as any
}

// Search doctors with filters
export const searchDoctors = (params: {
  name?: string;
  minRating?: number;
  maxPrice?: number;
  hospitalId?: number;
  departmentId?: number;
}): Promise<ApiResponse<any[]>> => {
  return request.get('/consultation/doctors/search', { params }) as any
}

// Messages
export const sendMessage = (data: {
  appointmentId: number;
  content: string;
  type: number;
}): Promise<ApiResponse<string>> => {
  return request.post('/consultation/message/send', data) as any
}

export const getMessageHistory = (appointmentId: number): Promise<ApiResponse<any[]>> => {
  return request.get(`/consultation/message/history/${appointmentId}`) as any
}

// Complaints
export const submitComplaint = (data: {
  appointmentId: number;
  content: string;
  proofImages: string[];
}): Promise<ApiResponse<string>> => {
  return request.post('/complaint/submit', data) as any
}

export const auditComplaint = (id: number, status: number, auditRemark: string): Promise<ApiResponse<string>> => {
  return request.post(`/complaint/audit/${id}`, null, { params: { status, auditRemark } }) as any
}

export const getComplaintList = (params: any): Promise<ApiResponse<any>> => {
  return request.get('/complaint/list', { params }) as any
}

// Reschedule/Refund
export const rescheduleAppointment = (id: number, newScheduleId: number): Promise<ApiResponse<string>> => {
  return request.post(`/consultation/appointment/${id}/reschedule`, null, { params: { newScheduleId } }) as any
}

export const refundAppointment = (id: number): Promise<ApiResponse<string>> => {
  return request.post(`/consultation/appointment/${id}/refund`) as any
}

export const restrictDoctor = (doctorId: number, enabled: boolean): Promise<ApiResponse<string>> => {
  return request.post(`/consultation/admin/doctor/${doctorId}/restrict`, null, { params: { enabled } }) as any
}

export const deleteMeme = (id: number): Promise<ApiResponse<string>> => {
    return request.post(`/consultation/admin/meme/${id}/delete`, null) as any
}
