package com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleCommentVO {
    private Long id;
    private Long articleId;
    private Long userId;
    private String nickname;
    private String headPath;
    private Long parentId;
    private Long replyToUserId;
    private String replyToNickname;
    private String content;
    private Integer likeCount;
    private boolean isLiked;
    private LocalDateTime createTime;
    private List<ArticleCommentVO> replies;
}
