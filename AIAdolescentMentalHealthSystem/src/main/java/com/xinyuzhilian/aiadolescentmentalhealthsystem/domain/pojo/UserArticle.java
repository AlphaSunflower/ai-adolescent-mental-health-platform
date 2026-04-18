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
@TableName("user_article")
@ApiModel(value = "UserArticle对象", description = "用户文章")
public class UserArticle implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "用户ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "文章标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "文章内容")
    @TableField("content")
    private String content;

    @ApiModelProperty(value = "封面图URL")
    @TableField("cover_url")
    private String coverUrl;

    @ApiModelProperty(value = "标签ID")
    @TableField("tag_id")
    private Long tagId;

    @ApiModelProperty(value = "状态(0-待审核,1-已发布,2-已下架)")
    @TableField("status")
    private Integer status;

    @ApiModelProperty(value = "拒绝/下架原因")
    @TableField("reject_reason")
    private String rejectReason;

    @ApiModelProperty(value = "点赞数")
    @TableField("like_count")
    private Integer likeCount;

    @ApiModelProperty(value = "踩数")
    @TableField("dislike_count")
    private Integer dislikeCount;

    @ApiModelProperty(value = "收藏数")
    @TableField("collection_count")
    private Integer collectionCount;

    @ApiModelProperty(value = "评论数")
    @TableField("comment_count")
    private Integer commentCount;

    @ApiModelProperty(value = "阅读数")
    @TableField("view_count")
    private Integer viewCount;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;
}
