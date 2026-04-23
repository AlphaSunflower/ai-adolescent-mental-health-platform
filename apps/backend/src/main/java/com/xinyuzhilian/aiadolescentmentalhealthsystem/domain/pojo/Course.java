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

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("course")
@ApiModel(value="Course对象", description="心理课程表")
public class Course implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "课程标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "课程简介")
    @TableField("description")
    private String description;

    @ApiModelProperty(value = "媒体资源URL")
    @TableField("media_url")
    private String mediaUrl;

    @ApiModelProperty(value = "来源名称")
    @TableField(exist = false)
    private String sourceName;

    @ApiModelProperty(value = "封面图URL")
    @TableField("cover_url")
    private String coverUrl;

    @ApiModelProperty(value = "类型(VIDEO-视频, AUDIO-音频)")
    @TableField("type")
    private String type;

    @ApiModelProperty(value = "状态(0-下架, 1-上架)")
    @TableField("status")
    private Integer status;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;
}