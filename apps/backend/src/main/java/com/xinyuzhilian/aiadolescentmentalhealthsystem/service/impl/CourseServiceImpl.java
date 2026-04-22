package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.dto.CourseDTO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Course;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.CourseSource;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.CoverImage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.CourseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.CourseSourceMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.CoverImageMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ICourseService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.utils.ValidatorUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl extends ServiceImpl<CourseMapper, Course> implements ICourseService {

    private final CourseSourceMapper courseSourceMapper;
    private final CoverImageMapper coverImageMapper;

    @Override
    public PageResult<Course> getCourseList(Integer page, Integer size, String type) {
        Page<Course> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Course::getStatus, 1);
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Course::getType, type);
        }
        wrapper.orderByDesc(Course::getCreateTime);
        
        Page<Course> result = this.page(pageParam, wrapper);
        if (result.getRecords() != null && !result.getRecords().isEmpty()) {
            result.getRecords().forEach(course -> {
                CourseSource source = courseSourceMapper.selectOne(
                    new LambdaQueryWrapper<CourseSource>().eq(CourseSource::getCourseId, course.getId())
                );
                if (source != null) {
                    course.setSourceName(source.getSourceName());
                }
            });
        }
        return PageResult.build(result);
    }

    @Override
    public PageResult<Course> getAdminCourses(Integer page, Integer size, String title, String type) {
        Page<Course> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        if (title != null && !title.isEmpty()) {
            wrapper.like(Course::getTitle, title);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Course::getType, type);
        }
        wrapper.orderByDesc(Course::getCreateTime);
        return PageResult.build(this.page(pageParam, wrapper));
    }

    @Override
    public void saveCourseOld(Course course) {
        if (course.getId() == null) {
            course.setCreateTime(LocalDateTime.now());
            this.save(course);
        } else {
            this.updateById(course);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveCourseWithDetails(CourseDTO dto) {
        // 1. Validation
        if ("third_party".equals(dto.getSourceType())) {
            ValidatorUtils.validateUrl(dto.getSourceUrl());
            if (dto.getSourceName() == null || dto.getSourceName().isEmpty()) {
                throw new RuntimeException("第三方来源名称不能为");
            }
        }
        if (dto.getCoverUrl() != null) {
            ValidatorUtils.validateUrl(dto.getCoverUrl());
        }

        // 2. Save Course Main
        Course course = new Course();
        if (dto.getId() != null) {
            course = getById(dto.getId());
        }
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setType(dto.getType());
        course.setStatus(dto.getStatus());
        // For backward compatibility or display
        course.setMediaUrl(dto.getSourceUrl());
        course.setCoverUrl(dto.getCoverUrl() != null ? dto.getCoverUrl() : dto.getCoverUrlJpeg());
        
        if (course.getId() == null) {
            save(course);
        } else {
            updateById(course);
            // Delete old details
            courseSourceMapper.delete(new LambdaQueryWrapper<CourseSource>().eq(CourseSource::getCourseId, course.getId()));
            coverImageMapper.delete(new LambdaQueryWrapper<CoverImage>().eq(CoverImage::getCourseId, course.getId()));
        }

        // 3. Save Source
        CourseSource source = new CourseSource();
        source.setCourseId(course.getId());
        source.setSourceType(dto.getSourceType());
        source.setSourceName(dto.getSourceName());
        source.setSourceUrl(dto.getSourceUrl());
        source.setStorageProvider(dto.getStorageProvider());
        courseSourceMapper.insert(source);

        // 4. Save Cover
        CoverImage cover = new CoverImage();
        cover.setCourseId(course.getId());
        
        // Set default coverType if missing
        String coverType = dto.getCoverType();
        if (coverType == null || coverType.isEmpty()) {
            // Infer based on presence of coverUrl (usually third_party) vs coverUrlJpeg (usually self_hosted)
            if (dto.getCoverUrl() != null && !dto.getCoverUrl().isEmpty()) {
                coverType = "third_party";
            } else if (dto.getCoverUrlJpeg() != null && !dto.getCoverUrlJpeg().isEmpty()) {
                coverType = "self_hosted";
            } else {
                // Default fallback if no cover info is provided, or assume third_party to satisfy NOT NULL
                coverType = "third_party"; 
            }
        }
        cover.setCoverType(coverType);

        if ("third_party".equals(coverType)) {
            cover.setCoverUrlJpeg(dto.getCoverUrl()); // Assuming URL is primary
        } else {
            cover.setCoverUrlAvif(dto.getCoverUrlAvif());
            cover.setCoverUrlWebp(dto.getCoverUrlWebp());
            cover.setCoverUrlJpeg(dto.getCoverUrlJpeg());
        }
        coverImageMapper.insert(cover);
    }

    @Override
    public CourseDTO getCourseWithDetails(Long id) {
        Course course = getById(id);
        if (course == null) return null;

        CourseDTO dto = new CourseDTO();
        // Copy properties from course to dto
        BeanUtils.copyProperties(course, dto);
        
        // Populate compatibility field
        dto.setMediaUrl(course.getMediaUrl());

        // Fetch Source
        CourseSource source = courseSourceMapper.selectOne(new LambdaQueryWrapper<CourseSource>().eq(CourseSource::getCourseId, id));
        if (source != null) {
            dto.setSourceType(source.getSourceType());
            dto.setSourceName(source.getSourceName());
            dto.setSourceUrl(source.getSourceUrl());
            dto.setStorageProvider(source.getStorageProvider());
        }

        // Fetch Cover
        CoverImage cover = coverImageMapper.selectOne(new LambdaQueryWrapper<CoverImage>().eq(CoverImage::getCourseId, id));
        if (cover != null) {
            dto.setCoverType(cover.getCoverType());
            // If third_party, use coverUrlJpeg (which stores the URL)
            if ("third_party".equals(cover.getCoverType())) {
                 dto.setCoverUrl(cover.getCoverUrlJpeg());
            } else {
                 dto.setCoverUrlAvif(cover.getCoverUrlAvif());
                 dto.setCoverUrlWebp(cover.getCoverUrlWebp());
                 dto.setCoverUrlJpeg(cover.getCoverUrlJpeg());
            }
        }
        
        return dto;
    }
}
