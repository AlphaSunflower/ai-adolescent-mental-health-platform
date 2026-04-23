package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel(value = "BookDTO", description = "书籍数据传输对象")
public class BookDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "书籍ID（修改时必填）")
    private Long id;

    @ApiModelProperty(value = "书籍标题", required = true)
    private String title;

    @ApiModelProperty(value = "封面图片URL")
    private String coverUrl;

    @ApiModelProperty(value = "书籍简介")
    private String description;

    @ApiModelProperty(value = "跳转地址")
    private String address;

    @ApiModelProperty(value = "排序权重")
    private Integer sortOrder;

    @ApiModelProperty(value = "状态 0下架 1上架")
    private Integer status;
}
