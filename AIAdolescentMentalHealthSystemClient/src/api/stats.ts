import request from './user'

// ==================== 数据统计API ====================

export interface AdminOverview {
  totalUsers: number
  monthlyNewUsers: number
  totalAppointments: number
  monthlyAppointments: number
  pendingAppointments: number
  totalDoctors: number
  totalHospitals: number
  totalArticles: number
  totalCourses: number
  totalAssessments: number
  totalAiConsultations: number
  totalRevenue: number
  userTrend: Array<{ month: string; count: number }>
  userRoleDistribution: Array<{ role: number; count: number }>
  appointmentTrend: Array<{ day: string; count: number }>
  appointmentByStatus: Array<{ status: number; count: number }>
  appointmentByHospital: Array<{ hospitalId: number; hospitalName: string; count: number }>
  consultationTrend: Array<{ month: string; count: number }>
  aiConsultationTrend: Array<{ month: string; count: number }>
  satisfactionDistribution: Array<{ rating: number; count: number }>
  articleTrend: Array<{ month: string; count: number }>
  courseTrend: Array<{ month: string; count: number }>
  assessmentTrend: Array<{ month: string; count: number }>
  departmentAppointments: Array<{ departmentId: number; departmentName: string; count: number }>
  doctorRanking: Array<{ doctorName: string; realName: string; count: number }>
  articleRanking: Array<{ id: number; title: string; viewCount: number }>
  courseRanking: Array<{ id: number; title: string; studentCount: number }>
}

export interface HospitalOverview {
  hospitalName: string
  hospitalId: number
  totalPatients: number
  monthlyNewPatients: number
  totalAppointments: number
  monthlyAppointments: number
  pendingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalDoctors: number
  totalRevenue: number
  appointmentTrend: Array<{ day: string; count: number }>
  appointmentByStatus: Array<{ status: number; count: number }>
  departmentAppointments: Array<{ departmentId: number; departmentName: string; count: number }>
  departmentRevenue: Array<{ departmentId: number; departmentName: string; count: number }>
  doctorRanking: Array<{ doctorName: string; realName: string; count: number }>
  satisfactionDistribution: Array<{ rating: number; count: number }>
  averageRating: number
}

export interface DoctorOverview {
  doctorName: string
  hospitalName: string
  departmentName: string
  title: string
  totalPatients: number
  monthlyPatients: number
  totalAppointments: number
  monthlyAppointments: number
  pendingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowAppointments: number
  totalMedicalRecords: number
  totalRevenue: number
  appointmentTrend: Array<{ day: string; count: number }>
  patientAgeDistribution: Array<{ age: string; count: number }>
  patientGenderDistribution: Array<{ sex: number; count: number }>
  satisfactionDistribution: Array<{ rating: number; count: number }>
  averageRating: number
  goodRatingCount: number
  totalRatings: number
  scheduleUtilization: number
  totalSchedules: number
  availableSchedules: number
  todayAppointments: number
  todayCompleted: number
  tomorrowAppointments: number
}

/**
 * 获取超级管理员大屏数据
 */
export const getAdminOverview = (): Promise<any> => {
  return request({
    url: '/stats/admin/overview',
    method: 'get'
  })
}

/**
 * 获取医院管理员大屏数据
 */
export const getHospitalOverview = (): Promise<any> => {
  return request({
    url: '/stats/hospital/overview',
    method: 'get'
  })
}

/**
 * 获取医生大屏数据
 */
export const getDoctorOverview = (): Promise<any> => {
  return request({
    url: '/stats/doctor/overview',
    method: 'get'
  })
}
