package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.xiaoai.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 小爱倾听消息 DTO
 */
@Data
public class XiaoaiMessageDTO {
    /**
     * 消息ID
     */
    private Long id;

    /**
     * 会话ID
     */
    private Long sessionId;

    /**
     * 角色：user/assistant
     */
    private String role;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
