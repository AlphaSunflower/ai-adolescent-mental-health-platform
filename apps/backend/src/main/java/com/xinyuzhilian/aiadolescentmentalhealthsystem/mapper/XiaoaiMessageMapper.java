package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.XiaoaiMessage;
import org.apache.ibatis.annotations.Mapper;

/**
 * 小爱倾听 - 对话消息记录 Mapper
 */
@Mapper
public interface XiaoaiMessageMapper extends BaseMapper<XiaoaiMessage> {
}
