package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.AdminOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.DoctorOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.HospitalOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IStatsService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserService;
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
    private final IUserService userService;

    /**
     * 获取超级管理员大屏概览数据
     */
    @GetMapping("/admin/overview")
    @PreAuthorize("hasAuthority('ROLE_4')")
    public Result<AdminOverviewDTO> getAdminOverview() {
        return Result.success(statsService.getAdminOverview());
    }

    /**
     * 获取医院管理员大屏概览数据
     */
    @GetMapping("/hospital/overview")
    @PreAuthorize("hasAuthority('ROLE_3')")
    public Result<HospitalOverviewDTO> getHospitalOverview(@CurrentUserId Long adminUserId) {
        return Result.success(statsService.getHospitalOverview(adminUserId));
    }

    /**
     * 获取医生大屏概览数据
     */
    @GetMapping("/doctor/overview")
    @PreAuthorize("hasAuthority('ROLE_2')")
    public Result<DoctorOverviewDTO> getDoctorOverview(@CurrentUserId Long doctorId) {
        return Result.success(statsService.getDoctorOverview(doctorId));
    }
}
