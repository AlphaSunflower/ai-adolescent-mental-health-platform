package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.SysMessage;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.SysMessageMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISysMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SysMessageServiceImpl extends ServiceImpl<SysMessageMapper, SysMessage> implements ISysMessageService {

    // 通知类型常量
    public static final int SOURCE_TYPE_SYSTEM = 0;
    public static final int SOURCE_TYPE_FOLLOW = 1;
    public static final int SOURCE_TYPE_ARTICLE_LIKE = 2;
    public static final int SOURCE_TYPE_COMMENT_LIKE = 3;
    public static final int SOURCE_TYPE_COMMENT_REPLY = 4;

    // 文章类型常量
    public static final int ARTICLE_TYPE_OFFICIAL = 0;
    public static final int ARTICLE_TYPE_USER = 1;

    @Override
    public SysMessage sendMessage(Long userId, String title, String content, Integer type) {
        SysMessage message = new SysMessage();
        message.setUserId(userId);
        message.setTitle(title);
        message.setContent(content);
        message.setType(type);
        message.setSourceType(SOURCE_TYPE_SYSTEM);
        message.setIsRead(0);
        message.setCreateTime(LocalDateTime.now());
        this.save(message);
        return message;
    }

    @Override
    public void sendFollowNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar) {
        SysMessage message = new SysMessage();
        message.setUserId(targetUserId);
        message.setTitle("新增关注");
        message.setContent(fromNickname + " 关注了你");
        message.setType(1);
        message.setSourceType(SOURCE_TYPE_FOLLOW);
        message.setSourceId(fromUserId);
        message.setFromUserId(fromUserId);
        message.setFromUserNickname(fromNickname);
        message.setFromUserAvatar(fromAvatar);
        message.setIsRead(0);
        message.setCreateTime(LocalDateTime.now());
        this.save(message);
    }

    @Override
    public void sendArticleLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long articleId, String articleTitle) {
        sendArticleLikeNotification(targetUserId, fromUserId, fromNickname, fromAvatar, articleId, articleTitle, ARTICLE_TYPE_OFFICIAL, null);
    }

    @Override
    public void sendArticleLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long articleId, String articleTitle, int articleType, Long articleAuthorId) {
        SysMessage message = new SysMessage();
        message.setUserId(targetUserId);
        message.setTitle("文章被点赞");
        message.setContent(fromNickname + " 点赞了你的文章《" + articleTitle + "》");
        message.setType(1);
        message.setSourceType(SOURCE_TYPE_ARTICLE_LIKE);
        message.setSourceId(articleId);
        message.setExtraType(articleType);
        message.setArticleAuthorId(articleAuthorId);
        message.setFromUserId(fromUserId);
        message.setFromUserNickname(fromNickname);
        message.setFromUserAvatar(fromAvatar);
        message.setIsRead(0);
        message.setCreateTime(LocalDateTime.now());
        this.save(message);
    }

    public void sendCommentLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle) {
        sendCommentLikeNotification(targetUserId, fromUserId, fromNickname, fromAvatar, commentId, articleId, articleTitle, ARTICLE_TYPE_OFFICIAL, null);
    }

    public void sendCommentLikeNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle, int articleType, Long articleAuthorId) {
        SysMessage message = new SysMessage();
        message.setUserId(targetUserId);
        message.setTitle("评论被点赞");
        message.setContent(fromNickname + " 点赞了你的评论");
        message.setType(1);
        message.setSourceType(SOURCE_TYPE_COMMENT_LIKE);
        message.setSourceId(articleId);
        message.setExtraType(articleType);
        message.setArticleAuthorId(articleAuthorId);
        message.setFromUserId(fromUserId);
        message.setFromUserNickname(fromNickname);
        message.setFromUserAvatar(fromAvatar);
        message.setIsRead(0);
        message.setCreateTime(LocalDateTime.now());
        this.save(message);
    }

    public void sendCommentReplyNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle, Long replyToUserId, String replyToNickname) {
        sendCommentReplyNotification(targetUserId, fromUserId, fromNickname, fromAvatar, commentId, articleId, articleTitle, replyToUserId, replyToNickname, ARTICLE_TYPE_OFFICIAL, null);
    }

    public void sendCommentReplyNotification(Long targetUserId, Long fromUserId, String fromNickname, String fromAvatar, Long commentId, Long articleId, String articleTitle, Long replyToUserId, String replyToNickname, int articleType, Long articleAuthorId) {
        String content;
        if (replyToUserId != null && replyToUserId.equals(targetUserId)) {
            content = fromNickname + " 回复了你的评论";
        } else {
            content = fromNickname + " 回复了你在《" + articleTitle + "》中的评论";
        }

        SysMessage message = new SysMessage();
        message.setUserId(targetUserId);
        message.setTitle("收到回复");
        message.setContent(content);
        message.setType(1);
        message.setSourceType(SOURCE_TYPE_COMMENT_REPLY);
        message.setSourceId(articleId);
        message.setExtraType(articleType);
        message.setArticleAuthorId(articleAuthorId);
        message.setFromUserId(fromUserId);
        message.setFromUserNickname(fromNickname);
        message.setFromUserAvatar(fromAvatar);
        message.setIsRead(0);
        message.setCreateTime(LocalDateTime.now());
        this.save(message);
    }

    @Override
    public PageResult<SysMessage> getMessages(Long userId, Integer page, Integer size) {
        Page<SysMessage> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SysMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMessage::getUserId, userId).orderByDesc(SysMessage::getCreateTime);
        Page<SysMessage> result = this.page(pageParam, wrapper);
        return PageResult.build(result);
    }

    @Override
    @Transactional
    public boolean markAsRead(Long messageId, Long userId) {
        SysMessage message = this.getById(messageId);
        if (message == null || !message.getUserId().equals(userId)) {
            return false;
        }
        message.setIsRead(1);
        this.updateById(message);
        return true;
    }

    @Override
    @Transactional
    public boolean markAllAsRead(Long userId) {
        LambdaQueryWrapper<SysMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMessage::getUserId, userId).eq(SysMessage::getIsRead, 0);

        SysMessage update = new SysMessage();
        update.setIsRead(1);
        return this.update(update, wrapper);
    }

    @Override
    public Integer getUnreadCount(Long userId) {
        LambdaQueryWrapper<SysMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMessage::getUserId, userId).eq(SysMessage::getIsRead, 0);
        return (int) this.count(wrapper);
    }
}
