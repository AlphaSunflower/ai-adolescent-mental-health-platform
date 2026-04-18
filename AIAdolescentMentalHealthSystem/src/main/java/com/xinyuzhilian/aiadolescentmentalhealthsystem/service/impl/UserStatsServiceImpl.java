package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserStatsVO;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserStats;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.UserStatsMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IUserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserStatsServiceImpl extends ServiceImpl<UserStatsMapper, UserStats> implements IUserStatsService {

    @Override
    public UserStats getStats(Long userId) {
        UserStats stats = this.getById(userId);
        if (stats == null) {
            stats = new UserStats();
            stats.setUserId(userId);
            stats.setFollowCount(0);
            stats.setFanCount(0);
            stats.setArticleCount(0);
            stats.setLikeCount(0);
            stats.setUpdateTime(LocalDateTime.now());
            this.save(stats);
        }
        return stats;
    }

    @Override
    public UserStatsVO getStatsVO(Long userId) {
        UserStats stats = getStats(userId);
        UserStatsVO vo = new UserStatsVO();
        vo.setFollowCount(stats.getFollowCount());
        vo.setFanCount(stats.getFanCount());
        vo.setArticleCount(stats.getArticleCount());
        vo.setLikeCount(stats.getLikeCount());
        return vo;
    }

    @Override
    public void updateStats(Long userId, String type, int delta) {
        UserStats stats = getStats(userId);
        stats.setUpdateTime(LocalDateTime.now());
        
        switch (type) {
            case "follow":
                stats.setFollowCount(Math.max(0, stats.getFollowCount() + delta));
                break;
            case "fan":
                stats.setFanCount(Math.max(0, stats.getFanCount() + delta));
                break;
            case "article":
                stats.setArticleCount(Math.max(0, stats.getArticleCount() + delta));
                break;
            case "like":
                stats.setLikeCount(Math.max(0, stats.getLikeCount() + delta));
                break;
        }
        
        this.updateById(stats);
    }

    @Override
    public void incrementArticleCount(Long userId) {
        updateStats(userId, "article", 1);
    }

    @Override
    public void decrementArticleCount(Long userId) {
        updateStats(userId, "article", -1);
    }

    @Override
    public void incrementLikeCount(Long userId) {
        updateStats(userId, "like", 1);
    }

    @Override
    public void decrementLikeCount(Long userId) {
        updateStats(userId, "like", -1);
    }
}
