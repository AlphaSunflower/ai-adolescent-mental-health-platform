package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserArticle;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserArticleComment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleVO;
import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;

import java.util.List;

public interface IUserArticleService extends IService<UserArticle> {
    UserArticle publishArticle(UserArticle article, Long userId);
    
    PageResult<UserArticleVO> getMyArticles(Long userId, Integer page, Integer size);
    
    UserArticle updateArticle(UserArticle article, Long userId);
    
    boolean deleteArticle(Long id, Long userId);
    
    boolean withdrawArticle(Long id, Long userId);
    
    UserArticleVO getArticleDetail(Long id, Long userId);
    
    PageResult<UserArticleVO> getArticlesByTag(Long tagId, Integer page, Integer size);
    
    PageResult<UserArticleVO> getAllPublishedArticles(Integer page, Integer size, Long tagId);

    UserArticleVO getArticleDetailByUserAndId(Long userId, Long articleId, Long currentUserId);

    Result<String> offlineArticle(Long articleId, Long auditorId, String reason);

    Result<String> onlineArticle(Long articleId, Long auditorId);

    Result<String> interactArticle(Long articleId, Integer type, Long userId);

    // 评论相关方法
    Result<String> addComment(UserArticleComment comment, Long userId);
    
    Result<List<UserArticleCommentVO>> getComments(Long articleId, Long userId);
    
    Result<String> likeComment(Long commentId, Long userId);
}
