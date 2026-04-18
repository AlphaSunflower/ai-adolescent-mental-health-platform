package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import io.swagger.annotations.ApiModel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName(value = "assessment_template", autoResultMap = true)
@ApiModel(value="AssessmentTemplate对象", description="测评量表模板")
public class AssessmentTemplate implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private String type; // TRADITIONAL, QUICK, DYNAMIC

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object questionsJson;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object scoringRulesJson;

    private Integer status;

    private Integer isPublic;

    private LocalDateTime createTime;
}