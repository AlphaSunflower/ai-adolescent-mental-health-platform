package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.SysMessage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;

public interface ISysMessageService extends IService<SysMessage> {
    SysMessage sendMessage(Long userId, String title, String content, Integer type);

    void sendFollowNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar);

    void sendArticleLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long articleId, String articleTitle);

    void sendArticleLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long articleId, String articleTitle, int articleType, Long articleAuthorId);

    void sendCommentLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle);

    void sendCommentLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle, int articleType, Long articleAuthorId);

    void sendCommentReplyNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle, Long replyToUserId, String replyToNickname);

    void sendCommentReplyNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle, Long replyToUserId, String replyToNickname, int articleType, Long articleAuthorId);

    PageResult<SysMessage> getMessages(Long userId, Integer page, Integer size);

    boolean markAsRead(Long messageId, Long userId);

    boolean markAllAsRead(Long userId);

    Integer getUnreadCount(Long userId);
}
