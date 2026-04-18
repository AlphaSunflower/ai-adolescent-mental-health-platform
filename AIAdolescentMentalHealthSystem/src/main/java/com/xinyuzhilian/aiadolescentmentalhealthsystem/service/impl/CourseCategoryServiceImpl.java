package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.CourseCategory;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.CourseCategoryMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ICourseCategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseCategoryServiceImpl extends ServiceImpl<CourseCategoryMapper, CourseCategory> implements ICourseCategoryService {

    @Override
    public List<CourseCategory> getAllCategories() {
        LambdaQueryWrapper<CourseCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(CourseCategory::getSortOrder);
        return this.list(wrapper);
    }

    @Override
    public List<CourseCategory> getEnabledCategories() {
        LambdaQueryWrapper<CourseCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CourseCategory::getStatus, 1);
        wrapper.orderByAsc(CourseCategory::getSortOrder);
        return this.list(wrapper);
    }

    @Override
    @Transactional
    public CourseCategory saveCategory(CourseCategory category) {
        if (category.getId() == null) {
            category.setCreateTime(LocalDateTime.now());
            category.setUpdateTime(LocalDateTime.now());
            this.save(category);
        } else {
            category.setUpdateTime(LocalDateTime.now());
            this.updateById(category);
        }
        return category;
    }

    @Override
    @Transactional
    public boolean deleteCategory(Long id) {
        CourseCategory category = this.getById(id);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        if (category.getIsSystem() != null && category.getIsSystem() == 1) {
            throw new RuntimeException("系统内置分类不能删除");
        }
        return this.removeById(id);
    }
}
