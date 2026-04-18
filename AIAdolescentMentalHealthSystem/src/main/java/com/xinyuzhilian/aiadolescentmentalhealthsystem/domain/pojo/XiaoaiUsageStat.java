package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 小爱倾听 - 每日使用时长统计表
 * 对应数据库表: xiaoai_usage_stat
 */
@Data
@TableName("xiaoai_usage_stat")
public class XiaoaiUsageStat {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 今日已使用秒数
     */
    private Integer totalSeconds;

    /**
     * 最后使用日期（用于每日重置）
     */
    private LocalDate lastDate;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
