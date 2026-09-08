package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.AdminOverviewDTO;

public interface IStatsService {

    /**
     * 获取超级管理员大屏数据
     */
    AdminOverviewDTO getAdminOverview();
}
