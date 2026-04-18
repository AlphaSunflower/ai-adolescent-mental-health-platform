package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户会员信息
 */
@Data
@TableName("user_membership")
public class UserMembership {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Integer memberType;

    private LocalDateTime memberExpireTime;

    private Integer dailyLimitSeconds;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
