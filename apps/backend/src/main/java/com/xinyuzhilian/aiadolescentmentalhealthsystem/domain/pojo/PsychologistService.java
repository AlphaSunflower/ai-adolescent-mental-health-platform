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
 * 心理咨询师咨询方式与价格表
 * 存储心理师提供的服务方式及启用/禁用状态
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_service")
@ApiModel(value = "PsychologistService对象", description = "心理咨询师咨询方式与价格表")
public class PsychologistService implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "服务类型（VIDEO-视频，VOICE-语音，TEXT-文字，OFFLINE-线下）")
    @TableField("service_type")
    private String serviceType;

    @ApiModelProperty(value = "服务说明")
    private String description;

    @ApiModelProperty(value = "状态（0-关闭，1-开启）")
    private Integer status;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    @TableField("update_time")
    private LocalDateTime updateTime;

    // ========== 服务类型常量 ==========

    /** 视频咨询 */
    public static final String TYPE_VIDEO = "VIDEO";
    /** 语音通话 */
    public static final String TYPE_VOICE = "VOICE";
    /** 文字聊天 */
    public static final String TYPE_TEXT = "TEXT";
    /** 线下咨询 */
    public static final String TYPE_OFFLINE = "OFFLINE";

    /** 状态：关闭 */
    public static final int STATUS_DISABLED = 0;
    /** 状态：开启 */
    public static final int STATUS_ENABLED = 1;
}
