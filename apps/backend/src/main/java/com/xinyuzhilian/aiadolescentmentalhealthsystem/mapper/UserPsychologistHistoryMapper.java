package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserPsychologistHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户-心理咨询师咨询记录Mapper
 * 继承MyBatis-Plus的BaseMapper，提供基本的CRUD操作
 */
@Mapper
public interface UserPsychologistHistoryMapper extends BaseMapper<UserPsychologistHistory> {
}
