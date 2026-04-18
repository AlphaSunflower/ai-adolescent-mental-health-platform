package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ConsultationField;
import org.apache.ibatis.annotations.Mapper;

/**
 * 咨询领域类型Mapper
 * 继承MyBatis-Plus的BaseMapper，提供基本的CRUD操作
 */
@Mapper
public interface ConsultationFieldMapper extends BaseMapper<ConsultationField> {
}
