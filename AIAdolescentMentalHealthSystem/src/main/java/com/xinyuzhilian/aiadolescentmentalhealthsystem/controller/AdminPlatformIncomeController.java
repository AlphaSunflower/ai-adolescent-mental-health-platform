package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPlatformIncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 超级管理员 - 平台收入管理控制器
 */
@RestController
@RequestMapping("/admin/platform-income")
@RequiredArgsConstructor
public class AdminPlatformIncomeController {

    private final IPlatformIncomeService platformIncomeService;

    /**
     * 获取平台收入统计（分模块）
     * 模块：CONSULTATION-心理咨询，MEMBER-会员（预留）
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getIncomeStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> stats = platformIncomeService.getIncomeStats(startDate, endDate);
        return Result.success(stats);
    }

    /**
     * 获取收入趋势数据（按日）
     */
    @GetMapping("/trend")
    public Result<Map<String, Object>> getIncomeTrend(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) String module) {
        Map<String, Object> trend = platformIncomeService.getIncomeTrend(startDate, endDate, module);
        return Result.success(trend);
    }

    /**
     * 获取心理咨询收入明细列表
     */
    @GetMapping("/consultation/list")
    public Result<PageResult<Map<String, Object>>> getConsultationIncomeList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long psychologistId,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) BigDecimal maxRating,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        PageResult<Map<String, Object>> result = platformIncomeService.getConsultationIncomeList(
                page, size, psychologistId, minRating, maxRating, startDate, endDate);
        return Result.success(result);
    }
}
