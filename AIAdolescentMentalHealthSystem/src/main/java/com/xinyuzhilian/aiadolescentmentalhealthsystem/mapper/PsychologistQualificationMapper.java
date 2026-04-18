package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistQualification;
import org.apache.ibatis.annotations.Mapper;

/**
 * 心理咨询师资质类型Mapper
 * 继承MyBatis-Plus的BaseMapper，提供基本的CRUD操作
 */
@Mapper
public interface PsychologistQualificationMapper extends BaseMapper<PsychologistQualification> {
}
