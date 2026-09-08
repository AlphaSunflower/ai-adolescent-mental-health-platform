package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AdminOverviewDTO {

    // 核心指标
    private Long totalUsers;
    private Long monthlyNewUsers;
    private Long totalArticles;
    private Long totalCourses;
    private Long totalAssessments;
    private Long totalAiConsultations;
    private Long totalPsychologists;

    // 用户相关
    private List<Map<String, Object>> userTrend;
    private List<Map<String, Object>> userRoleDistribution;

    // 咨询相关
    private List<Map<String, Object>> aiConsultationTrend;

    // 内容相关
    private List<Map<String, Object>> articleTrend;
    private List<Map<String, Object>> courseTrend;
    private List<Map<String, Object>> assessmentTrend;
    private List<Map<String, Object>> articleRanking;
    private List<Map<String, Object>> courseRanking;
}
