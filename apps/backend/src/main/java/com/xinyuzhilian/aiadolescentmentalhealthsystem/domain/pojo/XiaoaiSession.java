package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 小爱倾听 - 会话记录表
 * 对应数据库表: ai_xiaoai_session
 */
@Data
@TableName("ai_xiaoai_session")
public class XiaoaiSession {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 会话开始时间
     */
    private LocalDateTime startTime;

    /**
     * 会话结束时间
     */
    private LocalDateTime endTime;

    /**
     * 本次会话总时长（秒）
     */
    private Integer totalSeconds;

    /**
     * 结束原因: timeout/manual/error/expired
     */
    private String endReason;

    /**
     * 状态: 1-进行中, 0-已结束
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
