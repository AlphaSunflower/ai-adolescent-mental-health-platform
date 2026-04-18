package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.ArticleAuditRequest;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IArticleAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/article/audit")
@RequiredArgsConstructor
public class ArticleAuditController {

    private final IArticleAuditService articleAuditService;
    private final UserMapper userMapper;

    @GetMapping("/list")
    public Result<PageResult<UserArticleVO>> getPendingArticles(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以审核文章");
        }
        return Result.success(articleAuditService.getPendingArticles(page, size));
    }

    @PostMapping("/{id}")
    public Result<String> auditArticle(
            @PathVariable Long id,
            @RequestBody ArticleAuditRequest request,
            @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以审核文章");
        }
        articleAuditService.auditArticle(id, request.getAction(), request.getReason(), userId);
        return Result.success("审核操作成功");
    }

    @PostMapping("/{id}/offline")
    public Result<String> offlineArticle(
            @PathVariable Long id,
            @RequestBody ArticleAuditRequest request,
            @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以下架文章");
        }
        articleAuditService.offlineArticle(id, request.getReason(), userId);
        return Result.success("文章下架成功，用户已收到通知");
    }
}
