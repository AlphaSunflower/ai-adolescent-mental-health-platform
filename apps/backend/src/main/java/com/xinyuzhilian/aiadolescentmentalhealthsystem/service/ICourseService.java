package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.CourseDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Course;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;

public interface ICourseService extends IService<Course> {
    void saveCourseWithDetails(CourseDTO courseDTO);
    CourseDTO getCourseWithDetails(Long id);
    PageResult<Course> getCourseList(Integer page, Integer size, String type);
    PageResult<Course> getAdminCourses(Integer page, Integer size, String title, String type);
    void saveCourseOld(Course course);
}
