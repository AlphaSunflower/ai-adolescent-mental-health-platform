package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;


import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AppointmentCompletionRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.AppointmentRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.AppointmentDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.vo.AppointmentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.hospital.vo.AvailableDoctorVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Appointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorSchedule;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorScheduleConfig;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IDoctorScheduleService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/consultation")
@RequiredArgsConstructor
public class ConsultationController {

    private final IDoctorScheduleService scheduleService;
    private final IConsultationService consultationService;

    // --- Public / Common Endpoints ---

    @GetMapping("/schedules")
    public Result<List<DoctorSchedule>> getSchedules(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(scheduleService.getSchedules(doctorId, startDate, endDate));
    }

    @GetMapping("/doctors/available")
    public Result<List<AvailableDoctorVO>> getAvailableDoctors(
            @RequestParam Long departmentId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(scheduleService.getAvailableDoctors(departmentId, date));
    }

    @GetMapping("/doctors/search")
    public Result<List<AvailableDoctorVO>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) java.math.BigDecimal minRating,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) Long departmentId) {
        return Result.success(scheduleService.searchDoctors(name, minRating, maxPrice, hospitalId, departmentId));
    }

    // --- User Booking ---

    @PostMapping("/appointment")
    public Result<String> bookAppointment(@RequestBody AppointmentRequest request, @CurrentUserId Long userId) {
        return consultationService.bookAppointment(request, userId);
    }

    @PostMapping("/appointment/{id}/pay")
    public Result<String> payAppointment(@PathVariable Long id, @CurrentUserId Long userId) {
        return consultationService.payAppointment(id, userId);
    }

    @PostMapping("/appointment/{id}/cancel")
    public Result<String> cancelAppointment(@PathVariable Long id, @CurrentUserId Long userId) {
        return consultationService.cancelAppointment(id, userId);
    }
    
    @GetMapping("/appointment/{id}/detail")
    public Result<AppointmentDetailVO> getAppointmentDetail(@PathVariable Long id, @CurrentUserId Long userId) {
        return consultationService.getAppointmentDetail(id, userId);
    }

    @PostMapping("/appointment/complete")
    public Result<String> completeAppointment(@RequestBody AppointmentCompletionRequest request, @CurrentUserId Long userId) {
        return consultationService.completeAppointment(request, userId);
    }
    @PostMapping("/appointment/{id}/missed")
    public Result<String> missedAppointment(@PathVariable Long id, @CurrentUserId Long userId) {
        return consultationService.missedAppointment(id, userId);
    }

    @PostMapping("/appointment/{id}/reschedule")
    public Result<String> rescheduleAppointment(@PathVariable Long id, @RequestParam Long newScheduleId, @CurrentUserId Long userId) {
        return consultationService.rescheduleAppointment(id, newScheduleId, userId);
    }

    @PostMapping("/appointment/{id}/refund")
    public Result<String> refundAppointment(@PathVariable Long id) {
        return consultationService.refundAppointment(id);
    }

    @GetMapping("/appointments/my")
    public Result<PageResult<AppointmentVO>> myAppointments(
            @RequestParam(defaultValue = "1") Integer page, 
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long userId) {
        return Result.success(consultationService.myAppointments(page, size, userId));
    }

    // --- Doctor Appointment Management ---

    @GetMapping("/doctor/appointments")
    public Result<PageResult<AppointmentVO>> getDoctorAppointments(
            @RequestParam(defaultValue = "1") Integer page, 
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status,
            @CurrentUserId Long userId) {
        return Result.success(consultationService.getDoctorAppointments(page, size, status, userId));
    }

    @PutMapping("/appointment/{id}/status")
    public Result<String> updateAppointmentStatus(@PathVariable Long id, @RequestBody Appointment statusUpdate) {
        consultationService.updateAppointmentStatus(id, statusUpdate.getStatus());
        return Result.success("状态更新成功", null);
    }

    // --- Doctor / Admin Schedule Management ---

    @PostMapping("/schedule/batch")
    public Result<String> addSchedules(@RequestBody List<DoctorSchedule> schedules) {
        scheduleService.addSchedules(schedules);
        return Result.success("排班发布成功", null);
    }

    // --- Hospital Admin Schedule Configuration ---

    @GetMapping("/admin/schedule-configs/{doctorId}")
    public Result<List<DoctorScheduleConfig>> getScheduleConfigs(@PathVariable Long doctorId) {
        return Result.success(scheduleService.getScheduleConfigs(doctorId));
    }

    @PostMapping("/admin/schedule-config")
    public Result<String> saveScheduleConfig(@RequestBody List<DoctorScheduleConfig> configs) {
        scheduleService.saveScheduleConfig(configs);
        return Result.success("配置保存成功", null);
    }

    @PostMapping("/admin/schedule/generate")
    public Result<String> generateSchedules(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        
        return Result.success(scheduleService.generateSchedules(doctorId, startDate, endDate));
    }

    @PostMapping("/admin/doctor/{doctorId}/restrict")
    public Result<String> restrictDoctor(@PathVariable Long doctorId, @RequestParam Boolean enabled) {
        scheduleService.restrictDoctor(doctorId, enabled);
        return Result.success(enabled ? "已恢复医生权限" : "已限制医生权限");
    }
}
