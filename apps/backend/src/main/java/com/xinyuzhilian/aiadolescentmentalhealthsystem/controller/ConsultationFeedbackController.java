package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUser;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Appointment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ConsultationFeedback;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.DoctorProfile;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AppointmentMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.DoctorProfileMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IConsultationFeedbackService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feedback/consultation")
@RequiredArgsConstructor
public class ConsultationFeedbackController {

    private final IConsultationFeedbackService feedbackService;
    private final AppointmentMapper appointmentMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.HospitalMapper hospitalMapper;

    // User: Submit feedback
    @PostMapping
    public Result<String> submitFeedback(@RequestBody ConsultationFeedback feedback, @CurrentUserId Long userId) {
        if (userId == null) {
            return Result.error(401, "未登录");
        }
        feedback.setUserId(userId);
        feedback.setStatus(0); // 0-已反馈
        // If appointmentId is provided, fill doctorId
        if (feedback.getAppointmentId() != null) {
            Appointment appointment = appointmentMapper.selectById(feedback.getAppointmentId());
            if (appointment != null) {
                feedback.setDoctorId(appointment.getDoctorId());
            }
        }

        // Fill hospitalId from doctorId
        if (feedback.getDoctorId() != null) {
            DoctorProfile doctorProfile = doctorProfileMapper.selectById(feedback.getDoctorId());
            if (doctorProfile != null) {
                feedback.setHospitalId(doctorProfile.getHospitalId());
            }
        }

        feedbackService.save(feedback);
        return Result.success("提交成功", null);
    }

    // User: My feedback
    @GetMapping("/my")
    public Result<PageResult<ConsultationFeedback>> myFeedback(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long userId) {
        
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        Page<ConsultationFeedback> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<ConsultationFeedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ConsultationFeedback::getUserId, userId);
        wrapper.orderByDesc(ConsultationFeedback::getCreateTime);
        return Result.success(PageResult.build(feedbackService.page(pageParam, wrapper)));
    }

    // Hospital Admin: List feedbacks
    @GetMapping("/list")
    public Result<PageResult<ConsultationFeedback>> listFeedbacks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status,
            @CurrentUser User currentUser) {
        
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        Long currentUserId = currentUser.getId();
        Integer role = currentUser.getRole();

        Page<ConsultationFeedback> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<ConsultationFeedback> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(ConsultationFeedback::getStatus, status);
        }
        
        // Filter by hospitalId based on logged-in admin (Role 3)
        if (role == 3) {
             // Find hospital where admin_user_id = currentUserId
             com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital hospital = hospitalMapper.selectOne(
                 new LambdaQueryWrapper<com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital>()
                     .eq(com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Hospital::getAdminUserId, currentUserId)
             );
             if (hospital != null) {
                 wrapper.eq(ConsultationFeedback::getHospitalId, hospital.getId());
             } else {
                 // If not found, maybe return empty? Or assume super admin?
                 // Let's return empty to be safe
                 return Result.success(new PageResult<>());
             }
        }
        
        wrapper.orderByDesc(ConsultationFeedback::getCreateTime);
        return Result.success(PageResult.build(feedbackService.page(pageParam, wrapper)));
    }

    // Hospital Admin: Process feedback (Accept/Reject)
    @PutMapping("/{id}/process")
    public Result<String> processFeedback(@PathVariable Long id, @RequestBody ConsultationFeedback feedback) {
        ConsultationFeedback existing = feedbackService.getById(id);
        if (existing == null) {
            return Result.error(404, "反馈不存在");
        }
        existing.setStatus(feedback.getStatus());
        if (feedback.getReplyContent() != null) {
            existing.setReplyContent(feedback.getReplyContent());
        }
        if (feedback.getRejectReason() != null) {
            existing.setRejectReason(feedback.getRejectReason());
        }
        feedbackService.updateById(existing);
        return Result.success("处理成功", null);
    }
}
