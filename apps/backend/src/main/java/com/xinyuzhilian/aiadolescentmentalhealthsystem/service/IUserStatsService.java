package com.xinyuzhilian.aiadolescentmentalhealthsystem.service;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.UserStats;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.UserStatsVO;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IUserStatsService extends IService<UserStats> {
    UserStats getStats(Long userId);
    
    UserStatsVO getStatsVO(Long userId);
    
    void updateStats(Long userId, String type, int delta);
    
    void incrementArticleCount(Long userId);
    
    void decrementArticleCount(Long userId);
    
    void incrementLikeCount(Long userId);
    
    void decrementLikeCount(Long userId);
}
