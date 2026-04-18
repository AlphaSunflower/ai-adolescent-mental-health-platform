package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PlatformFeedback;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IPlatformFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feedback/platform")
@RequiredArgsConstructor
public class FeedbackController {

    private final IPlatformFeedbackService feedbackService;

    // User: Submit feedback
    @PostMapping
    public Result<String> submitFeedback(@RequestBody PlatformFeedback feedback, @CurrentUserId Long userId) {
        if (userId == null) {
            return Result.error(401, "未登录");
        }
        feedback.setUserId(userId);
        feedback.setStatus(0); // 0-已反馈
        feedbackService.save(feedback);
        return Result.success("提交成功", null);
    }

    // User: My feedback
    @GetMapping("/my")
    public Result<PageResult<PlatformFeedback>> myFeedback(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long userId) {
        
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        Page<PlatformFeedback> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PlatformFeedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PlatformFeedback::getUserId, userId);
        wrapper.orderByDesc(PlatformFeedback::getCreateTime);
        return Result.success(PageResult.build(feedbackService.page(pageParam, wrapper)));
    }

    // Admin: List all feedbacks
    @GetMapping("/list")
    public Result<PageResult<PlatformFeedback>> listFeedbacks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status) {
        
        Page<PlatformFeedback> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<PlatformFeedback> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(PlatformFeedback::getStatus, status);
        }
        wrapper.orderByDesc(PlatformFeedback::getCreateTime);
        return Result.success(PageResult.build(feedbackService.page(pageParam, wrapper)));
    }

    // Admin: Update status
    @PutMapping("/{id}/status")
    public Result<String> updateStatus(@PathVariable Long id, @RequestBody PlatformFeedback feedback) {
        PlatformFeedback existing = feedbackService.getById(id);
        if (existing == null) {
            return Result.error(404, "反馈不存在");
        }
        existing.setStatus(feedback.getStatus());
        if (feedback.getCancelReason() != null) {
            existing.setCancelReason(feedback.getCancelReason());
        }
        feedbackService.updateById(existing);
        return Result.success("更新成功", null);
    }
}