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
 * 咨询领域类型表（字典表）
 * 存储咨询领域，如：情感婚恋、职场压力、学业困扰等
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("consultation_field")
@ApiModel(value = "ConsultationField对象", description = "咨询领域类型表")
public class ConsultationField implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "领域名称")
    private String name;

    @ApiModelProperty(value = "领域代码")
    private String code;

    @ApiModelProperty(value = "图标")
    private String icon;

    @ApiModelProperty(value = "描述")
    private String description;

    @ApiModelProperty(value = "状态（0-禁用，1-启用）")
    private Integer status;

    @ApiModelProperty(value = "排序")
    @TableField("sort_order")
    private Integer sortOrder;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;

    // ========== 领域代码常量 ==========

    /** 情感婚恋 */
    public static final String CODE_EMOTIONAL = "EMOTIONAL";
    /** 职场压力 */
    public static final String CODE_WORKPLACE = "WORKPLACE";
    /** 学业困扰 */
    public static final String CODE_ACADEMIC = "ACADEMIC";
    /** 人际关系 */
    public static final String CODE_RELATIONSHIP = "RELATIONSHIP";
    /** 情绪管理 */
    public static final String CODE_EMOTION = "EMOTION";
    /** 青少年心理 */
    public static final String CODE_ADOLESCENT = "ADOLESCENT";
}
