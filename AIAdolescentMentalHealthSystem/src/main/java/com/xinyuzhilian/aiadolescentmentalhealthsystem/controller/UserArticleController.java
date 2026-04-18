package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserArticle;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserArticleComment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserArticleService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.ValidatorUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/article/user")
@RequiredArgsConstructor
public class UserArticleController {

    private final IUserArticleService userArticleService;
    private final com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.OSSUtil ossUtil;

    @PostMapping
    public Result<String> publishArticle(@RequestBody UserArticle article, @CurrentUserId Long userId) {
        if (!StringUtils.hasText(article.getTitle())) {
            return Result.error("文章标题不能为空");
        }
        if (!StringUtils.hasText(article.getContent())) {
            return Result.error("文章内容不能为空");
        }
        UserArticle result = userArticleService.publishArticle(article, userId);
        return Result.success("文章提交成功，等待审核");
    }

    @GetMapping("/list")
    public Result<PageResult<UserArticleVO>> getMyArticles(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return Result.success(userArticleService.getMyArticles(userId, page, size));
    }

    @GetMapping("/list/published")
    public Result<PageResult<UserArticleVO>> getAllPublishedArticles(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long tagId) {
        return Result.success(userArticleService.getAllPublishedArticles(page, size, tagId));
    }

    @PutMapping("/{id}")
    public Result<String> updateArticle(@PathVariable Long id, @RequestBody UserArticle article, @CurrentUserId Long userId) {
        article.setId(id);
        userArticleService.updateArticle(article, userId);
        return Result.success("文章修改成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteArticle(@PathVariable Long id, @CurrentUserId Long userId) {
        userArticleService.deleteArticle(id, userId);
        return Result.success("文章删除成功");
    }

    @PostMapping("/{id}/withdraw")
    public Result<String> withdrawArticle(@PathVariable Long id, @CurrentUserId Long userId) {
        userArticleService.withdrawArticle(id, userId);
        return Result.success("文章撤回成功");
    }

    @GetMapping("/detail/{id}")
    public Result<UserArticleVO> getArticleDetail(@PathVariable Long id, @CurrentUserId Long userId) {
        UserArticleVO article = userArticleService.getArticleDetail(id, userId);
        if (article == null) {
            return Result.error("文章不存在");
        }
        return Result.success(article);
    }

    @GetMapping("/{userId}/{articleId}")
    public Result<UserArticleVO> getArticleDetailByUserAndId(
            @PathVariable Long userId,
            @PathVariable Long articleId,
            @CurrentUserId Long currentUserId) {
        UserArticleVO article = userArticleService.getArticleDetailByUserAndId(userId, articleId, currentUserId);
        if (article == null) {
            return Result.error("文章不存在或无权限访问");
        }
        return Result.success(article);
    }

    @PostMapping("/cover/upload")
    public Result<String> uploadCover(MultipartFile file) {
        try {
            ValidatorUtils.validateImage(file);
            String url = ossUtil.uploadFile(file, "article/cover");
            return Result.success("上传成功", url);
        } catch (Exception e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PostMapping("/{id}/offline")
    public Result<String> offlineArticle(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @CurrentUserId Long auditorId) {
        return userArticleService.offlineArticle(id, auditorId, reason);
    }

    @PostMapping("/{id}/online")
    public Result<String> onlineArticle(
            @PathVariable Long id,
            @CurrentUserId Long auditorId) {
        return userArticleService.onlineArticle(id, auditorId);
    }

    @PostMapping("/{id}/interact")
    public Result<String> interact(
            @PathVariable Long id,
            @RequestParam Integer type,
            @CurrentUserId Long userId) {
        return userArticleService.interactArticle(id, type, userId);
    }

    // ==================== 评论相关接口 ====================

    @PostMapping("/comment")
    public Result<String> addComment(@RequestBody UserArticleComment comment, @CurrentUserId Long userId) {
        return userArticleService.addComment(comment, userId);
    }

    @GetMapping("/comments/{articleId}")
    public Result<List<UserArticleCommentVO>> getComments(
            @PathVariable Long articleId,
            @CurrentUserId Long userId) {
        return userArticleService.getComments(articleId, userId);
    }

    @PostMapping("/comment/like/{commentId}")
    public Result<String> likeComment(@PathVariable Long commentId, @CurrentUserId Long userId) {
        return userArticleService.likeComment(commentId, userId);
    }
}
