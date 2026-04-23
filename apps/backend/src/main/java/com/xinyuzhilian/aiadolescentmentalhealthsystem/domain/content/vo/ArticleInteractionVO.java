package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import lombok.Data;

@Data
public class ArticleInteractionVO {
    private Long articleId;
    private Long authorId;
    private String articleTitle;
    private String authorNickname;
    private String coverUrl;
    private String createTime;
    private String source = "user"; // 标记来源：user表示用户文章，admin表示管理员文章
    private Integer authorRole; // 作者角色
}
