package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ArticleTag;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface IArticleTagService extends IService<ArticleTag> {
    List<ArticleTag> getAllTags();
    
    ArticleTag addTag(ArticleTag tag);
    
    ArticleTag updateTag(ArticleTag tag);
    
    boolean deleteTag(Long id);
}
