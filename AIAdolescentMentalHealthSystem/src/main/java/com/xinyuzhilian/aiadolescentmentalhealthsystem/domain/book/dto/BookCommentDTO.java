package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel(value = "BookCommentDTO", description = "书籍评论数据传输对象")
public class BookCommentDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "书籍ID", required = true)
    private Long bookId;

    @ApiModelProperty(value = "评论内容", required = true)
    private String content;
}
