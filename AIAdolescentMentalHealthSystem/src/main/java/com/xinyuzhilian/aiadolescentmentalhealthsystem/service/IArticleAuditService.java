package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ArticleAuditLog;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleVO;
import com.baomidou.mybatisplus.extension.service.IService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;

public interface IArticleAuditService extends IService<ArticleAuditLog> {
    PageResult<UserArticleVO> getPendingArticles(Integer page, Integer size);
    
    boolean auditArticle(Long articleId, Integer action, String reason, Long auditorId);
    
    boolean offlineArticle(Long articleId, String reason, Long auditorId);
}
