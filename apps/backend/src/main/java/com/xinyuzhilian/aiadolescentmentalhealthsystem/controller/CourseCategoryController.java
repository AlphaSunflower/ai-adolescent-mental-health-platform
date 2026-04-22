package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.CourseCategory;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.User;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ICourseCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 课程分类管理控制器
 * 超级管理员可对课程分类进行增删改查
 */
@RestController
@RequestMapping("/content/admin/course-category")
@RequiredArgsConstructor
public class CourseCategoryController {

    private final ICourseCategoryService courseCategoryService;
    private final UserMapper userMapper;

    /**
     * 获取所有课程分类
     */
    @GetMapping("/list")
    public Result<List<CourseCategory>> getAllCategories(@CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以管理课程分类");
        }
        return Result.success(courseCategoryService.getAllCategories());
    }

    /**
     * 获取启用的课程分类（用户端）
     */
    @GetMapping("/enabled")
    public Result<List<CourseCategory>> getEnabledCategories() {
        return Result.success(courseCategoryService.getEnabledCategories());
    }

    /**
     * 新增课程分类
     */
    @PostMapping
    public Result<CourseCategory> addCategory(
            @RequestBody CourseCategory category,
            @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以管理课程分类");
        }
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return Result.error("分类名称不能为空");
        }
        if (category.getCode() == null || category.getCode().trim().isEmpty()) {
            return Result.error("分类编码不能为空");
        }
        // 非系统内置
        category.setIsSystem(0);
        CourseCategory saved = courseCategoryService.saveCategory(category);
        return Result.success(saved);
    }

    /**
     * 修改课程分类
     */
    @PutMapping("/{id}")
    public Result<CourseCategory> updateCategory(
            @PathVariable Long id,
            @RequestBody CourseCategory category,
            @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以管理课程分类");
        }
        category.setId(id);
        // 系统内置分类不允许修改编码
        CourseCategory existing = courseCategoryService.getById(id);
        if (existing != null && existing.getIsSystem() != null && existing.getIsSystem() == 1) {
            // 允许修改名称、图标、排序、状态，但不允许修改编码
            category.setCode(existing.getCode());
        }
        CourseCategory saved = courseCategoryService.saveCategory(category);
        return Result.success(saved);
    }

    /**
     * 删除课程分类
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteCategory(
            @PathVariable Long id,
            @CurrentUserId Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getRole() != 4) {
            return Result.error(403, "只有超级管理员可以管理课程分类");
        }
        try {
            courseCategoryService.deleteCategory(id);
            return Result.success("删除成功");
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
