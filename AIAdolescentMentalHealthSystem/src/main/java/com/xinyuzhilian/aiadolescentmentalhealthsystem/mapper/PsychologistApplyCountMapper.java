package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistApplyCount;
import org.apache.ibatis.annotations.Mapper;

/**
 * 心理咨询师申请次数记录Mapper
 */
@Mapper
public interface PsychologistApplyCountMapper extends BaseMapper<PsychologistApplyCount> {
}
