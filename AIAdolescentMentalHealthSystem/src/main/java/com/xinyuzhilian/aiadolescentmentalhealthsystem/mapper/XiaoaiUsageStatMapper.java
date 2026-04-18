package com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.XiaoaiUsageStat;
import org.apache.ibatis.annotations.Mapper;

/**
 * 小爱倾听 - 每日使用时长统计 Mapper
 */
@Mapper
public interface XiaoaiUsageStatMapper extends BaseMapper<XiaoaiUsageStat> {
}
