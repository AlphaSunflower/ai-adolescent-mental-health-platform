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
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 心理咨询师评价表
 * 存储用户对心理师的评价
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_rating")
@ApiModel(value = "PsychologistRating对象", description = "心理咨询师评价表")
public class PsychologistRating implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "预约ID")
    @TableField("appointment_id")
    private Long appointmentId;

    @ApiModelProperty(value = "用户ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "评分（1-5）")
    @TableField("rating_score")
    private BigDecimal ratingScore;

    @ApiModelProperty(value = "评价内容")
    @TableField("rating_content")
    private String ratingContent;

    @ApiModelProperty(value = "是否匿名（0-否，1-是）")
    @TableField("is_anonymous")
    private Integer isAnonymous;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    // ========== 状态常量 ==========

    /** 非匿名 */
    public static final int NOT_ANONYMOUS = 0;
    /** 匿名 */
    public static final int ANONYMOUS = 1;
}
