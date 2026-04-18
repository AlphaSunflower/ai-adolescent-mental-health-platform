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
 * 心理咨询师-资质关联表
 * 存储心理师拥有的资质及其证书
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_qualification_relation")
@ApiModel(value = "PsychologistQualificationRelation对象", description = "心理咨询师-资质关联表")
public class PsychologistQualificationRelation implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "资质ID")
    @TableField("qualification_id")
    private Integer qualificationId;

    @ApiModelProperty(value = "证书图片URL")
    @TableField("certificate_url")
    private String certificateUrl;

    @ApiModelProperty(value = "是否已认证（0-未认证，1-已认证）")
    @TableField("is_verified")
    private Integer isVerified;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    // ========== 状态常量 ==========

    /** 未认证 */
    public static final int NOT_VERIFIED = 0;
    /** 已认证 */
    public static final int VERIFIED = 1;
}
