package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IArticleAuditService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserStatsService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISysMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ArticleAuditServiceImpl extends ServiceImpl<ArticleAuditLogMapper, ArticleAuditLog> implements IArticleAuditService {

    private final UserArticleMapper userArticleMapper;
    private final ArticleMapper articleMapper;
    private final ArticleTagMapper tagMapper;
    private final UserMapper userMapper;
    private final ISysMessageService sysMessageService;
    private final IUserStatsService userStatsService;

    @Override
    public PageResult<UserArticleVO> getPendingArticles(Integer page, Integer size) {
        Page<UserArticle> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<UserArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getStatus, 0).orderByAsc(UserArticle::getCreateTime);
        Page<UserArticle> result = userArticleMapper.selectPage(pageParam, wrapper);
        
        PageResult<UserArticleVO> pageResult = new PageResult<>();
        pageResult.setTotal(result.getTotal());
        pageResult.setRecords(result.getRecords().stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList()));
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    @Transactional
    public boolean auditArticle(Long articleId, Integer action, String reason, Long auditorId) {
        UserArticle article = userArticleMapper.selectById(articleId);
        if (article == null) {
            throw new RuntimeException("文章不存在");
        }
        
        article.setUpdateTime(LocalDateTime.now());
        
        if (action == 1) {
            article.setStatus(1);
            article.setRejectReason(null);
            userStatsService.incrementArticleCount(article.getUserId());
            sysMessageService.sendMessage(
                    article.getUserId(),
                    "文章审核通过",
                    "您发布的文章《" + article.getTitle() + "》已审核通过，恭喜发布成功！",
                    2
            );
        } else if (action == 2) {
            article.setStatus(2);
            article.setRejectReason(reason);
            sysMessageService.sendMessage(
                    article.getUserId(),
                    "文章审核未通过",
                    "您发布的文章《" + article.getTitle() + "》未通过审核，原因：" + reason,
                    2
            );
        }
        
        userArticleMapper.updateById(article);
        
        ArticleAuditLog log = new ArticleAuditLog();
        log.setArticleId(articleId);
        log.setArticleType(2);
        log.setUserId(article.getUserId());
        log.setAuditorId(auditorId);
        log.setAction(action);
        log.setReason(reason);
        log.setCreateTime(LocalDateTime.now());
        this.save(log);
        
        return true;
    }

    @Override
    @Transactional
    public boolean offlineArticle(Long articleId, String reason, Long auditorId) {
        UserArticle article = userArticleMapper.selectById(articleId);
        if (article == null) {
            article = userArticleMapper.selectById(articleId);
            if (article == null) {
                throw new RuntimeException("文章不存在");
            }
        }
        
        article.setStatus(2);
        article.setRejectReason(reason);
        article.setUpdateTime(LocalDateTime.now());
        userArticleMapper.updateById(article);
        
        String authorName = "系统";
        User author = userMapper.selectById(article.getUserId());
        if (author != null) {
            authorName = author.getNickname();
        }
        
        sysMessageService.sendMessage(
                article.getUserId(),
                "文章已被下架",
                "您发布的文章《" + article.getTitle() + "》已被管理员下架，原因：" + reason,
                3
        );
        
        ArticleAuditLog log = new ArticleAuditLog();
        log.setArticleId(articleId);
        log.setArticleType(2);
        log.setUserId(article.getUserId());
        log.setAuditorId(auditorId);
        log.setAction(3);
        log.setReason(reason);
        log.setCreateTime(LocalDateTime.now());
        this.save(log);
        
        return true;
    }


    @Transactional
    public boolean recoverArticle(Long articleId, Long auditorId) {
        UserArticle article = userArticleMapper.selectById(articleId);
        if (article == null) {
            throw new RuntimeException("文章不存在");
        }
        
        if (article.getStatus() != 2) {
            throw new RuntimeException("只能恢复已下架的文章");
        }
        
        article.setStatus(1);
        article.setRejectReason(null);
        article.setUpdateTime(LocalDateTime.now());
        userArticleMapper.updateById(article);
        
        sysMessageService.sendMessage(
                article.getUserId(),
                "文章已恢复上架",
                "您发布的文章《" + article.getTitle() + "》已被管理员恢复上架，感谢您的支持！",
                2
        );
        
        ArticleAuditLog log = new ArticleAuditLog();
        log.setArticleId(articleId);
        log.setArticleType(2);
        log.setUserId(article.getUserId());
        log.setAuditorId(auditorId);
        log.setAction(4);
        log.setReason("管理员恢复上架");
        log.setCreateTime(LocalDateTime.now());
        this.save(log);
        
        return true;
    }

    private UserArticleVO convertToVO(UserArticle article) {
        UserArticleVO vo = new UserArticleVO();
        vo.setId(article.getId());
        vo.setUserId(article.getUserId());
        vo.setTitle(article.getTitle());
        vo.setContent(article.getContent());
        vo.setCoverUrl(article.getCoverUrl());
        vo.setTagId(article.getTagId());
        vo.setStatus(article.getStatus());
        vo.setRejectReason(article.getRejectReason());
        vo.setLikeCount(article.getLikeCount());
        vo.setDislikeCount(article.getDislikeCount());
        vo.setCollectionCount(article.getCollectionCount());
        vo.setCommentCount(article.getCommentCount());
        vo.setViewCount(article.getViewCount());
        vo.setCreateTime(article.getCreateTime() != null ? article.getCreateTime().toString() : null);
        
        if (article.getTagId() != null) {
            ArticleTag tag = tagMapper.selectById(article.getTagId());
            if (tag != null) {
                vo.setTagName(tag.getName());
            }
        }
        
        if (article.getUserId() != null) {
            User user = userMapper.selectById(article.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getHeadPath());
            }
        }
        
        return vo;
    }
}
