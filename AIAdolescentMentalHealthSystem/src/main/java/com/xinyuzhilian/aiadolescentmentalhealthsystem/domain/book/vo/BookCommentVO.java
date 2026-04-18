package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.book.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@ApiModel(value = "BookCommentVO", description = "书籍评论视图对象")
public class BookCommentVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "评论ID")
    private Long id;

    @ApiModelProperty(value = "书籍ID")
    private Long bookId;

    @ApiModelProperty(value = "用户ID")
    private Long userId;

    @ApiModelProperty(value = "用户昵称")
    private String userNickname;

    @ApiModelProperty(value = "用户头像")
    private String userAvatar;

    @ApiModelProperty(value = "评论内容")
    private String content;

    @ApiModelProperty(value = "评论时间")
    private LocalDateTime createTime;
}
