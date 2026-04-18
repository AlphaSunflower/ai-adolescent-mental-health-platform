package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.EmailVerifyCode;
import org.apache.ibatis.annotations.Mapper;

/**
 * 邮箱验证码 Mapper
 * 继承 MyBatis-Plus BaseMapper，自动获得 CRUD 方法
 */
@Mapper
public interface EmailVerifyCodeMapper extends BaseMapper<EmailVerifyCode> {
}
