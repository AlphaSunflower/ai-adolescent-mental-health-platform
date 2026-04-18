package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class AdminOverviewDTO {

    // 核心指标
    private Long totalUsers;
    private Long monthlyNewUsers;
    private Long totalAppointments;
    private Long monthlyAppointments;
    private Long pendingAppointments;
    private Long totalDoctors;
    private Long totalHospitals;
    private Long totalArticles;
    private Long totalCourses;
    private Long totalAssessments;
    private Long totalAiConsultations;
    private BigDecimal totalRevenue;

    // 用户相关
    private List<Map<String, Object>> userTrend;
    private List<Map<String, Object>> userRoleDistribution;

    // 预约相关
    private List<Map<String, Object>> appointmentTrend;
    private List<Map<String, Object>> appointmentByStatus;
    private List<Map<String, Object>> appointmentByHospital;

    // 咨询相关
    private List<Map<String, Object>> consultationTrend;
    private List<Map<String, Object>> satisfactionDistribution;
    private List<Map<String, Object>> aiConsultationTrend;

    // 内容相关
    private List<Map<String, Object>> articleTrend;
    private List<Map<String, Object>> courseTrend;
    private List<Map<String, Object>> assessmentTrend;
    private List<Map<String, Object>> articleRanking;
    private List<Map<String, Object>> courseRanking;

    // 科室分析
    private List<Map<String, Object>> departmentAppointments;

    // 医生排行榜
    private List<Map<String, Object>> doctorRanking;
}
