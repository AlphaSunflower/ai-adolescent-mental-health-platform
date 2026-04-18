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
@TableName("article")
@ApiModel(value="Article对象", description="心理文章")
public class Article implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "文章标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "文章内容(富文�?")
    @TableField("content")
    private String content;

    @ApiModelProperty(value = "封面图URL")
    @TableField("cover_url")
    private String coverUrl;

    @ApiModelProperty(value = "类型(SCIENCE-科普, CASE-案例)")
    @TableField("type")
    private String type;

    @ApiModelProperty(value = "类型名称(科普, 案例) - 用于前端显示和筛选")
    @TableField(exist = false)
    private String tagName;

    @ApiModelProperty(value = "状�?0-草稿, 1-已发�?")
    @TableField("status")
    private Integer status;

    @ApiModelProperty(value = "作者ID")
    @TableField("author_id")
    private Long authorId;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;

    @ApiModelProperty(value = "点赞数")
    @TableField("like_count")
    private Integer like_count;

    @ApiModelProperty(value = "踩数")
    @TableField("dislike_count")
    private Integer dislike_count;

    @ApiModelProperty(value = "收藏数")
    @TableField("collection_count")
    private Integer collection_count;

    @ApiModelProperty(value = "评论数")
    @TableField("comment_count")
    private Integer comment_count;

    @ApiModelProperty(value = "阅读数")
    @TableField("view_count")
    private Integer view_count;
}
