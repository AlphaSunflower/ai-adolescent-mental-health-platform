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
@TableName("book")
@ApiModel(value="Book对象", description="书籍")
public class Book implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "书籍标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "封面图片URL")
    @TableField("cover_url")
    private String coverUrl;

    @ApiModelProperty(value = "书籍简介")
    @TableField("description")
    private String description;

    @ApiModelProperty(value = "跳转地址")
    @TableField("address")
    private String address;

    @ApiModelProperty(value = "浏览数")
    @TableField("view_count")
    private Integer viewCount;

    @ApiModelProperty(value = "评论数")
    @TableField("comment_count")
    private Integer commentCount;

    @ApiModelProperty(value = "排序权重")
    @TableField("sort_order")
    private Integer sortOrder;

    @ApiModelProperty(value = "状态 0下架 1上架")
    @TableField("status")
    private Integer status;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;

    @ApiModelProperty(value = "逻辑删除标记")
    @TableField("deleted")
    private Boolean deleted;
}
