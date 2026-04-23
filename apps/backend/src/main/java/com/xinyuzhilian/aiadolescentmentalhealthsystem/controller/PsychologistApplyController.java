package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.PsychologistBasicRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.PsychologistReportRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.PsychologistApplyVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPsychologistApplyService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.OSSUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * 心理咨询师入驻申请控制器（用户端）
 */
@RestController
@RequestMapping("/psychologist-apply")
@RequiredArgsConstructor
@Slf4j
public class PsychologistApplyController {

    private final IPsychologistApplyService psychologistApplyService;
    private final OSSUtil ossUtil;

    /**
     * 检查申请资格
     */
    @GetMapping("/check")
    public Result<Map<String, Object>> checkEligibility(@CurrentUserId Long userId) {
        Map<String, Object> result = psychologistApplyService.checkApplyEligibility(userId);
        return Result.success(result);
    }

    /**
     * 获取入驻状态
     */
    @GetMapping("/status")
    public Result<Map<String, Object>> getApplyStatus(@CurrentUserId Long userId) {
        Map<String, Object> result = psychologistApplyService.getApplyStatus(userId);
        return Result.success(result);
    }

    /**
     * 提交基本资料
     */
    @PostMapping("/basic")
    public Result<String> submitBasicInfo(
            @CurrentUserId Long userId,
            @RequestBody PsychologistBasicRequest request) {
        return psychologistApplyService.submitBasicInfo(userId, request);
    }

    /**
     * 提交案例报告
     */
    @PostMapping("/report")
    public Result<String> submitReport(
            @CurrentUserId Long userId,
            @RequestBody PsychologistReportRequest request) {
        return psychologistApplyService.submitReport(userId, request);
    }

    /**
     * 获取申请详情
     */
    @GetMapping("/detail")
    public Result<PsychologistApplyVO> getApplyDetail(@CurrentUserId Long userId) {
        PsychologistApplyVO detail = psychologistApplyService.getApplyDetail(userId);
        if (detail == null) {
            return Result.error("暂无入驻申请记录");
        }
        return Result.success(detail);
    }

    /**
     * 上传附件
     */
    @PostMapping("/upload")
    public Result<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type) {
        try {
            String folder = "psychologist";
            String url = ossUtil.uploadFile(file, folder);
            return Result.success("上传成功", url);
        } catch (Exception e) {
            log.error("心理咨询师文件上传失败", e);
            return Result.error("上传失败: " + e.getMessage());
        }
    }
}
