package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@ApiModel(value = "BookAdminVO", description = "管理员书籍视图对象")
public class BookAdminVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "书籍ID")
    private Long id;

    @ApiModelProperty(value = "书籍标题")
    private String title;

    @ApiModelProperty(value = "封面图片URL")
    private String coverUrl;

    @ApiModelProperty(value = "书籍简介")
    private String description;

    @ApiModelProperty(value = "跳转地址")
    private String address;

    @ApiModelProperty(value = "浏览数")
    private Integer viewCount;

    @ApiModelProperty(value = "评论数")
    private Integer commentCount;

    @ApiModelProperty(value = "排序权重")
    private Integer sortOrder;

    @ApiModelProperty(value = "状态 0下架 1上架")
    private Integer status;

    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    private LocalDateTime updateTime;
}
