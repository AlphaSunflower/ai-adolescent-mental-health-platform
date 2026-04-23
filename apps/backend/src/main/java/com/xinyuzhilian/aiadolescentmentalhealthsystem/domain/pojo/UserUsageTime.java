package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户使用时长记录
 */
@Data
@TableName("user_usage_time")
public class UserUsageTime {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Integer usedSeconds;

    private LocalDate lastResetDate;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
