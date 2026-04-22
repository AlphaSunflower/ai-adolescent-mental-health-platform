package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.PsychologistWithdraw;
import org.apache.ibatis.annotations.Mapper;

/**
 * 心理咨询师提现记录Mapper
 * 继承MyBatis-Plus的BaseMapper，提供基本的CRUD操作
 */
@Mapper
public interface PsychologistWithdrawMapper extends BaseMapper<PsychologistWithdraw> {
}
