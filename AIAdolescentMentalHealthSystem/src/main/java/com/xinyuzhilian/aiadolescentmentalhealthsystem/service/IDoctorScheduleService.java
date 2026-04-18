package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.vo.AvailableDoctorVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorSchedule;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorScheduleConfig;

import java.time.LocalDate;
import java.util.List;

public interface IDoctorScheduleService {
    List<DoctorSchedule> getSchedules(Long doctorId, LocalDate startDate, LocalDate endDate);
    List<AvailableDoctorVO> getAvailableDoctors(Long departmentId, LocalDate date);
    void addSchedules(List<DoctorSchedule> schedules);
    List<DoctorScheduleConfig> getScheduleConfigs(Long doctorId);
    void saveScheduleConfig(List<DoctorScheduleConfig> configs);
    String generateSchedules(Long doctorId, LocalDate startDate, LocalDate endDate);
    List<AvailableDoctorVO> searchDoctors(String name, java.math.BigDecimal minRating, java.math.BigDecimal maxPrice, Long hospitalId, Long departmentId);
    void restrictDoctor(Long doctorId, Boolean enabled);
}