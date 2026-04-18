package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserArticleService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserStatsService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.ISysMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserArticleServiceImpl extends ServiceImpl<UserArticleMapper, UserArticle> implements IUserArticleService {

    private final ArticleTagMapper tagMapper;
    private final UserMapper userMapper;
    private final ArticleAuditLogMapper auditLogMapper;
    private final IUserStatsService userStatsService;
    private final ArticleInteractionMapper interactionMapper;
    private final UserArticleCommentMapper userArticleCommentMapper;
    private final UserArticleCommentLikeMapper userArticleCommentLikeMapper;
    private final CourseMapper courseMapper;
    private final AssessmentTemplateMapper assessmentMapper;
    private final ISysMessageService sysMessageService;

    @Override
    @Transactional
    public UserArticle publishArticle(UserArticle article, Long userId) {
        article.setUserId(userId);
        article.setStatus(0);
        article.setCreateTime(LocalDateTime.now());
        article.setUpdateTime(LocalDateTime.now());
        article.setLikeCount(0);
        article.setDislikeCount(0);
        article.setCollectionCount(0);
        article.setCommentCount(0);
        article.setViewCount(0);
        this.save(article);
        
        // 记录审核日志
        ArticleAuditLog log = new ArticleAuditLog();
        log.setArticleId(article.getId());
        log.setArticleType(2);
        log.setUserId(userId);
        log.setAction(0);
        log.setCreateTime(LocalDateTime.now());
        auditLogMapper.insert(log);
        
        return article;
    }

    @Override
    public PageResult<UserArticleVO> getMyArticles(Long userId, Integer page, Integer size) {
        Page<UserArticle> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<UserArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getUserId, userId).orderByDesc(UserArticle::getCreateTime);
        Page<UserArticle> result = this.page(pageParam, wrapper);
        
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
    public UserArticle updateArticle(UserArticle article, Long userId) {
        UserArticle existing = this.getById(article.getId());
        if (existing == null) {
            throw new RuntimeException("文章不存在");
        }
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改他人文章");
        }
        article.setUpdateTime(LocalDateTime.now());
        this.updateById(article);
        return article;
    }

    @Override
    @Transactional
    public boolean deleteArticle(Long id, Long userId) {
        UserArticle existing = this.getById(id);
        if (existing == null) {
            return false;
        }
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除他人文章");
        }
        userStatsService.decrementArticleCount(userId);
        return this.removeById(id);
    }

    @Override
    @Transactional
    public boolean withdrawArticle(Long id, Long userId) {
        UserArticle existing = this.getById(id);
        if (existing == null) {
            return false;
        }
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("无权撤回他人文章");
        }
        if (existing.getStatus() != 0) {
            throw new RuntimeException("只能撤回待审核的文章");
        }
        existing.setStatus(2);
        existing.setRejectReason("用户撤回");
        existing.setUpdateTime(LocalDateTime.now());
        this.updateById(existing);
        return true;
    }

    @Override
    public UserArticleVO getArticleDetail(Long id, Long userId) {
        UserArticle article = this.getById(id);
        if (article == null) {
            return null;
        }
        return convertToVO(article);
    }

    @Override
    public PageResult<UserArticleVO> getArticlesByTag(Long tagId, Integer page, Integer size) {
        Page<UserArticle> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<UserArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getTagId, tagId).eq(UserArticle::getStatus, 1).orderByDesc(UserArticle::getCreateTime);
        Page<UserArticle> result = this.page(pageParam, wrapper);
        
        PageResult<UserArticleVO> pageResult = new PageResult<>();
        pageResult.setTotal(result.getTotal());
        pageResult.setRecords(result.getRecords().stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList()));
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    public PageResult<UserArticleVO> getAllPublishedArticles(Integer page, Integer size, Long tagId) {
        Page<UserArticle> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<UserArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getStatus, 1);
        if (tagId != null) {
            wrapper.eq(UserArticle::getTagId, tagId);
        }
        wrapper.orderByDesc(UserArticle::getCreateTime);
        Page<UserArticle> result = this.page(pageParam, wrapper);
        
        PageResult<UserArticleVO> pageResult = new PageResult<>();
        pageResult.setTotal(result.getTotal());
        pageResult.setRecords(result.getRecords().stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList()));
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setPages(result.getPages());
        return pageResult;
    }

    @Override
    public UserArticleVO getArticleDetailByUserAndId(Long userId, Long articleId, Long currentUserId) {
        LambdaQueryWrapper<UserArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getUserId, userId)
               .eq(UserArticle::getId, articleId)
               .eq(UserArticle::getStatus, 1); // 只返回已发布的文章
        UserArticle article = this.getOne(wrapper);
        if (article == null) {
            return null;
        }
        UserArticleVO vo = convertToVO(article, currentUserId);
        
        // 添加推荐内容
        vo.setRecommendedArticles(getRecommendedArticles(articleId));
        vo.setRecommendedCourses(getRecommendedCourses());
        vo.setRecommendedAssessments(getRecommendedAssessments());
        
        return vo;
    }
    
    // 获取推荐文章（随机获取用户文章，排除当前文章）
    private List<UserArticleVO> getRecommendedArticles(Long excludeArticleId) {
        LambdaQueryWrapper<UserArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getStatus, 1)
               .ne(excludeArticleId != null, UserArticle::getId, excludeArticleId)
               .last("ORDER BY RAND() LIMIT 3");
        List<UserArticle> articles = this.list(wrapper);
        return articles.stream().map(a -> convertToVO(a, null)).collect(Collectors.toList());
    }
    
    // 获取推荐课程
    private List<Course> getRecommendedCourses() {
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Course::getStatus, 1)
               .last("ORDER BY RAND() LIMIT 3");
        return courseMapper.selectList(wrapper);
    }
    
    // 获取推荐测评
    private List<AssessmentTemplate> getRecommendedAssessments() {
        LambdaQueryWrapper<AssessmentTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AssessmentTemplate::getStatus, 1)
               .last("ORDER BY RAND() LIMIT 3");
        return assessmentMapper.selectList(wrapper);
    }

    @Override
    public Result<String> offlineArticle(Long articleId, Long auditorId, String reason) {
        UserArticle existing = this.getById(articleId);
        if (existing == null) {
            return Result.error("文章不存在");
        }
        existing.setStatus(2);
        existing.setRejectReason(reason != null ? reason : "管理员下架");
        existing.setUpdateTime(LocalDateTime.now());
        this.updateById(existing);

        // 记录审核日志
        ArticleAuditLog log = new ArticleAuditLog();
        log.setArticleId(articleId);
        log.setArticleType(2);
        log.setUserId(existing.getUserId());
        log.setAuditorId(auditorId);
        log.setAction(3);
        log.setReason(reason);
        log.setCreateTime(LocalDateTime.now());
        auditLogMapper.insert(log);

        return Result.success("下架成功");
    }

    @Override
    public Result<String> onlineArticle(Long articleId, Long auditorId) {
        UserArticle existing = this.getById(articleId);
        if (existing == null) {
            return Result.error("文章不存在");
        }
        if (existing.getStatus() == 1) {
            return Result.success("文章已经是发布状态");
        }
        existing.setStatus(1);
        existing.setRejectReason(null);
        existing.setUpdateTime(LocalDateTime.now());
        this.updateById(existing);

        // 记录审核日志
        ArticleAuditLog log = new ArticleAuditLog();
        log.setArticleId(articleId);
        log.setArticleType(2);
        log.setUserId(existing.getUserId());
        log.setAuditorId(auditorId);
        log.setAction(2);
        log.setCreateTime(LocalDateTime.now());
        auditLogMapper.insert(log);

        return Result.success("上架成功");
    }

    @Override
    public Result<String> interactArticle(Long articleId, Integer type, Long userId) {
        UserArticle article = this.getById(articleId);
        if (article == null) return Result.error("文章不存在");

        LambdaQueryWrapper<ArticleInteraction> wrapper = new LambdaQueryWrapper<ArticleInteraction>()
                .eq(ArticleInteraction::getArticleId, articleId)
                .eq(ArticleInteraction::getUserId, userId)
                .eq(ArticleInteraction::getType, type);
        ArticleInteraction existing = interactionMapper.selectOne(wrapper);
        if (existing != null) {
            interactionMapper.deleteById(existing.getId());
            updateCount(articleId, type, -1);
            return Result.success("取消成功");
        }
        if (type == 1) cancelInteraction(articleId, userId, 2);
        else if (type == 2) cancelInteraction(articleId, userId, 1);

        ArticleInteraction interaction = new ArticleInteraction();
        interaction.setArticleId(articleId);
        interaction.setUserId(userId);
        interaction.setType(type);
        interaction.setCreateTime(LocalDateTime.now());
        interactionMapper.insert(interaction);
        updateCount(articleId, type, 1);

        // 点赞时发送通知给文章作者
        if (type == 1 && article.getUserId() != null && !article.getUserId().equals(userId)) {
            User liker = userMapper.selectById(userId);
            if (liker != null) {
                sysMessageService.sendArticleLikeNotification(
                    article.getUserId(), userId, liker.getNickname(), liker.getHeadPath(),
                    articleId, article.getTitle(), 1, article.getUserId()
                );
            }
        }

        return Result.success("操作成功");
    }

    private void cancelInteraction(Long articleId, Long userId, Integer type) {
        LambdaQueryWrapper<ArticleInteraction> wrapper = new LambdaQueryWrapper<ArticleInteraction>()
                .eq(ArticleInteraction::getArticleId, articleId)
                .eq(ArticleInteraction::getUserId, userId)
                .eq(ArticleInteraction::getType, type);
        if (interactionMapper.delete(wrapper) > 0) {
            updateCount(articleId, type, -1);
        }
    }

    private void updateCount(Long articleId, Integer type, int delta) {
        UserArticle article = this.getById(articleId);
        if (article == null) return;
        if (type == 1) article.setLikeCount((article.getLikeCount() == null ? 0 : article.getLikeCount()) + delta);
        else if (type == 2) article.setDislikeCount((article.getDislikeCount() == null ? 0 : article.getDislikeCount()) + delta);
        else if (type == 3) article.setCollectionCount((article.getCollectionCount() == null ? 0 : article.getCollectionCount()) + delta);
        this.updateById(article);
    }

    // 重载方法，用于不需要检查用户交互的场景
    private UserArticleVO convertToVO(UserArticle article) {
        return convertToVO(article, null);
    }
    
    private UserArticleVO convertToVO(UserArticle article, Long currentUserId) {
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
        
        // 检查当前用户是否点赞、踩或收藏
        if (currentUserId != null) {
            LambdaQueryWrapper<ArticleInteraction> likeWrapper = new LambdaQueryWrapper<>();
            likeWrapper.eq(ArticleInteraction::getArticleId, article.getId())
                       .eq(ArticleInteraction::getUserId, currentUserId)
                       .eq(ArticleInteraction::getType, 1);
            vo.setLiked(interactionMapper.selectCount(likeWrapper) > 0);
            
            LambdaQueryWrapper<ArticleInteraction> dislikeWrapper = new LambdaQueryWrapper<>();
            dislikeWrapper.eq(ArticleInteraction::getArticleId, article.getId())
                         .eq(ArticleInteraction::getUserId, currentUserId)
                         .eq(ArticleInteraction::getType, 2);
            vo.setDisliked(interactionMapper.selectCount(dislikeWrapper) > 0);
            
            LambdaQueryWrapper<ArticleInteraction> collectWrapper = new LambdaQueryWrapper<>();
            collectWrapper.eq(ArticleInteraction::getArticleId, article.getId())
                          .eq(ArticleInteraction::getUserId, currentUserId)
                          .eq(ArticleInteraction::getType, 3);
            vo.setCollected(interactionMapper.selectCount(collectWrapper) > 0);
        }
        
        return vo;
    }
    
    // ==================== 评论相关方法 ====================
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> addComment(UserArticleComment comment, Long userId) {
        UserArticle article = this.getById(comment.getArticleId());
        if (article == null) {
            return Result.error("文章不存在");
        }

        User commenter = userMapper.selectById(userId);

        comment.setUserId(userId);
        comment.setLikeCount(0);
        comment.setCreateTime(LocalDateTime.now());
        userArticleCommentMapper.insert(comment);

        // 更新文章评论数
        article.setCommentCount((article.getCommentCount() == null ? 0 : article.getCommentCount()) + 1);
        this.updateById(article);

        // 发送通知给文章作者
        if (article.getUserId() != null && !article.getUserId().equals(userId)) {
            sysMessageService.sendCommentReplyNotification(
                article.getUserId(), userId, commenter != null ? commenter.getNickname() : "某用户",
                commenter != null ? commenter.getHeadPath() : null,
                comment.getId(), article.getId(), article.getTitle(),
                null, null, 1, article.getUserId()
            );
        }

        // 如果是回复，额外通知被回复的人
        if (comment.getParentId() != null && comment.getParentId() != 0 && comment.getReplyToUserId() != null
                && !comment.getReplyToUserId().equals(userId) && !comment.getReplyToUserId().equals(article.getUserId())) {
            sysMessageService.sendCommentReplyNotification(
                comment.getReplyToUserId(), userId, commenter != null ? commenter.getNickname() : "某用户",
                commenter != null ? commenter.getHeadPath() : null,
                comment.getId(), article.getId(), article.getTitle(),
                comment.getReplyToUserId(), null, 1, article.getUserId()
            );
        }

        return Result.success("评论成功");
    }
    
    @Override
    public Result<List<UserArticleCommentVO>> getComments(Long articleId, Long userId) {
        List<UserArticleComment> allComments = userArticleCommentMapper.selectList(
            new LambdaQueryWrapper<UserArticleComment>()
                .eq(UserArticleComment::getArticleId, articleId)
                .orderByDesc(UserArticleComment::getLikeCount, UserArticleComment::getCreateTime));
        
        if (allComments.isEmpty()) {
            return Result.success(Collections.emptyList());
        }
        
        // 获取所有相关用户信息
        List<Long> userIds = allComments.stream()
            .map(UserArticleComment::getUserId)
            .collect(Collectors.toList());
        userIds.addAll(allComments.stream()
            .filter(c -> c.getReplyToUserId() != null)
            .map(UserArticleComment::getReplyToUserId)
            .collect(Collectors.toList()));
        
        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
            .collect(Collectors.toMap(User::getId, u -> u));
        
        // 获取当前用户点赞的评论
        List<Long> likedCommentIds = userId == null ? Collections.emptyList() : 
            userArticleCommentLikeMapper.selectList(
                new LambdaQueryWrapper<UserArticleCommentLike>()
                    .eq(UserArticleCommentLike::getUserId, userId))
            .stream()
            .map(UserArticleCommentLike::getCommentId)
            .collect(Collectors.toList());
        
        // 转换为VO
        List<UserArticleCommentVO> vos = allComments.stream().map(c -> {
            UserArticleCommentVO vo = new UserArticleCommentVO();
            vo.setId(c.getId());
            vo.setArticleId(c.getArticleId());
            vo.setUserId(c.getUserId());
            User user = userMap.get(c.getUserId());
            if (user != null) {
                vo.setNickname(user.getNickname());
                vo.setHeadPath(user.getHeadPath());
            }
            vo.setParentId(c.getParentId());
            vo.setReplyToUserId(c.getReplyToUserId());
            if (c.getReplyToUserId() != null) {
                User replyUser = userMap.get(c.getReplyToUserId());
                if (replyUser != null) {
                    vo.setReplyToNickname(replyUser.getNickname());
                }
            }
            vo.setContent(c.getContent());
            vo.setLikeCount(c.getLikeCount());
            vo.setLiked(likedCommentIds.contains(c.getId()));
            vo.setCreateTime(c.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
        
        // 构建树形结构
        List<UserArticleCommentVO> rootComments = vos.stream()
            .filter(v -> v.getParentId() == 0 || v.getParentId() == null)
            .collect(Collectors.toList());
        
        for (UserArticleCommentVO root : rootComments) {
            root.setReplies(vos.stream()
                .filter(v -> v.getParentId() != null && v.getParentId().equals(root.getId()))
                .collect(Collectors.toList()));
        }
        
        return Result.success(rootComments);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<String> likeComment(Long commentId, Long userId) {
        LambdaQueryWrapper<UserArticleCommentLike> wrapper = new LambdaQueryWrapper<UserArticleCommentLike>()
                .eq(UserArticleCommentLike::getCommentId, commentId)
                .eq(UserArticleCommentLike::getUserId, userId);

        UserArticleCommentLike existing = userArticleCommentLikeMapper.selectOne(wrapper);
        UserArticleComment comment = userArticleCommentMapper.selectById(commentId);
        if (comment == null) {
            return Result.error("评论不存在");
        }

        if (existing != null) {
            userArticleCommentLikeMapper.deleteById(existing.getId());
            comment.setLikeCount(comment.getLikeCount() - 1);
        } else {
            UserArticleCommentLike like = new UserArticleCommentLike();
            like.setCommentId(commentId);
            like.setUserId(userId);
            like.setCreateTime(LocalDateTime.now());
            userArticleCommentLikeMapper.insert(like);
            comment.setLikeCount(comment.getLikeCount() + 1);

            // 发送通知给评论作者
            if (comment.getUserId() != null && !comment.getUserId().equals(userId)) {
                User liker = userMapper.selectById(userId);
                UserArticle article = this.getById(comment.getArticleId());
                if (liker != null && article != null) {
                    sysMessageService.sendCommentLikeNotification(
                        comment.getUserId(), userId, liker.getNickname(), liker.getHeadPath(),
                        commentId, article.getId(), article.getTitle(), 1, article.getUserId()
                    );
                }
            }
        }
        userArticleCommentMapper.updateById(comment);
        return Result.success("操作成功");
    }
}
