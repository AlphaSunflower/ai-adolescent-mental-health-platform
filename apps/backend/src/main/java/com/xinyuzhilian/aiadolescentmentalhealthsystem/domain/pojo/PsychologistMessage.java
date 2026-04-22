package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 心理咨询聊天消息表
 * 存储用户与心理师之间的聊天消息
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_message")
@ApiModel(value = "PsychologistMessage对象", description = "心理咨询聊天消息表")
public class PsychologistMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "预约ID")
    @TableField("appointment_id")
    private Long appointmentId;

    @ApiModelProperty(value = "发送者ID")
    @TableField("sender_id")
    private Long senderId;

    @ApiModelProperty(value = "接收者ID")
    @TableField("receiver_id")
    private Long receiverId;

    @ApiModelProperty(value = "消息内容")
    private String content;

    @ApiModelProperty(value = "消息类型（0-文本，1-图片，2-系统消息）")
    @TableField("content_type")
    private Integer contentType;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    // ========== 消息类型常量 ==========

    /** 文本消息 */
    public static final int TYPE_TEXT = 0;
    /** 图片消息 */
    public static final int TYPE_IMAGE = 1;
    /** 系统消息 */
    public static final int TYPE_SYSTEM = 2;
}
