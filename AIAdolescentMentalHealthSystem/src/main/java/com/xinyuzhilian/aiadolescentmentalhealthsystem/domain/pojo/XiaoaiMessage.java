package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 小爱倾听 - 对话消息记录表
 * 对应数据库表: ai_xiaoai_message
 */
@Data
@TableName("ai_xiaoai_message")
public class XiaoaiMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 会话ID (ai_xiaoai_session.id)
     */
    private Long sessionId;

    /**
     * 角色: user/assistant
     */
    private String role;

    /**
     * 文本内容
     */
    private String content;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
