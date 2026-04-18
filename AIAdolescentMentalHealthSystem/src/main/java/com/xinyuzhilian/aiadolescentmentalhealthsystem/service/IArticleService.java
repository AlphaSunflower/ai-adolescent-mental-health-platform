package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Article;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ArticleComment;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.ArticleDetailVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.ArticleCommentVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.ArticleVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import java.util.List;

public interface IArticleService extends IService<Article> {
    PageResult<Article> getArticleList(Integer page, Integer size, String type);
    PageResult<Article> getAdminArticles(Integer page, Integer size, String title, Long userId, Integer role);
    PageResult<ArticleVO> getAllArticlesForAdmin(Integer page, Integer size, String title, Long userId, Integer role);
    Result<String> saveArticle(Article article, Long userId, Integer role);
    Result<String> deleteArticle(Long id, Long userId, Integer role);

    Result<ArticleDetailVO> getArticleDetail(Long id, Long userId);
    Result<String> interact(Long articleId, Integer type, Long userId);
    Result<String> addComment(ArticleComment comment, Long userId);
    Result<List<ArticleCommentVO>> getComments(Long articleId, Long userId);
    Result<String> likeComment(Long commentId, Long userId);
}
