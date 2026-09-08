package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.AdminOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 数据统计控制器
 * 提供各角色的大屏数据接口
 */
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final IStatsService statsService;

    /**
     * 获取超级管理员大屏概览数据
     */
    @GetMapping("/admin/overview")
    @PreAuthorize("hasAuthority('ROLE_4')")
    public Result<AdminOverviewDTO> getAdminOverview() {
        return Result.success(statsService.getAdminOverview());
    }
}
