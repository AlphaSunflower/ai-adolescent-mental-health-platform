package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Psychologist;
import org.apache.ibatis.annotations.Mapper;

/**
 * 心理咨询师基础信息Mapper
 * 继承MyBatis-Plus的BaseMapper，提供基本的CRUD操作
 */
@Mapper
public interface PsychologistMapper extends BaseMapper<Psychologist> {
}
