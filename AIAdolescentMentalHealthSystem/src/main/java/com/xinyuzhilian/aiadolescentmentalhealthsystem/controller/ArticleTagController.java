package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ArticleTag;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IArticleTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/article/tag")
@RequiredArgsConstructor
public class ArticleTagController {

    private final IArticleTagService articleTagService;
    private final UserMapper userMapper;

    @GetMapping("/list")
    public Result<List<ArticleTag>> getAllTags() {
        return Result.success(articleTagService.getAllTags());
    }

    @PostMapping
    public Result<String> addTag(@RequestBody ArticleTag tag, @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以添加标签");
        }
        ArticleTag result = articleTagService.addTag(tag);
        return Result.success("标签添加成功");
    }

    @PutMapping("/{id}")
    public Result<String> updateTag(@PathVariable Long id, @RequestBody ArticleTag tag, @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以修改标签");
        }
        tag.setId(id);
        articleTagService.updateTag(tag);
        return Result.success("标签修改成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteTag(@PathVariable Long id, @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以删除标签");
        }
        articleTagService.deleteTag(id);
        return Result.success("标签删除成功");
    }
}
