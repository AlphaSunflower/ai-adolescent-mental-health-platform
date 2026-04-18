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
 * 心理咨询师资质类型表（字典表）
 * 存储资质类型，如：国家二级心理咨询师、临床心理学硕士等
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_qualification")
@ApiModel(value = "PsychologistQualification对象", description = "心理咨询师资质类型表")
public class PsychologistQualification implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "资质名称")
    private String name;

    @ApiModelProperty(value = "资质代码")
    private String code;

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

    // ========== 资质代码常量 ==========

    /** 国家二级心理咨询师 */
    public static final String CODE_NATIONAL_LEVEL2 = "NATIONAL_LEVEL2";
    /** 国家三级心理咨询师 */
    public static final String CODE_NATIONAL_LEVEL3 = "NATIONAL_LEVEL3";
    /** 临床心理学硕士 */
    public static final String CODE_CLINICAL_MASTER = "CLINICAL_MASTER";
    /** 心理学博士 */
    public static final String CODE_PSYCHOLOGY_PHD = "PSYCHOLOGY_PHD";
    /** 注册心理师 */
    public static final String CODE_REGISTERED = "REGISTERED";
    /** 实习咨询师 */
    public static final String CODE_INTERN = "INTERN";
}
