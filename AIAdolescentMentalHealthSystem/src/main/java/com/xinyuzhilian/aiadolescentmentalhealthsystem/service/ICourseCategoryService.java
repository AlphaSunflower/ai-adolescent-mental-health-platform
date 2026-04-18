package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.CourseCategory;

import java.util.List;

public interface ICourseCategoryService extends IService<CourseCategory> {
    List<CourseCategory> getAllCategories();
    
    List<CourseCategory> getEnabledCategories();
    
    CourseCategory saveCategory(CourseCategory category);
    
    boolean deleteCategory(Long id);
}
