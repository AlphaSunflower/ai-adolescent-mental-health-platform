package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.consultation.dto.CancelAppointmentRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 心理咨询预约控制器
 * 提供心理咨询预约、支付、取消、评价等功能
 *
 * @author AI Developer
 * @since 2026-04-14
 */
@RestController
@RequestMapping("/psychologist/appointment")
@RequiredArgsConstructor
public class PsychologistAppointmentController {

    private final IPsychologistAppointmentService appointmentService;

    /**
     * 创建预约订单
     */
    @PostMapping
    public Result<Map<String, Object>> createAppointment(
            @RequestBody Map<String, Object> request,
            @CurrentUserId Long userId) {
        try {
            Long appointmentId = appointmentService.createAppointment(request, userId);
            Map<String, Object> result = new HashMap<>();
            result.put("appointmentId", appointmentId);
            result.put("orderNo", appointmentService.generateOrderNo());
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 支付预约订单（虚拟支付）
     */
    @PostMapping("/{id}/pay")
    public Result<String> payAppointment(
            @PathVariable Long id,
            @CurrentUserId Long userId) {
        try {
            String result = appointmentService.payAppointment(id, userId);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 取消预约订单
     */
    @PostMapping("/{id}/cancel")
    public Result<String> cancelAppointment(
            @PathVariable Long id,
            @RequestBody CancelAppointmentRequest request,
            @CurrentUserId Long userId) {
        try {
            String result = appointmentService.cancelAppointment(id, userId, request.getCancelReason());
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取我的预约列表
     */
    @GetMapping("/my")
    public Result<PageResult<Map<String, Object>>> getMyAppointments(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long userId,
            @RequestParam(required = false) Integer status) {
        PageResult<Map<String, Object>> result = appointmentService.getMyAppointments(page, size, userId, status);
        return Result.success(result);
    }

    /**
     * 获取预约详情
     */
    @GetMapping("/{id}/detail")
    public Result<Map<String, Object>> getAppointmentDetail(
            @PathVariable Long id,
            @CurrentUserId Long userId) {
        Map<String, Object> detail = appointmentService.getAppointmentDetail(id, userId);
        if (detail == null) {
            return Result.error("预约不存在");
        }
        return Result.success(detail);
    }

    /**
     * 评价预约
     */
    @PostMapping("/{id}/rate")
    public Result<String> rateAppointment(
            @PathVariable Long id,
            @RequestParam Integer rating,
            @RequestParam(required = false) String content,
            @RequestParam(required = false, defaultValue = "0") Integer isAnonymous,
            @CurrentUserId Long userId) {
        try {
            String result = appointmentService.rateAppointment(id, rating, content, isAnonymous, userId);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
