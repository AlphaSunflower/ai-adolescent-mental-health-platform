package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistService;
import org.apache.ibatis.annotations.Mapper;

/**
 * 心理咨询师咨询方式与价格Mapper
 * 继承MyBatis-Plus的BaseMapper，提供基本的CRUD操作
 */
@Mapper
public interface PsychologistServiceMapper extends BaseMapper<PsychologistService> {
}
