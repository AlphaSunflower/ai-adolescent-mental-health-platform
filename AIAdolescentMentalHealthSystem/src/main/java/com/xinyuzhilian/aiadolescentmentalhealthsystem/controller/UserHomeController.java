package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.annotation.CurrentUserId;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.*;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user/home")
@RequiredArgsConstructor
public class UserHomeController {

    private final UserMapper userMapper;
    private final IUserStatsService userStatsService;
    private final IUserPrivacyService userPrivacyService;
    private final IUserFollowService userFollowService;
    private final UserArticleMapper userArticleMapper;
    private final ArticleInteractionMapper articleInteractionMapper;
    private final ArticleTagMapper articleTagMapper;

    @GetMapping("/{userId}")
    public Result<UserHomeVO> getUserHome(@PathVariable Long userId, @CurrentUserId Long currentUserId) {
        if (userId == null || userId <= 0) {
            return Result.error("无效的用户 ID");
        }
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        UserHomeVO vo = new UserHomeVO();
        vo.setUserId(user.getId());
        vo.setNickname(user.getNickname());
        vo.setHeadPath(user.getHeadPath());
        vo.setSignature(user.getSignature());
        vo.setStats(userStatsService.getStatsVO(userId));
        vo.setPrivacy(userPrivacyService.getPrivacyVO(userId));
        vo.setIsFollowing(userFollowService.isFollowing(currentUserId, userId));
        vo.setIsFollowed(userFollowService.isFollowing(userId, currentUserId));
        
        return Result.success(vo);
    }

    @GetMapping("/{userId}/articles")
    public Result<PageResult<UserArticleVO>> getUserArticles(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        
        if (userId == null || userId <= 0) {
            return Result.error("无效的用户 ID");
        }
        
        UserPrivacySetting privacy = userPrivacyService.getPrivacySetting(userId);
        
        // 检查隐私设置
        if (privacy.getAllowViewArticles() == 0 && !userId.equals(currentUserId)) {
            return Result.error(403, "该用户设置了不允许查看文章");
        }
        
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<UserArticle> wrapper = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        wrapper.eq(UserArticle::getUserId, userId)
               .eq(UserArticle::getStatus, 1)
               .orderByDesc(UserArticle::getCreateTime);
        
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<UserArticle> pageParam = 
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, size);
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<UserArticle> result = 
            userArticleMapper.selectPage(pageParam, wrapper);
        
        List<UserArticleVO> voList = result.getRecords().stream().map(article -> {
            UserArticleVO vo = new UserArticleVO();
            vo.setId(article.getId());
            vo.setUserId(article.getUserId());
            vo.setTitle(article.getTitle());
            vo.setCoverUrl(article.getCoverUrl());
            vo.setTagId(article.getTagId());
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
        }).collect(Collectors.toList());
        
        PageResult<UserArticleVO> pageResult = new PageResult<>();
        pageResult.setRecords(voList);
        pageResult.setTotal(result.getTotal());
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize( result.getSize());
        
        return Result.success(pageResult);
    }

    @GetMapping("/{userId}/likes")
    public Result<PageResult<ArticleInteractionVO>> getUserLikes(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        
        if (userId == null || userId <= 0) {
            return Result.error("无效的用户 ID");
        }
        
        UserPrivacySetting privacy = userPrivacyService.getPrivacySetting(userId);
        
        if (privacy.getAllowViewLikes() == 0 && !userId.equals(currentUserId)) {
            return Result.error(403, "该用户设置了不允许查看点赞");
        }
        
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ArticleInteraction> wrapper = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        wrapper.eq(ArticleInteraction::getUserId, userId)
               .eq(ArticleInteraction::getType, 1)
               .orderByDesc(ArticleInteraction::getCreateTime);
        
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<ArticleInteraction> pageParam = 
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, size);
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<ArticleInteraction> result = 
            articleInteractionMapper.selectPage(pageParam, wrapper);
        
        List<ArticleInteractionVO> voList = result.getRecords().stream().map(interaction -> {
            ArticleInteractionVO vo = new ArticleInteractionVO();
            vo.setArticleId(interaction.getArticleId());
            vo.setCreateTime(interaction.getCreateTime() != null ? interaction.getCreateTime().toString() : null);
            vo.setSource("user"); // 用户文章
            
            UserArticle article = userArticleMapper.selectById(interaction.getArticleId());
            if (article != null) {
                vo.setArticleTitle(article.getTitle());
                vo.setCoverUrl(article.getCoverUrl());
                vo.setAuthorId(article.getUserId());
                
                User author = userMapper.selectById(article.getUserId());
                if (author != null) {
                    vo.setAuthorNickname(author.getNickname());
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

    @GetMapping("/{userId}/followings")
    public Result<PageResult<UserInfoVO>> getUserFollowings(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        
        if (userId == null || userId <= 0) {
            return Result.error("无效的用户 ID");
        }
        
        UserPrivacySetting privacy = userPrivacyService.getPrivacySetting(userId);
        
        if (privacy.getAllowViewFollowings() == 0 && !userId.equals(currentUserId)) {
            return Result.error(403, "该用户设置了不允许查看关注");
        }
        
        return Result.success(userFollowService.getFollowings(userId, page, size));
    }

    @GetMapping("/{userId}/followers")
    public Result<PageResult<UserInfoVO>> getUserFollowers(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        
        if (userId == null || userId <= 0) {
            return Result.error("无效的用户 ID");
        }
        
        UserPrivacySetting privacy = userPrivacyService.getPrivacySetting(userId);
        
        if (privacy.getAllowViewFans() == 0 && !userId.equals(currentUserId)) {
            return Result.error(403, "该用户设置了不允许查看粉丝");
        }
        
        return Result.success(userFollowService.getFollowers(userId, page, size));
    }
}
