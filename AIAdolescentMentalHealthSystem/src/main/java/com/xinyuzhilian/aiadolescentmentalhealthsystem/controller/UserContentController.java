package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.ArticleInteractionVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserArticleVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user/content")
@RequiredArgsConstructor
public class UserContentController {

    private final UserArticleMapper userArticleMapper;
    private final ArticleMapper articleMapper;
    private final ArticleInteractionMapper articleInteractionMapper;
    private final ArticleTagMapper articleTagMapper;
    private final UserMapper userMapper;
    private final UserFollowMapper userFollowMapper;

    @GetMapping("/articles")
    public Result<PageResult<UserArticleVO>> getMyPublishedArticles(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        
        LambdaQueryWrapper<UserArticle> wrapper =
            new LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getUserId, userId)
               .orderByDesc(UserArticle::getCreateTime);
        
        Page<UserArticle> pageParam =
            new Page<>(page, size);
        Page<UserArticle> result =
            userArticleMapper.selectPage(pageParam, wrapper);
        
        List<UserArticleVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        
        PageResult<UserArticleVO> pageResult = new PageResult<>();
        pageResult.setRecords(voList);
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        
        return Result.success(pageResult);
    }

    @GetMapping("/likes")
    public Result<PageResult<ArticleInteractionVO>> getMyLikes(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        LambdaQueryWrapper<ArticleInteraction> wrapper =
            new LambdaQueryWrapper<>();
        wrapper.eq(ArticleInteraction::getUserId, userId)
               .eq(ArticleInteraction::getType, 1)
               .orderByDesc(ArticleInteraction::getCreateTime);

        Page<ArticleInteraction> pageParam =
            new Page<>(page, size);
        Page<ArticleInteraction> result =
            articleInteractionMapper.selectPage(pageParam, wrapper);

        List<ArticleInteractionVO> voList = result.getRecords().stream().map(interaction -> {
            ArticleInteractionVO vo = new ArticleInteractionVO();
            vo.setArticleId(interaction.getArticleId());
            vo.setCreateTime(interaction.getCreateTime() != null ? interaction.getCreateTime().toString() : null);

            // 先尝试查询用户文章
            UserArticle userArticle = userArticleMapper.selectById(interaction.getArticleId());
            if (userArticle != null) {
                // 是用户文章
                vo.setSource("user");
                vo.setArticleTitle(userArticle.getTitle());
                vo.setCoverUrl(userArticle.getCoverUrl());
                vo.setAuthorId(userArticle.getUserId());

                User author = userMapper.selectById(userArticle.getUserId());
                if (author != null) {
                    vo.setAuthorNickname(author.getNickname());
                    vo.setAuthorRole(author.getRole());
                }
            } else {
                // 查询管理员文章
                Article adminArticle = articleMapper.selectById(interaction.getArticleId());
                if (adminArticle != null) {
                    // 是管理员文章
                    vo.setSource("admin");
                    vo.setArticleTitle(adminArticle.getTitle());
                    vo.setCoverUrl(adminArticle.getCoverUrl());
                    vo.setAuthorId(adminArticle.getAuthorId());

                    User author = userMapper.selectById(adminArticle.getAuthorId());
                    if (author != null) {
                        vo.setAuthorNickname(author.getNickname());
                        vo.setAuthorRole(author.getRole());
                    }
                }
            }

            return vo;
        }).collect(Collectors.toList());

        PageResult<ArticleInteractionVO> pageResult = new PageResult<>();
        pageResult.setRecords(voList);
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());

        return Result.success(pageResult);
    }

    @GetMapping("/collections")
    public Result<PageResult<ArticleInteractionVO>> getMyCollections(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        LambdaQueryWrapper<ArticleInteraction> wrapper =
            new LambdaQueryWrapper<>();
        wrapper.eq(ArticleInteraction::getUserId, userId)
               .eq(ArticleInteraction::getType, 3)
               .orderByDesc(ArticleInteraction::getCreateTime);

        Page<ArticleInteraction> pageParam =
            new Page<>(page, size);
        Page<ArticleInteraction> result =
            articleInteractionMapper.selectPage(pageParam, wrapper);

        List<ArticleInteractionVO> voList = result.getRecords().stream().map(interaction -> {
            ArticleInteractionVO vo = new ArticleInteractionVO();
            vo.setArticleId(interaction.getArticleId());
            vo.setCreateTime(interaction.getCreateTime() != null ? interaction.getCreateTime().toString() : null);

            // 先尝试查询用户文章
            UserArticle userArticle = userArticleMapper.selectById(interaction.getArticleId());
            if (userArticle != null) {
                // 是用户文章
                vo.setSource("user");
                vo.setArticleTitle(userArticle.getTitle());
                vo.setCoverUrl(userArticle.getCoverUrl());
                vo.setAuthorId(userArticle.getUserId());

                User author = userMapper.selectById(userArticle.getUserId());
                if (author != null) {
                    vo.setAuthorNickname(author.getNickname());
                    vo.setAuthorRole(author.getRole());
                }
            } else {
                // 查询管理员文章
                Article adminArticle = articleMapper.selectById(interaction.getArticleId());
                if (adminArticle != null) {
                    // 是管理员文章
                    vo.setSource("admin");
                    vo.setArticleTitle(adminArticle.getTitle());
                    vo.setCoverUrl(adminArticle.getCoverUrl());
                    vo.setAuthorId(adminArticle.getAuthorId());

                    User author = userMapper.selectById(adminArticle.getAuthorId());
                    if (author != null) {
                        vo.setAuthorNickname(author.getNickname());
                        vo.setAuthorRole(author.getRole());
                    }
                }
            }

            return vo;
        }).collect(Collectors.toList());

        PageResult<ArticleInteractionVO> pageResult = new PageResult<>();
        pageResult.setRecords(voList);
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());

        return Result.success(pageResult);
    }

    @GetMapping("/follow-articles")
    public Result<PageResult<UserArticleVO>> getFollowArticles(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        
        // 获取当前用户关注的所有用户ID
        LambdaQueryWrapper<UserFollow> followWrapper =
            new LambdaQueryWrapper<>();
        followWrapper.eq(UserFollow::getFollowerId, userId);
        List<UserFollow> followings = userFollowMapper.selectList(followWrapper);
        
        if (followings.isEmpty()) {
            PageResult<UserArticleVO> emptyResult = new PageResult<>();
            emptyResult.setRecords(new java.util.ArrayList<>());
            emptyResult.setTotal(0L);
            emptyResult.setCurrent((long)page);
            emptyResult.setSize((long)size);
            return Result.success(emptyResult);
        }
        
        List<Long> followingIds = followings.stream()
                .map(UserFollow::getFollowingId)
                .collect(Collectors.toList());
        
        LambdaQueryWrapper<UserArticle> wrapper =
            new LambdaQueryWrapper<>();
        wrapper.in(UserArticle::getUserId, followingIds)
               .eq(UserArticle::getStatus, 1)
               .orderByDesc(UserArticle::getCreateTime);
        
        Page<UserArticle> pageParam =
            new Page<>(page, size);
        Page<UserArticle> result =
            userArticleMapper.selectPage(pageParam, wrapper);
        
        List<UserArticleVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        
        PageResult<UserArticleVO> pageResult = new PageResult<>();
        pageResult.setRecords(voList);
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent( result.getCurrent());
        pageResult.setSize(result.getSize());
        
        return Result.success(pageResult);
    }

    private UserArticleVO convertToVO(UserArticle article) {
        UserArticleVO vo = new UserArticleVO();
        vo.setId(article.getId());
        vo.setUserId(article.getUserId());
        vo.setTitle(article.getTitle());
        vo.setCoverUrl(article.getCoverUrl());
        vo.setTagId(article.getTagId());
        vo.setStatus(article.getStatus());
        vo.setRejectReason(article.getRejectReason());
        vo.setLikeCount(article.getLikeCount());
        vo.setCommentCount(article.getCommentCount());
        vo.setViewCount(article.getViewCount());
        vo.setCreateTime(article.getCreateTime() != null ? article.getCreateTime().toString() : null);
        
        if (article.getTagId() != null) {
            ArticleTag tag = articleTagMapper.selectById(article.getTagId());
            if (tag != null) {
                vo.setTagName(tag.getName());
            }
        }
        
        User author = userMapper.selectById(article.getUserId());
        if (author != null) {
            vo.setUserNickname(author.getNickname());
            vo.setUserAvatar(author.getHeadPath());
        }
        
        return vo;
    }
}
