package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class HospitalOverviewDTO {

    // 医院基本信息
    private String hospitalName;
    private Long hospitalId;

    // 核心指标
    private Long totalPatients;
    private Long monthlyNewPatients;
    private Long totalAppointments;
    private Long monthlyAppointments;
    private Long pendingAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Long totalDoctors;
    private BigDecimal totalRevenue;

    // 预约相关
    private List<Map<String, Object>> appointmentTrend;
    private List<Map<String, Object>> appointmentByStatus;

    // 科室分析
    private List<Map<String, Object>> departmentAppointments;
    private List<Map<String, Object>> departmentRevenue;

    // 医生排行榜
    private List<Map<String, Object>> doctorRanking;

    // 咨询反馈
    private List<Map<String, Object>> satisfactionDistribution;
    private Double averageRating;
}
