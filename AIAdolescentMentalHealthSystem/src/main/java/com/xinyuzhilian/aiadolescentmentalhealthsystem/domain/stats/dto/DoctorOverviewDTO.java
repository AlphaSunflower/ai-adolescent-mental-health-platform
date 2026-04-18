package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DoctorOverviewDTO {

    // 医生基本信息
    private String doctorName;
    private String hospitalName;
    private String departmentName;
    private String title;

    // 核心指标
    private Long totalPatients;
    private Long monthlyPatients;
    private Long totalAppointments;
    private Long monthlyAppointments;
    private Long pendingAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Long noShowAppointments;
    private Long totalMedicalRecords;
    private BigDecimal totalRevenue;

    // 预约趋势
    private List<Map<String, Object>> appointmentTrend;

    // 患者分析
    private List<Map<String, Object>> patientAgeDistribution;
    private List<Map<String, Object>> patientGenderDistribution;

    // 满意度
    private List<Map<String, Object>> satisfactionDistribution;
    private Double averageRating;
    private Long goodRatingCount;
    private Long totalRatings;

    // 排班相关
    private Double scheduleUtilization;
    private Long totalSchedules;
    private Long availableSchedules;

    // 今日概览
    private Long todayAppointments;
    private Long todayCompleted;
    private Long tomorrowAppointments;
}
