package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.AdminOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.DoctorOverviewDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.stats.dto.HospitalOverviewDTO;

public interface IStatsService {

    /**
     * 获取超级管理员大屏数据
     */
    AdminOverviewDTO getAdminOverview();

    /**
     * 获取医院管理员大屏数据
     */
    HospitalOverviewDTO getHospitalOverview(Long adminUserId);

    /**
     * 获取医生大屏数据
     */
    DoctorOverviewDTO getDoctorOverview(Long doctorId);
}
