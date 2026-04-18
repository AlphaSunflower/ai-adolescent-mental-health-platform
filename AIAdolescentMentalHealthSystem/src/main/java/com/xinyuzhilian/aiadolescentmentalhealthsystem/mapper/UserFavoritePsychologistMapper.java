package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserFavoritePsychologist;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户收藏心理咨询师Mapper
 * 继承MyBatis-Plus的BaseMapper，提供基本的CRUD操作
 */
@Mapper
public interface UserFavoritePsychologistMapper extends BaseMapper<UserFavoritePsychologist> {
}
