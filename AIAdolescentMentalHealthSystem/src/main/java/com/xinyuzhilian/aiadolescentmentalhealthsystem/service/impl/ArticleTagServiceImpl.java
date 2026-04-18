package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.ArticleTag;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.ArticleTagMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IArticleTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleTagServiceImpl extends ServiceImpl<ArticleTagMapper, ArticleTag> implements IArticleTagService {

    @Override
    public List<ArticleTag> getAllTags() {
        LambdaQueryWrapper<ArticleTag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ArticleTag::getStatus, 1).orderByAsc(ArticleTag::getSortOrder);
        return this.list(wrapper);
    }

    @Override
    @Transactional
    public ArticleTag addTag(ArticleTag tag) {
        tag.setStatus(1);
        tag.setCreateTime(LocalDateTime.now());
        tag.setUpdateTime(LocalDateTime.now());
        this.save(tag);
        return tag;
    }

    @Override
    @Transactional
    public ArticleTag updateTag(ArticleTag tag) {
        tag.setUpdateTime(LocalDateTime.now());
        this.updateById(tag);
        return tag;
    }

    @Override
    @Transactional
    public boolean deleteTag(Long id) {
        return this.removeById(id);
    }
}
