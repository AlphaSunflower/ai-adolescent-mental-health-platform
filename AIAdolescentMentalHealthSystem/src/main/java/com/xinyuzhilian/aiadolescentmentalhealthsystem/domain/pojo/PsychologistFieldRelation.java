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
 * 心理咨询师-擅长领域关联表
 * 存储心理师擅长的咨询领域及细分标签
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("psychologist_field_relation")
@ApiModel(value = "PsychologistFieldRelation对象", description = "心理咨询师-擅长领域关联表")
public class PsychologistFieldRelation implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "心理咨询师ID")
    @TableField("psychologist_id")
    private Long psychologistId;

    @ApiModelProperty(value = "领域ID")
    @TableField("field_id")
    private Integer fieldId;

    @ApiModelProperty(value = "细分标签（JSON数组）")
    @TableField("sub_tags")
    private String subTags;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private LocalDateTime createTime;
}
